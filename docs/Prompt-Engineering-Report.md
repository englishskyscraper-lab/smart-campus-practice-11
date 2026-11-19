# Practice 11 — Task 04: Prompt Engineering Report

**Project:** Smart Campus Room Availability Checker
**Date:** 2026-11-19

---

## Scope and constraints

This report compares three candidate system prompts for the "Explain Availability" feature. The application code was **not** modified for this task:

- `checkAvailability()` remains the only source of truth for availability decisions. A prompt can only reword an already-determined result.
- No real AI API is connected. The app uses a mock adapter (`src/features/explain/mockAdapter.ts`), so all "actual behavior" below is **expected behavior derived from the prompts and the adapter's validation rules**, not observed LLM output. Actual-vs-expected is labeled explicitly throughout.
- The adapter's existing validation constrains any prompt: input fields are `roomLabel`, `startTime`, `endTime`, `isAvailable`, `reasonCode`, `deterministicReason`; output must be JSON `{"explanation": "..."}` with a non-empty string of at most 500 characters.

---

## Prompt 1 — Basic

```
Explain the room availability result using the supplied information. Be clear, short and friendly. Do not invent information. Return JSON: {"explanation": "your explanation"}.
```

## Prompt 2 — Detailed

```
You are a helpful Smart Campus assistant. Explain the supplied availability result in no more than two sentences. Use only supplied information. Respect isAvailable and reasonCode. Never invent bookings, times or room details or override the availability decision. Use clear, student-friendly language. Return valid JSON.
```

## Prompt 3 — Strict

```
You are an explanation assistant for a university room availability system. Explain an already-determined result using only roomLabel, startTime, endTime, isAvailable, reasonCode and deterministicReason.

Rules:
Never determine or change availability.
isAvailable is authoritative.
Explain only the supplied reason and reasonCode.
Never invent details.
If information is missing or inconsistent, return a safe error.
Use no more than two short sentences.
Use respectful, student-friendly language.
Return only valid JSON: {"explanation": "your explanation"}.
```

---

## Test examples

Both prompts are evaluated against the same two inputs, taken from the app's real fixtures.

**Example A — available room**

```json
{
  "roomLabel": "Room A-101",
  "startTime": "11:00",
  "endTime": "12:00",
  "isAvailable": true,
  "reasonCode": "ok",
  "deterministicReason": "Room is available from 11:00 to 12:00 (60 min)."
}
```

**Example B — unavailable room (time overlap)**

```json
{
  "roomLabel": "Room B-204",
  "startTime": "12:30",
  "endTime": "13:30",
  "isAvailable": false,
  "reasonCode": "time-overlap",
  "deterministicReason": "The requested time overlaps with an existing booking: \"Physics Lab\" (12:00–13:00). Choose a non-overlapping slot."
}
```

---

## Expected explanations

What a correct response should contain for each example, for each prompt. These are **expected behaviors, not actual LLM results** (see the mock-adapter note above).

| | Example A (available) | Example B (overlap) |
| --- | --- | --- |
| **Expected explanation (ideal)** | "Room A-101 is free from 11:00 to 12:00, so you can go ahead and book it." | "Room B-204 already has a booking that overlaps with 12:30 to 13:30. Please choose a different time slot that doesn't clash." |
| Must include | Room label, the slot, and agreement with `isAvailable: true` | Room label, the clash, and agreement with `isAvailable: false`; must not suggest the room is free |
| Must not include | Invented bookings, extra times, booking creation ("I've booked it for you") | Invented booking titles beyond "Physics Lab" (which is in `deterministicReason`), a changed decision, made-up availability |

---

## Prompt-by-prompt evaluation

Scores are qualitative: Weak / Adequate / Strong. Consistency means the same prompt would yield the same shape of answer across both examples.

| Criterion | Prompt 1 (Basic) | Prompt 2 (Detailed) | Prompt 3 (Strict) |
| --- | --- | --- | --- |
| **Clarity** | Adequate — states the task but never says what "the supplied information" contains or how long "short" is. | Adequate — clear on tone and length (two sentences) but the input fields are only implied. | Strong — names the exact input fields, sets length, tone, and output format explicitly. |
| **Consistency** | Weak — "short and friendly" is open to interpretation; one call might return one sentence, another a paragraph. JSON shape given but "valid JSON" output not enforced beyond the example. | Adequate — two-sentence cap and "respect isAvailable and reasonCode" reduce drift, but there is no rule for malformed input. | Strong — enumerated rules cover decision authority, detail invention, error handling, length, tone, and output format. |
| **Factual agreement** | Weak — "do not invent information" helps, but nothing makes `isAvailable` authoritative, so a prompt could soften "unavailable" into "might be available". | Adequate — "never override the availability decision" binds the output to the result. | Strong — `isAvailable` is declared authoritative and a safe-error path exists for inconsistent input, the exact failure mode where agreement matters most. |
| **Output format** | JSON shape shown. | "Return valid JSON" but no shape given — a model could return `{"text": "..."}`. | Exact shape restated with "Return only valid JSON". |

### Factual-agreement risk on Example B (the decisive test)

| Prompt | Risk of a factually wrong explanation |
| --- | --- |
| 1 — Basic | Highest. Nothing anchors the explanation to `isAvailable`; "friendly" nudges toward hedged or softened wording ("should be free around then"). |
| 2 — Detailed | Low. The decision is bound, but without a safe-error rule, a malformed or self-contradictory input could still be explained anyway. |
| 3 — Strict | Lowest. Contradictory input routes to a safe error instead of a plausible-sounding wrong answer. |

---

## Recommendation

**Prompt 3 (Strict) is the strongest** and is the one this project should adopt if a real model is ever connected.

1. **Decision authority is explicit.** `isAvailable` is declared authoritative and the prompt may never determine or change availability — this mirrors the application's own rule that `checkAvailability()` is the single source of truth.
2. **It has a failure mode.** Only Prompt 3 says what to do when information is missing or inconsistent: return a safe error. Prompts 1 and 2 assume the input is always well-formed, which is exactly where hallucinated explanations enter.
3. **It is the most testable.** Named input fields, a two-sentence cap, and an exact JSON shape make a response mechanically checkable — the same contract `validateExplainInput` and `validateExplainOutput` already enforce in the adapter.
4. **The output contract matches the adapter.** `{"explanation": "..."}`, max two short sentences, stays within the 500-character validation limit with room to spare.

Prompt 2 is an acceptable runner-up and would likely produce compliant output, but it lacks the error rule and the exact JSON shape. Prompt 1 is not sufficient on its own: it is fine for Example A but gives the model the most room to drift on Example B.

---

## Expected vs. actual: the mock-adapter boundary

The project currently **does not** call any LLM. `src/features/explain/mockAdapter.ts` simulates the model: it validates the input, waits ~300 ms, and returns a templated explanation built from the validated fields, with the output validated against the same 500-character limit.

Consequences for this report:

- The "expected explanations" table describes what a compliant LLM response **should** look like under each prompt.
- The explanations users actually see in the app are produced by the mock adapter's templates (tested in `mockAdapter.test.ts` and `useExplanation.test.ts`), not by any of these prompts.
- Therefore **no claim in this report is an observed LLM result**. To turn this evaluation into real evidence, connect a model behind the same adapter interface, run Examples A and B through each prompt, and record the actual outputs next to the expected ones.

The adapter's validation layer is what makes prompt quality less critical here: even a weak prompt (Prompt 1) cannot inject a different decision, because the mock — like a real adapter would — receives the already-determined result and can only reword it. The prompt still matters, though: it governs whether that rewording is accurate and consistent.

---

## Summary

| Item | Result |
| --- | --- |
| Prompts compared | 3 (Basic, Detailed, Strict) |
| Test examples | 2 (available, unavailable-with-overlap) |
| Recommended prompt | Prompt 3 (Strict) |
| Application logic modified | None |
| Real AI API connected | None — mock adapter only |
| Actual LLM results recorded | None — all results above are expected behavior, clearly labeled |

---

*This report is a documentation artifact. No application source code, tests, or configuration were modified, and no external AI service was contacted.*
