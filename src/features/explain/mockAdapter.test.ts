import { describe, expect, test } from "vitest";
import { generateExplanation, validateExplainInput, validateExplainOutput } from "./mockAdapter";
import type { ExplainInput } from "./types";

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

describe("validateExplainInput", () => {
  test("accepts a well-formed input", () => {
    const input = makeInput();
    const result = validateExplainInput(input);
    expect(result).toEqual(input);
  });

  test("rejects non-object input", () => {
    expect(() => validateExplainInput(null)).toThrow(/expected an object/);
    expect(() => validateExplainInput("hello")).toThrow(/expected an object/);
  });

  test("rejects missing or empty room label", () => {
    expect(() => validateExplainInput(makeInput({ roomLabel: "" }))).toThrow(
      /roomLabel/
    );
    expect(() => validateExplainInput(makeInput({ roomLabel: "   " }))).toThrow(
      /roomLabel/
    );
  });

  test("rejects room label exceeding length limit", () => {
    expect(() =>
      validateExplainInput(makeInput({ roomLabel: "x".repeat(201) }))
    ).toThrow(/exceeds/);
  });

  test("rejects malformed start time", () => {
    expect(() => validateExplainInput(makeInput({ startTime: "25:00" }))).toThrow(
      /startTime/
    );
    expect(() => validateExplainInput(makeInput({ startTime: "abc" }))).toThrow(
      /startTime/
    );
  });

  test("rejects malformed end time", () => {
    expect(() => validateExplainInput(makeInput({ endTime: "99:99" }))).toThrow(
      /endTime/
    );
  });

  test("rejects non-boolean isAvailable", () => {
    expect(() =>
      validateExplainInput(makeInput({ isAvailable: "yes" as unknown as boolean }))
    ).toThrow(/isAvailable/);
  });

  test("rejects unsupported reason code", () => {
    expect(() =>
      validateExplainInput(
        makeInput({ reasonCode: "made-up" as ExplainInput["reasonCode"] })
      )
    ).toThrow(/reasonCode/);
  });

  test("rejects missing or empty deterministicReason", () => {
    expect(() =>
      validateExplainInput(makeInput({ deterministicReason: "" }))
    ).toThrow(/deterministicReason/);
  });
});

describe("validateExplainOutput", () => {
  test("accepts a valid output object", () => {
    const result = validateExplainOutput({ explanation: "Room is free." });
    expect(result.explanation).toBe("Room is free.");
  });

  test("rejects non-object output", () => {
    expect(() => validateExplainOutput(null)).toThrow(/expected an object/);
    expect(() => validateExplainOutput("text")).toThrow(/expected an object/);
  });

  test("rejects empty explanation", () => {
    expect(() => validateExplainOutput({ explanation: "" })).toThrow(
      /non-empty/
    );
    expect(() => validateExplainOutput({ explanation: "  " })).toThrow(
      /non-empty/
    );
  });

  test("rejects explanation exceeding 500 characters", () => {
    expect(() =>
      validateExplainOutput({ explanation: "x".repeat(501) })
    ).toThrow(/exceeds/);
  });

  test("rejects non-string explanation", () => {
    expect(() => validateExplainOutput({ explanation: 42 })).toThrow(
      /non-empty/
    );
  });
});

describe("generateExplanation", () => {
  test("available room — returns a student-friendly explanation agreeing with the result", async () => {
    const output = await generateExplanation(makeInput());
    expect(output.explanation).toContain("Room A-101");
    expect(output.explanation).toContain("free");
    expect(output.explanation.length).toBeLessThanOrEqual(500);
    const sentences = output.explanation.split(".").filter((s) => s.trim());
    expect(sentences.length).toBeLessThanOrEqual(2);
  });

  test("unavailable room (time-overlap) — mentions the clash and the slot", async () => {
    const output = await generateExplanation(
      makeInput({
        isAvailable: false,
        reasonCode: "time-overlap",
        deterministicReason:
          "The requested time overlaps with an existing booking: \"Physics Lab\" (12:00–13:00).",
      })
    );
    expect(output.explanation).toContain("overlap");
    expect(output.explanation.length).toBeLessThanOrEqual(500);
  });

  test("blocked room — tells the student to pick a different room", async () => {
    const output = await generateExplanation(
      makeInput({
        isAvailable: false,
        reasonCode: "room-blocked",
        deterministicReason: "This room is currently blocked.",
      })
    );
    expect(output.explanation).toContain("blocked");
    expect(output.explanation).toContain("Room A-101");
  });

  test("too-long — mentions the 120-minute limit", async () => {
    const output = await generateExplanation(
      makeInput({
        isAvailable: false,
        reasonCode: "too-long",
        deterministicReason: "The booking is 180 minutes long.",
      })
    );
    expect(output.explanation).toContain("120");
  });

  test("start-in-past — tells the student to pick a later start", async () => {
    const output = await generateExplanation(
      makeInput({
        isAvailable: false,
        reasonCode: "start-in-past",
        deterministicReason: "The start time must be after the current time.",
      })
    );
    expect(output.explanation).toContain("already passed");
  });

  test("invalid-interval — asks for valid times", async () => {
    const output = await generateExplanation(
      makeInput({
        isAvailable: false,
        reasonCode: "invalid-interval",
        deterministicReason: "The start time must be before the end time.",
      })
    );
    expect(output.explanation).toContain("valid");
  });

  test("input-error — asks to select a room and enter valid times", async () => {
    const output = await generateExplanation(
      makeInput({
        isAvailable: false,
        reasonCode: "input-error",
        deterministicReason: "Please select a room.",
      })
    );
    expect(output.explanation).toContain("valid");
  });

  test("rejects malformed input and throws", async () => {
    await expect(
      generateExplanation({ ...makeInput(), roomLabel: "" })
    ).rejects.toThrow(/roomLabel/);
  });
});
