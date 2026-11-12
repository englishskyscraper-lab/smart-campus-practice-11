# Risk Register: Smart Campus Room Availability Checker

**Practice 10 — Risk Register**
**Project:** Smart Campus Room Availability Checker
**Date:** 2026-11-12
**Prepared by:** Software Engineering Documentation Assistant

---

## Scope and Constraints

This risk register covers five independently verified findings (RISK-01 through RISK-05) identified during evidence-based review of the Smart Campus Room Availability Checker codebase.

The following project constraints are preserved throughout this document:

- **AC1–AC6 acceptance criteria** are referenced as cited in `src/lib/availability.ts` and `src/lib/availability.test.ts`. No acceptance criteria are modified or replaced.
- **No backend, login, or database.** The application uses fictional in-memory data only. `AGENTS.md` states: "Preserve AC1–AC6; no backend, login or booking creation." `README.md` states: "The data is fictional and kept in memory. The app has no backend, no login, and does not create bookings."
- **No application source code is modified.** This document records findings and proposes mitigations only. No mitigation is implemented in this pass.

---

## Current Defects vs. Future Structural Risks

| Classification | Risks | Description |
|---|---|---|
| **Current defect** | RISK-01, RISK-03 | Present today in the running application. A user can trigger the problem under normal use without any future code change. |
| **Future structural risk** | RISK-02, RISK-04, RISK-05 | Latent maintainability or configuration issues. The application functions correctly today, but the condition creates a predictable failure path for future development. |

This distinction is applied in the Consequence and Proposed Mitigation fields below.

---

## Risk Scoring Method

Each risk is scored on two dimensions:

- **Likelihood (1–3):** 1 = unlikely, 2 = possible, 3 = likely. Reflects the probability of the event occurring under normal use or typical maintenance activity.
- **Impact (1–3):** 1 = minor, 2 = moderate, 3 = severe. Reflects the severity of the consequence on users, correctness, or maintainability.
- **Risk score:** Likelihood × Impact.

All five risks use provisional scores as specified. Ties are broken by engineering judgment, explained in the ranking section below.

---

## Risk Entries

### RISK-01: Missing React Error Boundary

| Field | Value |
|---|---|
| **ID** | RISK-01 |
| **Category** | Runtime resilience |
| **Classification** | Current defect |
| **Cause** | The application root (`src/main.tsx`) renders `<App />` inside `<StrictMode>` but does not wrap it in a React Error Boundary component. No `ErrorBoundary`, `componentDidCatch`, or equivalent error-boundary pattern exists anywhere in the source tree. |
| **Event** | Any uncaught runtime error during render (e.g., an unexpected `undefined` from malformed data, a failed `.find()` returning `null`, or a type mismatch at runtime) propagates to the React root and unmounts the entire application. |
| **Consequence** | The user sees a blank white screen with no recovery path. There is no fallback UI, no error message, and no way to retry without a full page reload. This is a user-facing failure visible under normal operating conditions. |
| **Affected component** | `src/main.tsx`, `src/App.tsx` (entire component tree) |
| **Evidence** | Grep for `ErrorBoundary\|componentDidCatch\|error.boundary\|errorBoundary` (case-insensitive) across `src/` returned **0 matches**. The application mounts with `createRoot(...).render(<StrictMode><App /></StrictMode>)` and no error boundary wrapper. |
| **Likelihood** | 2 (possible — a runtime error is not guaranteed on every session, but is plausible with edge-case input or fixture changes) |
| **Impact** | 3 (severe — total application crash with no recovery and no user feedback) |
| **Risk score** | **6** |
| **Proposed mitigation** | Add a React Error Boundary class component around `<App />` in `src/main.tsx`. The boundary should render a fallback UI with a "Reload" button. This does not change any acceptance criteria or add backend functionality. |
| **Owner** | Frontend developer |
| **Verification method** | Render the app, trigger a deliberate runtime error in a child component (test-only), and confirm the fallback UI appears instead of a blank screen. Add a UI regression test that mounts the boundary with a throwing child and asserts the fallback renders. |
| **Verification status** | Not yet implemented — finding confirmed, mitigation proposed, no code change made |

---

### RISK-02: Duplicated Business Constants

| Field | Value |
|---|---|
| **ID** | RISK-02 |
| **Category** | Maintainability |
| **Classification** | Future structural risk |
| **Cause** | The 120-minute maximum booking duration and the 1440-minute day length are hardcoded as literal numbers in multiple independent locations rather than being defined once in a shared constants module. |
| **Event** | A future developer changes the booking duration limit or the day-length boundary in one location but misses another. |
| **Consequence** | The business logic, the UI hint text, the timeline rendering, and the slider range fall out of sync. For example, changing the logic limit from 120 to 90 minutes without updating the UI text would mislead users. The application continues to run, but silently violates the intended rule. |
| **Affected component** | `src/lib/availability.ts` (lines 39, 57, 61), `src/features/availability/BookingTimeForm.tsx` (lines 68, 79), `src/components/Timeline.tsx` (line 28) |
| **Evidence** | Grep for `120\|1440` across `src/` confirmed: `availability.ts` line 39 (`end > 1440`), line 57 (`end - start > 120`), line 61 (text "120-minute maximum"); `BookingTimeForm.tsx` line 68 (`max={1440}`), line 79 (text "Max booking duration: 120 minutes"); `Timeline.tsx` line 28 (`min / 1440`); `types.ts` line 13 (comment "0–1440"). The constants are not exported from any shared module. |
| **Likelihood** | 2 (possible — duplication across 3+ files increases the chance a future change misses one) |
| **Impact** | 2 (moderate — silent rule drift; incorrect UI guidance or logic, but not a crash) |
| **Risk score** | **4** |
| **Proposed mitigation** | Define `MAX_BOOKING_DURATION_MINUTES` and `MINUTES_PER_DAY` in a single constants module (e.g., `src/lib/constants.ts` or within `src/data/config.ts`). Import the constants everywhere they are currently hardcoded. This is a refactor with no behavioral change and does not affect AC1–AC6. |
| **Owner** | Frontend developer |
| **Verification method** | Grep for literal `120` and `1440` across `src/` after mitigation; confirm all references resolve to the shared constant. Run existing test suite (`npx vitest run`) to verify no behavioral change. |
| **Verification status** | Not yet implemented — finding confirmed, mitigation proposed, no code change made |

---

### RISK-03: Unlinked Form Labels

| Field | Value |
|---|---|
| **ID** | RISK-03 |
| **Category** | Accessibility |
| **Classification** | Current defect |
| **Cause** | The booking time form labels ("Start Time", "End Time", "Current Time") do not use `htmlFor` attributes, and their corresponding inputs do not have `id` attributes. The labels and inputs are not programmatically associated. |
| **Event** | A screen-reader user or keyboard-only user navigates to the booking time form. The assistive technology cannot announce which label belongs to which input. |
| **Consequence** | The form is not WCAG 2.1 Level A compliant (fails Success Criterion 1.3.1: Info and Relationships and 4.1.2: Name, Role, Value). Screen-reader users cannot determine the purpose of each time input. This is a present accessibility barrier, not a future risk. The existing UI tests work around this by querying inputs by position (`querySelectorAll('input[type="time"]')`) rather than by accessible name. |
| **Affected component** | `src/features/availability/BookingTimeForm.tsx` |
| **Evidence** | Grep for `htmlFor\|id=` in `BookingTimeForm.tsx` returned **0 matches**. The three labels use plain `<label>` elements with text content only. The three inputs (`type="time"`, `type="time"`, `type="range"`) have no `id` attribute. Compare with `src/features/rooms/RoomRequirements.tsx` which correctly uses `<label htmlFor="attendees">` and `<input id="attendees">` — the pattern exists in the codebase but was not applied to the time form. |
| **Likelihood** | 2 (possible — the barrier is present on every page load for assistive-technology users, but affects a subset of users) |
| **Impact** | 2 (moderate — functional form is usable by sighted users; accessibility barrier is real but does not break the application) |
| **Risk score** | **4** |
| **Proposed mitigation** | Add `id` and `htmlFor` pairs to the three label-input groups in `BookingTimeForm.tsx` (e.g., `id="start-time"`, `id="end-time"`, `id="current-time"`). Mirror the pattern already used in `RoomRequirements.tsx`. This is a markup-only change with no behavioral impact and does not affect AC1–AC6. |
| **Owner** | Frontend developer |
| **Verification method** | Render the app and verify each label's `htmlFor` matches its input's `id`. Update UI tests to query time inputs by accessible name (`screen.getByLabelText("Start Time")`) instead of positional index. Run `npx vitest run` and `npm run lint`. |
| **Verification status** | Not yet implemented — finding confirmed, mitigation proposed, no code change made |

---

### RISK-04: Manual Stale-Result Reset

| Field | Value |
|---|---|
| **ID** | RISK-04 |
| **Category** | Maintainability |
| **Classification** | Future structural risk |
| **Cause** | Each input-change handler in the `useAvailabilityCheck` hook independently calls `setResult(null)` to clear the previous availability result. There is no centralized mechanism that guarantees the result is cleared whenever any input changes. |
| **Event** | A future developer adds a new input control (e.g., a date selector or a room-type filter) and creates a new handler that updates state but forgets to call `setResult(null)`. |
| **Consequence** | The result banner continues to display the stale availability decision from the previous check, contradicting the new inputs. The user sees an "Available" or "Unavailable" result that does not correspond to the current form values. The application does not crash, but the displayed result is incorrect. |
| **Affected component** | `src/features/availability/useAvailabilityCheck.ts` |
| **Evidence** | Grep for `setResult(null)` in `useAvailabilityCheck.ts` returned **5 matches** across lines 57, 64, 69, 74, and 79 — one in each of `updateAttendees`, `toggleEquipment`, `updateStartTime`, `updateEndTime`, and `updateCurrentTime`. Each handler independently clears the result. There is no shared `useEffect` or wrapper function that enforces this invariant. |
| **Likelihood** | 2 (possible — the pattern is easy to miss when adding a new handler, especially by a developer unfamiliar with the hook) |
| **Impact** | 2 (moderate — incorrect displayed result; no data corruption or crash, but user trust is affected) |
| **Risk score** | **4** |
| **Proposed mitigation** | Route all input changes through a single helper function (e.g., `updateInput(patch: Partial<State>)`) that clears the result as part of every state update. Alternatively, use a `useEffect` that watches all input values and clears the result when any change. Either approach centralizes the invariant. This is a refactor with no behavioral change and does not affect AC1–AC6. |
| **Owner** | Frontend developer |
| **Verification method** | After mitigation, grep for direct `setResult(null)` calls — confirm they are replaced by the centralized mechanism. Add a regression test that verifies the result is cleared when a new input is added to the hook. Run `npx vitest run`. |
| **Verification status** | Not yet implemented — finding confirmed, mitigation proposed, no code change made |

---

### RISK-05: Unused Supabase Dependency

| Field | Value |
|---|---|
| **ID** | RISK-05 |
| **Category** | Dependency hygiene |
| **Classification** | Future structural risk |
| **Cause** | `@supabase/supabase-js` (v2.57.4) is declared as a direct production dependency in `package.json` (`dependencies`, not `devDependencies`), but no source file under `src/` imports it, calls `createClient`, references any Supabase type, or reads `VITE_SUPABASE_*` environment variables. The `.env` file defines `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, but these are not consumed by any application code. |
| **Event** | A future developer or reviewer sees the Supabase dependency and environment variables and assumes the application has or should have a backend, leading to incorrect architectural decisions or unnecessary backend integration that violates the project constraints. |
| **Consequence** | The dependency adds install weight, pulls 6 transitive packages (`@supabase/auth-js`, `functions-js`, `node-fetch`, `postgrest-js`, `realtime-js`, `storage-js`) into `node_modules/`, and sends a misleading architectural signal. The project explicitly prohibits backend, login, and database functionality, making this dependency contradictory to the stated scope. |
| **Affected component** | `package.json` (line 12), `package-lock.json` (lines 11, 1294), `.env` (lines 1–2) |
| **Evidence** | `package.json` line 12: `"@supabase/supabase-js": "^2.57.4"` in `dependencies`. `package-lock.json` line 1294: top-level `node_modules/@supabase/supabase-js` entry (no `"dev": true`), confirming direct production dependency. Grep for `supabase` (case-insensitive) across `src/` returned **0 matches**. Grep for `createClient` across `src/` returned **0 matches**. Grep for `@supabase` across `src/` returned **0 matches**. `AGENTS.md` line 6: "no backend, login or booking creation." `README.md` line 5: "The app has no backend, no login, and does not create bookings." `docs/Assignment04-Report.md` line 27 already identifies this as risk R4. |
| **Likelihood** | 2 (possible — the misleading signal is always present, but actual harm requires a future developer to act on it) |
| **Impact** | 2 (moderate — install bloat and misleading architecture signal; no runtime impact today) |
| **Risk score** | **4** |
| **Proposed mitigation** | Remove `@supabase/supabase-js` from `package.json` `dependencies` and run `npm install` to update the lockfile. Remove the `VITE_SUPABASE_*` entries from `.env`. This decision requires the project owner's approval, as the dependency may have been intentionally retained for a future backend phase. No mitigation is implemented in this pass. |
| **Owner** | Project owner (decision required) |
| **Verification method** | After mitigation, grep for `supabase` across the entire project (excluding `node_modules/`) and confirm **0 matches**. Run `npm run build` to verify the production build succeeds without the dependency. Run `npx vitest run` to verify all tests pass. |
| **Verification status** | Not yet implemented — finding confirmed (classified as Confirmed in independent verification), mitigation proposed, no code change made |

---

## Risk Ranking

| Rank | ID | Score | Likelihood | Impact | Classification | Tie-break rationale |
|---|---|---|---|---|---|---|
| 1 | RISK-01 | 6 | 2 | 3 | Current defect | Highest score. No tie. |
| 2 | RISK-03 | 4 | 2 | 2 | Current defect | Tied at score 4 with RISK-02, RISK-04, RISK-05. Ranked above the structural risks because it is a **present accessibility barrier** visible to users today, not a future maintenance hazard. WCAG non-compliance has legal and usability implications that outweigh latent code-quality issues. |
| 3 | RISK-04 | 4 | 2 | 2 | Future structural risk | Tied at score 4. Ranked above RISK-02 and RISK-05 because its consequence — displaying an **incorrect availability result** — directly affects user trust in the application's core function. The other structural risks cause code drift or install bloat but do not produce wrong answers. |
| 4 | RISK-02 | 4 | 2 | 2 | Future structural risk | Tied at score 4. Ranked above RISK-05 because its consequence — **silent business-rule drift** — can produce incorrect availability decisions if the logic and UI text diverge. RISK-05 has no runtime effect. |
| 5 | RISK-05 | 4 | 2 | 2 | Future structural risk | Tied at score 4. Lowest priority because it has **zero runtime impact**. The application functions identically with or without the dependency. The harm is purely architectural signal and install weight. |

### Tie-breaking summary

Four risks share score 4. The tie is broken by the nature and immediacy of the consequence:

1. **User-facing present defect** (RISK-03) ranks above all future risks — a barrier that exists today is more urgent than one that might emerge later.
2. Among future structural risks, **correctness of output** (RISK-04) ranks above **consistency of business rules** (RISK-02), which ranks above **zero-runtime-impact hygiene** (RISK-05).

---

## Top Two Risks for Action

The following two risks are selected for mitigation in the next development pass:

### 1. RISK-01: Missing React Error Boundary (score 6)

**Rationale:** Highest risk score in the register. The absence of an error boundary is a current defect — any uncaught runtime error produces a total application crash with no recovery path and no user feedback. This is the only risk with an impact score of 3. Mitigation is straightforward (add a boundary component), does not touch any acceptance criteria, and does not introduce backend functionality.

### 2. RISK-03: Unlinked Form Labels (score 4)

**Rationale:** Tied at score 4 but elevated above the other structural risks because it is a **current defect** — an accessibility barrier present in the running application today. Screen-reader users cannot associate the three time-input labels with their fields. The fix is low-risk (add `id`/`htmlFor` pairs), mirrors a pattern already used in `RoomRequirements.tsx`, and does not change any application behavior or acceptance criteria. Existing UI tests can be improved to use accessible queries as part of the same change.

---

## Acceptance Criteria Preservation

All five risks and their proposed mitigations preserve the existing AC1–AC6 acceptance criteria as cited in the source code:

| Criterion | Description (as cited) | Affected by any proposed mitigation? |
|---|---|---|
| AC1 | Valid range, ordering, and start after current time | No |
| AC2 | Maximum 120-minute duration | No — RISK-02 proposes extracting the constant, not changing the value |
| AC3 | Blocked rooms are rejected | No |
| AC4 | Overlaps rejected, touching endpoints allowed | No |
| AC5 | Inputs are not mutated | No |
| AC6 | Inputs are not mutated (additional) | No |

No mitigation proposed in this register alters the availability logic, the filter rules, the booking data, or the acceptance criteria.

---

## Summary

| Metric | Value |
|---|---|
| Total risks identified | 5 |
| Current defects | 2 (RISK-01, RISK-03) |
| Future structural risks | 3 (RISK-02, RISK-04, RISK-05) |
| Highest risk score | 6 (RISK-01) |
| Risks selected for action | 2 (RISK-01, RISK-03) |
| Application source code modified | None |
| Acceptance criteria modified | None |
| Backend, login, or database introduced | None |

---

*This risk register is a documentation artifact. No application source code, dependencies, or configuration files were modified during its preparation. All evidence is drawn from the project files as they exist at the time of writing.*
