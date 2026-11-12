# AI Use Evidence: Smart Campus Room Availability

## AI tool

- **Tool:** Bolt.new (the AI agent inside Bolt, which edits this project directly).
- **Project template:** `bolt-vite-react-ts`, a React, TypeScript, and Vite starter.

## Limits of this record

The earlier Bolt conversations that produced the original application code (the rooms, bookings, availability rules, and filters) are not in the workspace. The prompts and suggestions below cover only the stages visible in this session. The project owner must add the original prompts from their Bolt history before submission. Nothing has been filled in on their behalf.

## Stages and main prompts

| Stage | Prompt (summary) | What the AI did |
| --- | --- | --- |
| 1 | Add at least one integration or UI behavior check. Reuse existing dependencies and do not change production behavior. | Inspected `package.json` and `vite.config.ts`. Found no React Testing Library, jsdom, or happy-dom installed. Declined to install packages and proposed an integration test of the filter and availability flow on the real fixtures. Added `src/features/availability/availabilityFlow.test.ts` (4 tests). |
| 2 | Install `@testing-library/react` and `jsdom` as dev dependencies so real component and UI checks can be added. | Installed `@testing-library/react`, `@testing-library/dom` (required peer dependency), and `jsdom`. Added `src/App.test.tsx` (4 tests) that renders the real app, with jsdom enabled in that file only. |
| 3 | Write the submission documents (README, Assignment 04 report, AI evidence) without changing application code. | Counted tests per file, verified the commands, and wrote `README.md`, `docs/Assignment04-Report.md`, and this file. |

## Important AI-generated suggestions

1. **Integration test instead of installing packages (stage 1).** The first response proposed testing the flow without a DOM. The student then asked for real component tests, and the packages were installed.
2. **Per-file jsdom environment (stage 2).** The AI chose a `// @vitest-environment jsdom` comment in `App.test.tsx` rather than changing the global Vitest configuration, so the 70 existing unit tests keep the default environment.
3. **Mirrored hook flow in the integration test (stage 1).** The integration test repeats the hook's filter and selection logic rather than refactoring the hook. This was accepted as a trade-off, and it is recorded as a maintainability risk in the report.
4. **Test-count tally (stage 3).** The first tally in this session was wrong. It was corrected by counting each file (24, 8, 12, 26, 4, 4 = 78).

## Decisions

| Decision | Outcome | Reason |
| --- | --- | --- |
| Do not install testing packages without approval | Accepted for stage 1 | The task said to reuse dependencies and install only when necessary |
| Install `@testing-library/react`, `@testing-library/dom`, and `jsdom` | Accepted after the student's approval | Needed for real UI interaction tests |
| Enable jsdom globally in Vitest config | Rejected | Would change the environment of the existing unit tests |
| Enable jsdom per test file | Accepted | Keeps existing tests unchanged |
| Refactor the hook into a pure function so tests can call it directly | Rejected | The task forbade changing production behavior; trade-off is duplicated flow logic |
| Describe the "before" architecture and the F1 to F5 definitions | Not done | Neither was in the workspace; left for the student to supply |
| Describe "24 baseline tests" as the original count | Corrected | The original project had 70 tests; 24 is the count for `availability.test.ts` alone |

## How the code and suggestions were verified

- **Test inventory:** Each test file was counted with a search for `test(` calls, and the test names were listed. The total matches the vitest result.
- **Test run:** `npx vitest run` ran all tests. Result: 78 passed across 6 files.
- **Type checking:** `npm run typecheck` ran and passed.
- **Lint:** `npm run lint` ran and passed.
- **Production build:** `npm run build` ran and passed.
- **Source review:** The AI read the source files before describing them, including the hook, the availability rules, the filters, and the form components.
- **Dependency check:** A search of `src/` confirmed that `@supabase/supabase-js` is not imported anywhere.

### Not verified

- Browser manual verification was **not** performed. The UI tests run in jsdom, which is a simulated browser.
- No coverage measurement, accessibility audit, or performance measurement was run.
- No Git commits, screenshots, or timing figures were created or recorded.
