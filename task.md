Tracking: local

# Task Checklist

This file contains only checklists, acceptance criteria, and tests. Data
definitions, the API contract, and the data model live in
`implementation_plan.md`.

---

# Version 1: Local (localStorage)

## V1 Slice 00: Bootstrap and verification harness

- [x] Scaffold Next.js with `src/` folder, TypeScript strict, Tailwind CSS
- [x] Add Zod, Vitest, React Testing Library, Playwright
- [x] Add ESLint rule banning `localStorage`, `sessionStorage`, and `fetch` in `src/components` and `src/hooks`
- [x] Add npm scripts: `lint`, `typecheck`, `test`, `verify`, `e2e`
- [x] Confirm all scripts pass on a clean install

**Acceptance criteria**

- `npm run verify` (lint + typecheck + test) exits 0.
- `npm run e2e` exits 0 (no tests yet; Playwright config is valid).
- `bash .agents/hooks/post_task.sh incremental-orchestrator full` exits 0.

---

## V1 Slice 01: Schemas, service interface, and local service

- [x] Write tests (contract suite) and watch them fail
- [x] Implement `src/lib/schemas.ts`, `src/lib/errors.ts`
- [x] Implement `src/services/todo-service.ts` (interface only)
- [x] Implement `src/services/local-todo-service.ts`
- [x] Implement `src/services/todo-service.contract.ts` (shared contract suite)
- [x] Implement `src/services/index.ts` (exports `LocalTodoService`)
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- Every `TodoService` method (`list`, `create`, `update`, `remove`) returns a `Promise`.
- `create` trims the title; rejects blank, whitespace-only, and >200-character titles with a `ZodError`; returns a todo with a UUID `id`, `completed: false`, and valid ISO timestamps.
- `list` returns todos newest-first and filters correctly for `all`, `active`, and `completed`.
- `update` changes only the matching todo and updates `updatedAt`; throws `NotFoundError` for an unknown id.
- `remove` deletes only the matching todo; throws `NotFoundError` for an unknown id.
- A fresh `LocalTodoService` instance reads previously saved data from `todos:v1`.
- Missing or corrupt stored data yields an empty list without throwing.
- A throwing `localStorage` (e.g. private mode, quota full) yields an error result, not a crash.
- ESLint rejects any file under `src/components` or `src/hooks` that references `localStorage`, `sessionStorage`, or `fetch`.

**Tests**

- Contract suite (`todo-service.contract.ts`) run against `LocalTodoService` in jsdom
- Extra unit tests: corrupt JSON in `localStorage`, `localStorage.getItem` throws, `localStorage.setItem` throws
- Lint integration test: ESLint rejects a file importing `localStorage` from `src/components`

---

## V1 Slice 02: Add and list todos

- [x] Write tests and watch them fail
- [x] Implement `src/hooks/use-todos.ts`
- [x] Implement `src/components/AddTodoForm.tsx`
- [x] Implement `src/components/TodoList.tsx` (with empty and loading states)
- [x] Wire up `src/app/page.tsx`
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- A valid title submits, appears at the top of the list, and the input clears.
- An empty or whitespace-only title shows an inline error message and adds nothing.
- A title longer than 200 characters shows an inline error message and adds nothing.
- A loading state is visible before data is loaded from storage.
- After a page reload the added todos are still there.
- Nothing in `src/hooks` or `src/components` references `localStorage` directly.

**Tests**

- component (`AddTodoForm`): valid submit, empty input error, too-long input error, input clears after success
- component (`TodoList`): renders list, shows loading state, shows empty state
- component (integration): add a todo, list updates immediately, remount shows it persisted
- e2e: add a todo → reload → todo still listed

---

## V1 Slice 03: Complete, edit, and delete

- [x] Write tests and watch them fail
- [x] Implement `src/components/TodoItem.tsx` (checkbox, inline edit, delete button)
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- Clicking the checkbox toggles `completed`; the state survives a reload.
- Double-clicking (or an Edit button) the title enters edit mode; pressing Enter saves and exits edit mode.
- Pressing Escape in edit mode cancels and restores the original title.
- Submitting an empty or whitespace-only title in edit mode keeps the original title and shows an error.
- Clicking Delete removes the todo immediately and permanently.
- All interactive controls have accessible labels (`aria-label` or visible text).

**Tests**

- component: toggle completed, reload persisted, edit saves, edit cancels, edit rejects empty, delete
- e2e: toggle → reload, edit → reload, delete

---

## V1 Slice 04: Filters and active-item counter

- [x] Write tests and watch them fail
- [x] Implement `src/components/FilterBar.tsx` (All / Active / Completed tabs + counter)
- [x] Wire filter state through `use-todos` hook
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- Clicking **All** shows every todo. Clicking **Active** shows only incomplete todos. Clicking **Completed** shows only completed todos.
- The currently selected filter is communicated to assistive technology (`aria-current` or equivalent).
- Each filter shows a contextual empty message when its list is empty.
- The counter displays the number of active (incomplete) todos and updates immediately on any change.

**Tests**

- component: switch filters, counter value, empty messages per filter
- e2e: add todos, toggle some, switch filters, assert correct items visible

---

## V1 Slice 05: Resilience and polish

- [x] Write tests and watch them fail
- [x] Add visible notice for blocked storage and for corrupt stored data
- [x] Responsive layout (min usable at 375 px width)
- [x] Keyboard navigation check (Tab, Enter, Escape reach all actions)
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- When `localStorage` throws on write, the app continues to work in memory and a visible, non-dismissible notice explains data will not be saved.
- When stored data is corrupt, the app starts with an empty list and a visible notice.
- The app is fully operable by keyboard: Tab reaches all interactive controls, Enter/Space activates them, Escape cancels edit mode.
- The layout is usable at 375 px viewport width with no horizontal scrollbar.
- No unhandled console errors during the e2e happy path.

**Tests**

- component: `localStorage.setItem` throws → in-memory list + notice visible
- component: corrupt stored JSON → empty list + notice visible
- e2e: full happy path (add, toggle, edit, delete, filter) with `page.on('console')` asserting zero errors

---

## V1 Slice 06: Finish version 1

- [x] Run `/finish 1` — audit, README update, and release notes
- [x] Human reviews output, merges branch to `main`, and tags `v1`

---

# Version 1.1: Rich Metadata and Controls

## V1.1 Slice 01: Extended schema, contract suite, and backwards compatibility

- [x] Write tests (contract suite + legacy data tests) and watch them fail
- [x] Update `src/lib/schemas.ts`: `PrioritySchema`, updated `TodoSchema`, `CreateTodoSchema`, `TodoPatchSchema`
- [x] Update `src/services/todo-service.ts`: `ListOptions`, `SortOption`, and updated signatures
- [x] Update `src/services/local-todo-service.ts`: handle new fields, filtering, sorting, and backwards compatibility with legacy V1 data
- [x] Update `src/services/todo-service.contract.ts` and `local-todo-service.test.ts`
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- `CreateTodoSchema` and `TodoService.create` accept optional `description` (<=1000 chars), `priority` (`low` | `medium` | `high`, default `medium`), `dueDate` (ISO string/null), and `category` (<=50 chars).
- `TodoPatchSchema` and `TodoService.update` allow partial updates of any metadata fields while updating `updatedAt`.
- `list({ sortBy: 'dueDate' })` sorts todos with due dates earliest first; `list({ sortBy: 'priority' })` sorts `high` -> `medium` -> `low`; `list({ sortBy: 'newest' })` sorts by `createdAt` descending.
- Existing legacy Version 1 items in `localStorage` `{ id, title, completed, createdAt, updatedAt }` parse cleanly with `priority: 'medium'` and empty/null metadata without errors.
- ESLint rules continue to prevent direct storage/fetch access in components and hooks.

**Tests**

- Contract suite: creation with metadata, defaults, patch updates, sorting by dueDate/priority/newest.
- Unit test: legacy V1 stored JSON parses into valid V1.1 todos without loss.

---

## V1.1 Slice 02: Rich creation form (AddTodoForm)

- [x] Write tests and watch them fail
- [x] Expand `AddTodoForm.tsx` with expandable details panel: description textarea, priority selector, due date picker, category input
- [x] Validate character limits inline (description <=1000, category <=50)
- [x] Wire up with `useTodos`
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- Adding a todo with only a title works as before (defaults `priority` to `medium`).
- Expanding details allows entering optional description, selecting priority (`low`/`medium`/`high`), picking a due date, and entering a category.
- Submitting resets both the main title and detail fields.
- Validation errors for too-long description or category display inline without submitting.

**Tests**

- component (`AddTodoForm`): submit with all fields, default priority, inline errors for invalid details, reset on submit.
- e2e: add rich todo with priority, due date, category → persists after reload.

---

## V1.1 Slice 03: Rich item display and full-field inline edit (TodoItem)

- [x] Write tests and watch them fail
- [x] Update `TodoItem.tsx` to render priority badges, due date status (overdue indicator), category pill, and description
- [x] Support full inline edit mode for title, description, priority, due date, and category
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- Priority badge renders with distinct styling for `high` (e.g. red/rose), `medium` (amber), and `low` (blue/slate).
- Overdue dates (due date in past and uncompleted) show a visible warning badge or text color.
- Category tag renders when present.
- Inline edit mode allows modifying title, description, priority, due date, and category; Enter or Save button saves; Escape cancels.
- All controls have accessible labels and keyboard accessibility.

**Tests**

- component (`TodoItem`): renders badges, renders overdue status, inline edit modifies all fields, cancel restores original state.
- e2e: edit todo priority and due date → verify persistence across reload.

---

## V1.1 Slice 04: Enhanced filtering and sorting (FilterBar & useTodos)

- [x] Write tests and watch them fail
- [x] Extend `useTodos.ts` with priority filter, category filter, and sort options
- [x] Extend `FilterBar.tsx` with priority filter chips, category dropdown/filter, and sort selector
- [x] Contextual empty messages in `TodoList.tsx` reflect active filters
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- Users can filter by priority (`all`, `high`, `medium`, `low`) and category alongside status (`all`, `active`, `completed`).
- Users can sort the list by Newest, Due Date (earliest first), or Priority (highest first).
- Active counter and empty state messages adapt to current filter criteria.
- Screen readers receive appropriate accessibility announcements for active filters.

**Tests**

- component (`FilterBar`): priority filter selection, category filter selection, sort dropdown change.
- e2e: filter by high priority, sort by due date, verify item order.

---

## V1.1 Slice 05: Finish version 1.1

- [ ] Run `/finish 1.1` — audit, README update, and release notes
- [ ] Human reviews output, merges branch to `main`, and tags `v1.1`

---

# Version 2: Routes and database (outline only — detail with `/plan 2`)

## V2 Slice 00: Backend foundation

- [ ] Add Drizzle ORM + Neon (`@neondatabase/serverless`) driver
- [ ] `src/server/db.ts`, `src/server/schema.ts`, first migration
- [ ] `src/server/todo-repository.ts` implementing `TodoService`

**Acceptance criteria**

- The shared contract suite passes against `TodoRepository` using a fresh test database.
- Migration is committed; database files and `.env.local` are gitignored.
- `git diff` shows no changes under `src/components` or `src/hooks`.

---

## V2 Slice 01: API routes

- [ ] `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/[id]`, `DELETE /api/todos/[id]`

**Acceptance criteria**

- Status codes and error shape match the API table in `implementation_plan.md`.
- Invalid input → 400 with per-field messages. Unknown id → 404. Unexpected failure → safe 500 (no stack trace).

**Tests**

- api: every route, success case and each error case

---

## V2 Slice 02: Switch the app to the API

- [ ] Implement `src/services/http-todo-service.ts`
- [ ] Change `src/services/index.ts` to export `HttpTodoService`
- [ ] Add e2e test-database reset helper

**Acceptance criteria**

- `HttpTodoService` passes the shared contract suite.
- All Version 1 e2e tests pass with their assertions unchanged.
- `git diff` for this slice shows no changes under `src/components` or `src/hooks`.

---

## V2 Slice 03 (optional): Migrate existing localStorage todos

- [ ] One-time import of a browser's local todos into the database

**Acceptance criteria**

- Existing local todos appear on the server exactly once; running twice does not duplicate them.

---

## V2 Slice 04: Error handling and hardening

- [ ] API failures shown to the user; failed mutations reverted; loading states

**Acceptance criteria**

- A failed request shows a visible, dismissible error and the list reverts to the last good state.
- No console errors during the e2e happy path.

---

## V2 Slice 05: Finish version 2

- [ ] Run `/finish 2` — audit, README update, release notes
- [ ] Human reviews output, merges branch to `main`, tags `v2`, and deploys to Vercel
