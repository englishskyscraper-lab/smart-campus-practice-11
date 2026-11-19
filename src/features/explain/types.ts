import type { ReasonCategory } from "@/types";

export interface ExplainInput {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ReasonCategory;
  deterministicReason: string;
}

export interface ExplainOutput {
  explanation: string;
}
