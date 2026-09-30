# AI Workflow Log

This file records the step-by-step progress, verification gates, human decisions, and lessons learned during the development of the Next.js Todo application across slices and versions.

## 2026-09-29 - V1 Slice 00: Bootstrap and verification harness
- **Commit**: `56d578b chore: bootstrap Next.js app with verification harness`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: Approved spec and implementation plan for Version 1.
- **Checks run**: lint (pass), typecheck (pass), tests (1 pass), e2e (1 pass).
- **Review**: Auto-approved bootstrap scaffold and harness per autopilot workflow.
- **Bug or issue caught**: Playwright chromium headless shell was initially missing and required installation via `npx playwright install chromium`; Windows default `bash` routed to WSL so Git Bash was used for post_task hook.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1 Slice 01: Schemas, service interface, and local service
- **Commit**: `b9e8f1a feat: implement schemas, service interface, and LocalTodoService with contract tests`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (16 pass).
- **Review**: In-session review by autopilot; all contract criteria, validation rules, and error handling met.
- **Bug or issue caught**: None.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1 Slice 02: Add and list todos
- **Commit**: `89f0558 feat: add AddTodoForm, TodoList, useTodos hook, and wire up home page`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (24 pass across 5 test files), e2e (2 pass).
- **Review**: In-session review by autopilot; all acceptance criteria met.
- **Bug or issue caught**: React 19 / Next 16 eslint rule `react-hooks/set-state-in-effect` caught calling setState synchronously in effect body; resolved by moving state updates to promise resolution with unmount cancellation flag.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1 Slice 03: Complete, edit, and delete
- **Commit**: `43769cb feat: implement toggle complete, inline editing, and deletion in TodoItem`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (30 pass across 6 test files), e2e (5 pass).
- **Review**: In-session review by autopilot; all acceptance criteria met.
- **Bug or issue caught**: None.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1 Slice 04: Filters and active-item counter
- **Commit**: `a6b1318 feat: implement FilterBar with All/Active/Completed tabs and active item counter`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (33 pass across 7 test files), e2e (6 pass).
- **Review**: In-session review by autopilot; all acceptance criteria met.
- **Bug or issue caught**: None.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1 Slice 05: Resilience and polish
- **Commit**: `91d8a9d feat: add storage resilience notices, mobile responsiveness, and clean console audit`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (35 pass across 8 test files), e2e (7 pass).
- **Review**: In-session review by autopilot; all resilience notices, mobile layout, keyboard navigation, and console error-free happy path verified.
- **Bug or issue caught**: None.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1.1 Slice 01: Extended schema, contract suite, and backwards compatibility
- **Commit**: `d141255 feat(v1.1): extend schema with priority, dueDate, category, description, and backwards compatibility`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: Approved Version 1.1 plan with priority, due date, category, and description fields.
- **Checks run**: lint (pass), typecheck (pass), tests (43 pass across 8 test files).
- **Review**: In-session review by autopilot; backwards compatibility and all contract assertions met.
- **Bug or issue caught**: TypeScript caught missing required properties on static mock fixtures in TodoItem and TodoList component tests; resolved by adding default metadata.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1.1 Slice 02: Rich creation form (AddTodoForm)
- **Commit**: `eea57ae feat(v1.1): add expandable rich details panel to AddTodoForm with validation`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (45 pass across 8 test files), e2e (8 pass).
- **Review**: In-session review by autopilot; expandable form, validation, and resets verified.
- **Bug or issue caught**: Playwright uses `page.getByLabel` rather than `page.getByLabelText`; test paste used for 1001-character string to avoid jsdom keystroke simulation timeout.
- **Rule or prompt improvement**: None.
## 2026-09-29 - V1.1 Slice 03: Rich item display and full-field inline edit (TodoItem)
- **Commit**: `7b211a9 feat(v1.1): rich todo display with badges and full-field inline edit`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (44 pass across 8 test files), e2e (9 pass).
- **Review**: In-session review by autopilot; priority badges, overdue indicators, category pill, description toggle, and inline rich edit drawer verified.
- **Bug or issue caught**: `TodoList.tsx` prop signature needed `TodoPatchInput | string` compatibility to avoid strict TypeScript mismatch with `useTodos.editTodo`. Fixed cleanly.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1.1 Slice 04: Enhanced filtering and sorting (FilterBar & useTodos)
- **Commit**: `e3f5183 feat(v1.1): enhanced filtering by priority and category, and sorting controls`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (50 pass across 8 test files), e2e (10 pass).
- **Review**: In-session review by autopilot; priority chips, category select, sorting by newest/dueDate/priority, empty states, and accessibility verified.
- **Bug or issue caught**: Playwright strict mode caught identical priority button labels between AddTodoForm and FilterBar; resolved cleanly by scoping priority selectors to respective role groups.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1.2 Slice 01: Relocate unit, component, and contract tests to `/test` directory
- **Commit**: `c6126f9 refactor(test): relocate unit, component, and contract tests to /test directory`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (50 pass across 8 test files in `test/`), e2e (10 pass).
- **Review**: In-session review by autopilot; verified clean git renames (`97%–100%` similarity), `@/` path alias resolution, and zero test files remaining in `src/`.
- **Bug or issue caught**: None.
- **Rule or prompt improvement**: None.

## 2026-09-29 - V1.2 Slice 02: Softer dark mode palette and interactive Theme Toggle
- **Commit**: `1ecf379 feat(ui): add softer slate dark mode palette and interactive ThemeToggle`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (55 pass across 9 test files in `test/`), e2e (10 pass).
- **Review**: In-session review by autopilot; verified `src/services/theme-storage.ts` boundary compliance, `.dark` class toggling, `theme:v1` persistence, and softer slate dark surfaces.
- **Bug or issue caught**: ESLint `react-hooks/set-state-in-effect` caught redundant `setThemeState` call inside `useEffect` in `use-theme.ts`; resolved by relying on lazy `useState(() => getStoredTheme())` initialization and syncing only the DOM in `useEffect`.
- **Rule or prompt improvement**: None.

## 2026-09-30 - V1.2 Slice 03: Intuitive dashboard UI redesign (progress bar, stats, priority accents, filter reset)
- **Commit**: `04d1510 feat(ui): add dashboard progress bar, stat pills, priority accent borders, and filter reset`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (58 pass across 9 test files in `test/`), e2e (11 pass).
- **Review**: In-session review by autopilot; verified accessible progressbar (`role="progressbar"`), Total/Active/Completed stat pills, priority left-accent borders (`border-l-4`), and one-click "Reset filters" button.
- **Bug or issue caught**: In `test/app/page.test.tsx`, `beforeEach` previously only cleared `localStorage` and did not clear `todoService` in-memory fallback items from the quota-exceeded test; updated `beforeEach` to clear `todoService.list()` items before each test.
- **Rule or prompt improvement**: None.

## 2026-09-30 - V1.3 Slice 01: Time-blocking schema (nullable startTime & endTime) and service support
- **Commit**: `feat(v1.3): add nullable startTime and endTime time-blocking schema and sorting`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (63 pass across 9 test files in `test/`).
- **Review**: In-session review by autopilot; verified `TimeStringSchema`, `endTime > startTime` refinement across create/update, legacy `localStorage` normalization to `null`, and chronological secondary sorting by `startTime`.
- **Bug or issue caught**: `CreateTodoSchema` needed `TimeStringSchema.nullable().optional()` without `.default(null)` so `CreateTodoSchema.parse` in `AddTodoForm` does not inject `startTime: null` when omitted, while `TodoSchema` and `LocalTodoService.create` normalize omitted values to `null`.
- **Rule or prompt improvement**: None.

## 2026-09-30 - V1.3 Slice 02: Zero-flash dark theme initialization and Warm-Graphite dark background palette
- **Commit**: `feat(v1.3): add zero-flash theme initialization and Warm Graphite dark palette`
- **Key prompt or instruction**: "/autopilot"
- **Human decision or correction**: None.
- **Checks run**: lint (pass), typecheck (pass), tests (63 pass across 9 test files in `test/`).
- **Review**: In-session review by autopilot; verified synchronous `<head>` theme script in `src/app/layout.tsx` and Warm Graphite tokens (`#121316` canvas, `#1a1d24` cards, `#22262f` controls, `#2e3340` borders) from `design.md`.
- **Bug or issue caught**: None.
- **Rule or prompt improvement**: None.


