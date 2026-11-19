// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useExplanation } from "./useExplanation";
import { generateExplanation } from "./mockAdapter";
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
});
