import type { ReasonCategory } from "@/types";
import { parseTime } from "@/lib/time";
import type { ExplainInput, ExplainOutput } from "./types";

const MAX_ROOM_LABEL_LENGTH = 200;
const MAX_REASON_LENGTH = 1000;
const MAX_EXPLANATION_LENGTH = 500;
export const MOCK_DELAY_MS = 300;

const VALID_REASON_CODES: ReadonlySet<ReasonCategory> = new Set([
  "invalid-interval",
  "start-in-past",
  "too-long",
  "room-blocked",
  "time-overlap",
  "input-error",
  "ok",
]);

export function validateExplainInput(input: unknown): ExplainInput {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input: expected an object.");
  }

  const obj = input as Record<string, unknown>;

  if (
    typeof obj.roomLabel !== "string" ||
    obj.roomLabel.trim() === ""
  ) {
    throw new Error("Invalid input: roomLabel must be a non-empty string.");
  }
  if (obj.roomLabel.length > MAX_ROOM_LABEL_LENGTH) {
    throw new Error(
      `Invalid input: roomLabel exceeds ${MAX_ROOM_LABEL_LENGTH} characters.`
    );
  }

  if (
    typeof obj.startTime !== "string" ||
    Number.isNaN(parseTime(obj.startTime))
  ) {
    throw new Error("Invalid input: startTime must be a valid HH:MM string.");
  }

  if (
    typeof obj.endTime !== "string" ||
    Number.isNaN(parseTime(obj.endTime))
  ) {
    throw new Error("Invalid input: endTime must be a valid HH:MM string.");
  }

  if (typeof obj.isAvailable !== "boolean") {
    throw new Error("Invalid input: isAvailable must be a boolean.");
  }

  if (
    typeof obj.reasonCode !== "string" ||
    !VALID_REASON_CODES.has(obj.reasonCode as ReasonCategory)
  ) {
    throw new Error("Invalid input: reasonCode is not a supported value.");
  }

  if (
    typeof obj.deterministicReason !== "string" ||
    obj.deterministicReason.trim() === ""
  ) {
    throw new Error(
      "Invalid input: deterministicReason must be a non-empty string."
    );
  }
  if (obj.deterministicReason.length > MAX_REASON_LENGTH) {
    throw new Error(
      `Invalid input: deterministicReason exceeds ${MAX_REASON_LENGTH} characters.`
    );
  }

  return {
    roomLabel: obj.roomLabel,
    startTime: obj.startTime,
    endTime: obj.endTime,
    isAvailable: obj.isAvailable,
    reasonCode: obj.reasonCode as ReasonCategory,
    deterministicReason: obj.deterministicReason,
  };
}

export function validateExplainOutput(output: unknown): ExplainOutput {
  if (typeof output !== "object" || output === null) {
    throw new Error("Invalid output: expected an object.");
  }

  const obj = output as Record<string, unknown>;

  if (
    typeof obj.explanation !== "string" ||
    obj.explanation.trim() === ""
  ) {
    throw new Error(
      "Invalid output: explanation must be a non-empty string."
    );
  }
  if (obj.explanation.length > MAX_EXPLANATION_LENGTH) {
    throw new Error(
      `Invalid output: explanation exceeds ${MAX_EXPLANATION_LENGTH} characters.`
    );
  }

  return { explanation: obj.explanation };
}

function buildExplanation(input: ExplainInput): string {
  const { roomLabel, startTime, endTime, isAvailable, reasonCode } = input;

  if (isAvailable) {
    return `${roomLabel} is free from ${startTime} to ${endTime}, so you can go ahead and book it. The slot fits within the 120-minute limit and doesn't clash with any existing bookings.`;
  }

  switch (reasonCode) {
    case "invalid-interval":
      return "The time slot you entered isn't valid. Please make sure the start is before the end and both are within 00:00 to 24:00, then check again.";
    case "start-in-past":
      return "The start time you chose has already passed. Please pick a start time after the current time and try again.";
    case "too-long":
      return "Your requested slot is longer than the 120-minute maximum. Please shorten it and check availability again.";
    case "room-blocked":
      return `${roomLabel} is currently blocked and can't be booked. Please pick a different room from the list above.`;
    case "time-overlap":
      return `${roomLabel} already has a booking that overlaps with ${startTime} to ${endTime}. Please choose a different time slot that doesn't clash.`;
    case "input-error":
      return "Some of the details entered are missing or invalid. Please select a room and enter valid times before checking availability.";
    default:
      return input.deterministicReason;
  }
}

export async function generateExplanation(
  rawInput: unknown,
  delayMs: number = MOCK_DELAY_MS
): Promise<ExplainOutput> {
  const input = validateExplainInput(rawInput);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const rawOutput: ExplainOutput = { explanation: buildExplanation(input) };

  return validateExplainOutput(rawOutput);
}
