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


