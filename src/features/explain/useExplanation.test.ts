// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useExplanation } from "./useExplanation";
import { generateExplanation, MOCK_DELAY_MS } from "./mockAdapter";
import type { ExplainInput } from "./types";

vi.mock("./mockAdapter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./mockAdapter")>();
  return { ...actual, generateExplanation: vi.fn(actual.generateExplanation) };
});

function makeInput(overrides: Partial<ExplainInput> = {}): ExplainInput {
  return {
    roomLabel: "Room A-101",
    startTime: "11:00",
    endTime: "12:00",
    isAvailable: true,
    reasonCode: "ok",
    deterministicReason: "Room is available from 11:00 to 12:00 (60 min).",
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useExplanation", () => {
  test("generate — produces an explanation for an available room", async () => {
    const { result } = renderHook(() => useExplanation());

    await act(async () => {
      await result.current.generate(makeInput());
    });

    expect(result.current.explanation).not.toBeNull();
    expect(result.current.explanation).toContain("Room A-101");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("generate — falls back to deterministic reason when the adapter throws", async () => {
    const { result } = renderHook(() => useExplanation());
    const badInput = makeInput({ roomLabel: "" });

    await act(async () => {
      await result.current.generate(badInput);
    });

    expect(result.current.explanation).toBeNull();
    expect(result.current.error).toBe(badInput.deterministicReason);
    expect(result.current.loading).toBe(false);
  });

  test("generate — prevents duplicate requests while loading", async () => {
    const { result } = renderHook(() => useExplanation());
    const input = makeInput();

    await act(async () => {
      result.current.generate(input);
      result.current.generate(input);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.explanation).not.toBeNull();
  });

  test("generate — falls back to the deterministic result when the adapter fails for valid input", async () => {
    const { result } = renderHook(() => useExplanation());
    const input = makeInput();
    vi.mocked(generateExplanation).mockRejectedValueOnce(
      new Error("simulated adapter failure")
    );

    await act(async () => {
      await result.current.generate(input);
    });

    expect(result.current.explanation).toBeNull();
    expect(result.current.error).toBe(input.deterministicReason);
    expect(result.current.loading).toBe(false);
  });

  test("clear — resets explanation, loading, and error", async () => {
    const { result } = renderHook(() => useExplanation());

    await act(async () => {
      await result.current.generate(makeInput());
    });
    expect(result.current.explanation).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.explanation).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test("generate — simulates a timeout and falls back to deterministic reason", async () => {
    const { result } = renderHook(() => useExplanation());
    const input = makeInput();
    // Override the mock to use a delay longer than the timeout we will pass
    vi.mocked(generateExplanation).mockImplementationOnce(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ explanation: "late explanation" });
        }, MOCK_DELAY_MS * 10);
      })
    );

    await act(async () => {
      // timeout of 50ms — adapter won't resolve in time
      await result.current.generate(input, 50);
    });

    expect(result.current.explanation).toBeNull();
    expect(result.current.error).toBe(input.deterministicReason);
    expect(result.current.loading).toBe(false);
  });

  test("generate — timeout cleanup: loading is false and no duplicate requests are accepted after timeout", async () => {
    const { result } = renderHook(() => useExplanation());
    const input = makeInput();

    vi.mocked(generateExplanation).mockImplementationOnce(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ explanation: "late explanation" });
        }, MOCK_DELAY_MS * 10);
      })
    );

    await act(async () => {
      await result.current.generate(input, 50);
    });

    expect(result.current.loading).toBe(false);

    // A second generate call should be accepted now that loading cleared
    vi.mocked(generateExplanation).mockImplementationOnce(() =>
      Promise.resolve({ explanation: "second explanation" })
    );

    await act(async () => {
      await result.current.generate(input, 5000);
    });

    expect(result.current.explanation).toBe("second explanation");
    expect(result.current.loading).toBe(false);
  });

  test("generate — normal completion within timeout produces an explanation", async () => {
    const { result } = renderHook(() => useExplanation());
    const input = makeInput();

    // default mock resolves in ~300ms; give a generous 5000ms timeout
    await act(async () => {
      await result.current.generate(input, 5000);
    });

    expect(result.current.explanation).not.toBeNull();
    expect(result.current.explanation).toContain("Room A-101");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("generate — a stale request from before clear() cannot clobber a later request's timeout or state", async () => {
    const { result } = renderHook(() => useExplanation());

    const firstInput = makeInput({ roomLabel: "Room First" });
    const secondInput = makeInput({
      roomLabel: "Room Second",
      deterministicReason: "Second room fallback reason.",
    });

    // First adapter resolves after 50ms (still pending when we clear()).
    vi.mocked(generateExplanation).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ explanation: "STALE first explanation" }), 50);
        })
    );
    // Second adapter is slow so the second request must rely on its timeout.
    vi.mocked(generateExplanation).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ explanation: "second explanation" }), 2000);
        })
    );

    // Start the first request (long timeout so it doesn't time out).
    act(() => {
      result.current.generate(firstInput, 5000);
    });

    // Clear while the first adapter is still pending, then start a second
    // request with a short timeout.
    act(() => {
      result.current.clear();
    });
    act(() => {
      result.current.generate(secondInput, 100);
    });

    // The second request should time out and fall back to its deterministic
    // reason — the stale first request must not clear its timer or overwrite
    // its state.
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.explanation).not.toBe("STALE first explanation");
    expect(result.current.explanation).toBeNull();
    expect(result.current.error).toBe(secondInput.deterministicReason);
  });

  test("generate — timeout does not overwrite a successful result that arrived first", async () => {
    const { result } = renderHook(() => useExplanation());
    const input = makeInput();

    // adapter resolves immediately; timeout is long
    vi.mocked(generateExplanation).mockImplementationOnce(() =>
      Promise.resolve({ explanation: "fast explanation" })
    );

    await act(async () => {
      await result.current.generate(input, 5000);
    });

    expect(result.current.explanation).toBe("fast explanation");
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test("generate — a stale request that resolves after a later request succeeded cannot overwrite its explanation", async () => {
    const { result } = renderHook(() => useExplanation());

    const firstInput = makeInput({ roomLabel: "Room First" });
    const secondInput = makeInput({ roomLabel: "Room Second" });

    // First adapter is slow (still pending when clear() runs and long after).
    vi.mocked(generateExplanation).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ explanation: "STALE first explanation" }), 400);
        })
    );
    // Second adapter resolves quickly and should win.
    vi.mocked(generateExplanation).mockImplementationOnce(() =>
      Promise.resolve({ explanation: "second explanation" })
    );

    act(() => {
      result.current.generate(firstInput, 5000);
    });
    act(() => {
      result.current.clear();
    });
    await act(async () => {
      await result.current.generate(secondInput, 5000);
    });

    expect(result.current.explanation).toBe("second explanation");

    // The stale first request resolves afterwards; it must not overwrite
    // the second request's explanation or change loading/error state.
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(result.current.explanation).toBe("second explanation");
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
