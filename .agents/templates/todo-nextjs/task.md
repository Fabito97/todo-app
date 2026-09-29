Tracking: local

# Task Checklist

DRAFT seed. Run `/plan` to have the Team Lead write `implementation_plan.md` for Version 1. Version 2 is only outlined here; run `/plan 2` after Version 1 is merged so its plan matches the real code. This file holds only checklists, acceptance criteria, and tests.

# Version 1: Local (localStorage)

## V1 Slice 00: Bootstrap and verification harness
- [ ] Scaffold Next.js with a `src/` folder, Zod, Vitest, React Testing Library, Playwright, ESLint
- [ ] Scripts `lint`, `typecheck`, `test`, `verify`, `e2e` exist and pass
- [ ] CI workflow runs the full gate
**Acceptance criteria**
- `bash .agents/hooks/post_task.sh incremental-orchestrator full` exits 0.
- CI is green.

## V1 Slice 01: Schemas, service interface, and local service
- [ ] Write tests
- [ ] `src/lib/schemas.ts`, `TodoService` interface, `LocalTodoService`, shared contract test suite
- [ ] Run checks and commit
**Acceptance criteria**
- Every `TodoService` method (list, create, update, remove) returns a Promise.
- Create trims the title, rejects empty, whitespace-only, and over-200-character titles, and returns a todo with a unique id, `completed: false`, and timestamps.
- List returns newest first and supports the status filter.
- Update and remove change only the todo with the matching id. An unknown id is reported as "not found" (as defined in the plan) and changes nothing.
- A new service instance sees previously saved todos.
- Missing or corrupt stored data gives an empty list without throwing. A throwing `localStorage` produces a clear error, not a crash.
- Lint fails if a file in `src/components` or `src/hooks` references `localStorage` or `fetch`.
**Tests**
- contract suite run against `LocalTodoService` (jsdom), plus corrupt-storage and throwing-storage cases

## V1 Slice 02: Add and list
- [ ] Write tests
- [ ] `useTodos` hook (uses `TodoService` only), add form, list, empty and loading states
- [ ] Run checks and commit
**Acceptance criteria**
- A valid title appears at the top of the list and the input clears.
- Invalid titles show an error message and add nothing.
- After a reload the added todos are still there.
- Nothing reads `localStorage` before mount, and a loading state shows until data is ready.
**Tests**
- component: add, invalid input, remount persistence, empty state
- e2e: add a todo, reload, still listed

## V1 Slice 03: Complete, edit, delete
- [ ] Write tests
- [ ] Checkbox, inline edit (Enter saves, Escape cancels), delete button with accessible labels
- [ ] Run checks and commit
**Acceptance criteria**
- Toggling a todo survives a reload.
- Edits save on Enter, cancel on Escape, and reject empty titles while keeping the old one.
- Deleting removes the todo permanently.
**Tests**
- component: toggle, edit, cancel, reject empty, delete
- e2e: toggle, edit, and delete with reload checks

## V1 Slice 04: Filters and counter
- [ ] Write tests
- [ ] Filter tabs and "N items left" counter
- [ ] Run checks and commit
**Acceptance criteria**
- All, Active, and Completed show the right todos, and the selected filter is exposed to assistive tech.
- The counter shows the number of active todos and updates immediately.
- Each filter has a helpful empty message.
**Tests**
- component: switch filters, counter updates
- e2e: filter flow

## V1 Slice 05: Resilience and polish
- [ ] Write tests
- [ ] Notice when storage is blocked or corrupt, responsive layout, keyboard and focus check
- [ ] Run checks and commit
**Acceptance criteria**
- With storage blocked, the app still works in memory and shows a visible notice.
- With corrupt stored data, the app starts empty and shows a notice.
- The app is fully keyboard operable and usable at 375px width.
**Tests**
- component: blocked storage, corrupt storage
- e2e: happy path with no console errors

## V1 Slice 06: Finish version 1
- [ ] Run `/finish 1`: audit, product README, release notes
- [ ] Human reviews, merges, and tags `v1`

# Version 2: Routes and database (outline only, plan with `/plan 2`)

## V2 Slice 00: Backend foundation
- [ ] Add Drizzle and `better-sqlite3`, DB client, schema, and first migration
- [ ] `SqliteTodoRepository` implementing `TodoService`
**Acceptance criteria**
- The shared contract suite passes against the repository using a fresh temporary database.
- The migration is committed and database files are gitignored.
- Nothing under `src/components` or `src/hooks` changes.

## V2 Slice 01: API routes
- [ ] GET and POST `/api/todos`, PATCH and DELETE `/api/todos/:id`
**Acceptance criteria**
- Status codes and the error shape match the API table in `implementation_plan.md`.
- Invalid input returns 400 with field messages, unknown ids return 404, and unexpected failures return a safe 500.
**Tests**
- api: every route, success and each error case

## V2 Slice 02: Switch the app to the API
- [ ] `HttpTodoService`, change `src/services/index.ts`, test-database reset helper for e2e
**Acceptance criteria**
- `HttpTodoService` passes the shared contract suite.
- The Version 1 e2e tests pass with their assertions unchanged.
- `git diff` for this slice shows no changes under `src/components` or `src/hooks`.

## V2 Slice 03 (optional): Import existing localStorage todos
- [ ] One-time import of a browser's saved todos into the database
**Acceptance criteria**
- Existing local todos appear on the server exactly once, and running the import twice does not duplicate them.

## V2 Slice 04: Errors and hardening
- [ ] API failures shown to the user, failed changes reverted, loading states
**Acceptance criteria**
- A failed request shows a visible, dismissible error and the list returns to the last good state.
- No console errors during the e2e happy path.

## V2 Slice 05: Finish version 2
- [ ] Run `/finish 2`: audit, product README, release notes
- [ ] Human reviews, merges, and tags `v2`
