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

- [x] Run `/finish 1.1` — audit, README update, and release notes
- [x] Human reviews output, merges branch to `main`, and tags `v1.1`

---

# Version 1.2: Repository Cleanup, Softer Dark Mode, and Intuitive UI Redesign

## V1.2 Slice 01: Relocate unit, component, and contract tests to `/test` directory

- [x] Move all unit, component, and contract test files from `src/` (`src/sanity.test.ts`, `src/app/page.test.tsx`, `src/components/TodoForm.test.tsx`, `src/components/TodoItem.test.tsx`, `src/components/TodoList.test.tsx`, `src/components/FilterBar.test.tsx`, `src/hooks/use-todos.test.ts`, `src/services/local-todo-service.test.ts`, `src/services/todo-service.contract.ts`) into `test/` (`test/sanity.test.ts`, `test/app/page.test.tsx`, `test/components/TodoForm.test.tsx`, `test/components/TodoItem.test.tsx`, `test/components/TodoList.test.tsx`, `test/components/FilterBar.test.tsx`, `test/hooks/use-todos.test.ts`, `test/services/local-todo-service.test.ts`, `test/services/todo-service.contract.ts`) using `git mv`
- [x] Update relative imports in moved test files to use `@/...` path aliases
- [x] Update `vitest.config.ts` so `test.include` points to `["test/**/*.{test,spec}.{ts,tsx}"]`
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- Zero `*.test.ts`, `*.test.tsx`, or `*.contract.ts` files remain inside `src/`.
- All unit, component, and contract suites reside under `test/` mirroring the `src/` folder layout.
- `npm run verify` (lint, typecheck, and Vitest) passes with all existing tests discovered and green.

**Tests**

- unit & component (`test/**/*.test.{ts,tsx}`): all 46 existing unit, hook, service, and component tests execute from `test/` and pass.

---

## V1.2 Slice 02: Softer dark mode palette and interactive Theme Toggle

- [x] Write tests in `test/components/ThemeToggle.test.tsx` and `test/app/page.test.tsx` and watch them fail
- [x] Implement `src/services/theme-storage.ts` (`getStoredTheme`, `setStoredTheme` using key `theme:v1`) and re-export from `src/services/index.ts`
- [x] Implement `src/hooks/use-theme.ts` and `src/components/ThemeToggle.tsx` with accessible `Light`, `Dark`, and `System` options (`aria-pressed`) that toggle `.dark` on `document.documentElement`
- [x] Update `src/app/globals.css` with class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *));`) and softer slate dark mode tokens (`#0f172a` background, `#f1f5f9` foreground)
- [x] Update `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/TodoForm.tsx`, `src/components/TodoItem.tsx`, `src/components/TodoList.tsx`, and `src/components/FilterBar.tsx` to replace harsh `zinc-950` / `zinc-900` dark surfaces with layered `slate-900` / `slate-800/90` / `slate-700/60` surfaces and render `<ThemeToggle />` in the header
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- Dark mode uses a softer, layered slate/charcoal palette (`slate-900` page background, `slate-800/90` elevated cards, `slate-700/60` inputs, `slate-700/80` borders) instead of pitch-black (`#0a0a0a` / `zinc-950`).
- Header includes an interactive Theme Toggle (`Light`, `Dark`, `System`) with accessible button labels and `aria-pressed` state.
- Selecting `Dark` adds `.dark` to `<html>` and persists `"dark"` under `theme:v1`; selecting `Light` removes `.dark` and persists `"light"` under `theme:v1`.
- UI components and hooks do not access `localStorage` directly; theme persistence flows through `src/services/theme-storage.ts`.

**Tests**

- component (`test/components/ThemeToggle.test.tsx`): renders Light/Dark/System buttons, clicking Dark adds `.dark` class to `document.documentElement` and saves to storage, clicking Light removes `.dark` class, initializes from stored preference.
- component (`test/app/page.test.tsx`): renders ThemeToggle in the page header and switches theme state on click.

---

## V1.2 Slice 03: Intuitive dashboard UI redesign (progress bar, stats, priority accents, filter reset)

- [x] Write tests in `test/app/page.test.tsx`, `test/components/FilterBar.test.tsx`, `test/components/TodoItem.test.tsx`, and `e2e/todo.spec.ts` and watch them fail
- [x] Update `src/app/page.tsx` to display a completion progress bar (`role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`) with percentage and quick-glance stat pills (**Total**, **Active**, **Completed**)
- [x] Update `src/components/FilterBar.tsx` into a cohesive two-tier toolbar with a one-click **Reset filters** button (`aria-label="Reset filters"`) visible whenever status, priority, or category filter is non-default
- [x] Update `src/components/TodoItem.tsx` with priority-colored left accent borders (`border-l-4`, `high` rose, `medium` amber, `low` blue) and refined metadata pills
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- Dashboard header displays Total, Active, and Completed counts alongside a progress bar (`role="progressbar"`) reflecting completion percentage (`0%` when empty or none completed, `100%` when all completed).
- Each `TodoItem` card renders a color-coded left accent border corresponding to its priority (`high` rose, `medium` amber, `low` blue).
- `FilterBar` displays a **Reset filters** button whenever any filter (`status !== "all"`, `priority !== "all"`, or `category !== "all"`) is active, and clicking it resets all filters to `"all"`.
- End-to-end Playwright suite verifies theme switching, progress bar updates, priority accent styling, and filter reset behavior.

**Tests**

- component (`test/app/page.test.tsx`): displays Total/Active/Completed stats and updates `role="progressbar"` percentage when todos are completed.
- component (`test/components/FilterBar.test.tsx`): hides "Reset filters" when all filters are default, shows "Reset filters" when any filter is active, and resets status/priority/category to `"all"` when clicked.
- component (`test/components/TodoItem.test.tsx`): applies distinct priority accent border classes for `high`, `medium`, and `low` priority items.
- e2e (`e2e/todo.spec.ts`): verifies theme toggle persists dark/light class across reload, completion progress bar updates on toggle, and "Reset filters" restores all items.

---

## V1.2 Slice 04: Finish version 1.2

- [x] Run `/finish 1.2` — audit, README update, and release notes
- [x] Human reviews output, merges branch to `main`, and tags `v1.2`

---

# Version 1.3: Zero-Flash Warm-Graphite Dark Mode, Modal Composer, Time-Blocking & Today's Dashboard

## V1.3 Slice 01: Time-blocking schema (nullable startTime & endTime) and service support

- [x] Write tests in `test/services/todo-service.contract.ts`, `test/services/local-todo-service.test.ts`, and `test/hooks/use-todos.test.ts` and watch them fail
- [x] Update `src/lib/schemas.ts`: add `TimeStringSchema` (`HH:MM` 24-hour format) and nullable `startTime` and `endTime` (`null` default) to `TodoSchema`, `CreateTodoSchema`, and `TodoPatchSchema`, plus refinement ensuring `endTime > startTime` when both are provided
- [x] Update `src/services/local-todo-service.ts` and `src/hooks/use-todos.ts`: normalize `startTime` and `endTime` to `null` for legacy records, validate merged time ranges on `update`, and use `startTime` as secondary sort key when sorting by `dueDate`
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- `CreateTodoSchema` and `TodoService.create` accept optional nullable `startTime` (`"HH:mm"` | `null`) and `endTime` (`"HH:mm"` | `null`), defaulting both to `null` when omitted.
- Creating or patching a todo where both `startTime` and `endTime` are provided and `endTime <= startTime` fails validation with `"End time must be after start time"`.
- Existing Version 1 / 1.1 / 1.2 items in `localStorage` without `startTime` or `endTime` parse cleanly with `startTime: null` and `endTime: null`.
- Sorting by `dueDate` orders items sharing the same `dueDate` chronologically by `startTime` (earliest `startTime` first, items without `startTime` after time-blocked items on that same date).

**Tests**

- contract (`test/services/todo-service.contract.ts`): create and update with `startTime` and `endTime`, default `null` when omitted, reject `endTime <= startTime`, and sort same-day todos by `startTime`.
- unit (`test/services/local-todo-service.test.ts`): legacy stored todos without `startTime`/`endTime` normalize to `null`.
- hook (`test/hooks/use-todos.test.ts`): `sortBy: "dueDate"` orders same-day items by `startTime`.

---

## V1.3 Slice 02: Zero-flash dark theme initialization and Warm-Graphite dark background palette

- [x] Write tests in `test/app/page.test.tsx` and `e2e/todos.spec.ts` and watch them fail
- [x] Update `src/app/layout.tsx` (`design.md` §4.1) to include a synchronous blocking `<script>` in `<head>` that reads `localStorage.getItem("theme:v1")` (or `window.matchMedia("(prefers-color-scheme: dark)")`) and applies `.dark` to `document.documentElement` before first paint
- [x] Update `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/ThemeToggle.tsx`, `src/components/FilterBar.tsx`, `src/components/TodoList.tsx`, and `src/components/TodoItem.tsx` to apply the Warm Graphite tokens from `design.md` §2 (`#121316` canvas `dark:bg-[#121316]`, `#1a1d24` cards `dark:bg-[#1a1d24]`, `#22262f` inputs `dark:bg-[#22262f]`, `#2e3340` borders `dark:border-[#2e3340]`) and remove initial page-load background transition flash
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- Reloading the page when `theme:v1` is `"dark"` applies `.dark` to `<html>` synchronously via the `<head>` initialization script (`design.md` §4.1) before first paint so the page never flashes light.
- Dark mode uses the Warm Graphite surface hierarchy from `design.md` §2 (`#121316` canvas background, `#1a1d24` elevated cards, `#22262f` interactive controls, `#2e3340` borders) instead of `slate-900` (`#0f172a`).

**Tests**

- component (`test/app/page.test.tsx`): verifies Warm Graphite dark surface classes and theme toggle behavior.
- e2e (`e2e/todos.spec.ts`): sets dark theme, reloads page, and verifies `<html>` has class `dark` and `rgb(18, 19, 22)` (`#121316`) background immediately on load.

---

## V1.3 Slice 03: Demarcated task creation, Modal Composer, and time-block badges/editing

- [x] Write tests in `test/components/AddTodoForm.test.tsx` and `test/components/TodoItem.test.tsx` and watch them fail
- [x] Update `src/components/AddTodoForm.tsx` (`design.md` §4.2) so clicking `Toggle details` opens an accessible Modal Dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details and schedule"`, `Escape` or `Close modal` button to dismiss) containing Description, Priority, Due Date, `Start time` (`aria-label="Start time"`), `End time` (`aria-label="End time"`), and Category, and closes the modal after successful submission
- [x] Update `src/components/TodoItem.tsx` (`design.md` §4.3) to display a monospace time-block badge (e.g., `09:00 – 10:30`) when `startTime` or `endTime` is present, and add `Edit start time` (`aria-label="Edit start time"`) and `Edit end time` (`aria-label="Edit end time"`) inputs in edit mode
- [x] Update `src/app/page.tsx` (`design.md` §3 & §4.2) so `AddTodoForm` sits in its own dedicated Quick Command card (`aria-label="Create task"`) visually demarcated from the Task Board card
- [x] Run `npm run verify` and commit

**Acceptance criteria**

- `AddTodoForm` is rendered in a dedicated top Quick Command card (`aria-label="Create task"`) separate from the listed todos container (`design.md` §3 & §4.2).
- Clicking `Toggle details` opens an accessible Modal Dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details and schedule"`) without pushing the todo list inline; pressing `Escape` or clicking `Close modal` closes the dialog.
- Users can enter optional `Start time` and `End time` in the modal composer and in `TodoItem` edit mode; invalid time ranges (`endTime <= startTime`) show a visible `role="alert"` message (`"End time must be after start time"`).
- `TodoItem` displays a visible time-block badge (`09:00 – 10:30`) when `startTime` and `endTime` are set (`design.md` §4.3).

**Tests**

- component (`test/components/AddTodoForm.test.tsx`): opens modal dialog (`role="dialog"`) on `Toggle details`, submits todo with `startTime` and `endTime`, shows alert when `endTime <= startTime`, and closes modal on `Escape`.
- component (`test/components/TodoItem.test.tsx`): renders `startTime – endTime` badge and edits `startTime`/`endTime` in edit mode.

---

## V1.3 Slice 04: Today's Dashboard, Interactive Calendar/Schedule View, and Notification Center

- [x] Write tests in `test/components/DashboardOverview.test.tsx`, `test/components/CalendarScheduleView.test.tsx`, `test/components/NotificationCenter.test.tsx`, `test/app/page.test.tsx`, and `e2e/todos.spec.ts` and watch them fail
- [x] Implement `src/components/DashboardOverview.tsx` (`design.md` §4.4): displays **Tasks for the Day** (`aria-label="Tasks for the day"`, items where `dueDate === today`, ordered by `startTime`, with time-block pills and completion checkboxes) alongside daily metrics (**Total**, **Active**, **Completed**, **Due Today**) and the completion `role="progressbar"`
- [x] Implement `src/components/CalendarScheduleView.tsx` (`design.md` §4.5): interactive date navigation (`Previous day`, `Today`, `Next day`, date picker `aria-label="Select schedule date"`, and 7-day week strip) + daily schedule separating **Time-Blocked Schedule** slots (`startTime – endTime`) from **All-Day / Unscheduled Tasks** for the selected date
- [x] Implement `src/components/NotificationCenter.tsx` (`design.md` §4.6): header notification button (`aria-label="Notifications"`) with active count badge for **Overdue** and **Today's Scheduled** incomplete tasks, opening an accessible `Notifications panel` popover (`role="region"`, `aria-label="Notifications panel"`)
- [x] Update `src/app/page.tsx` (`design.md` §3) to integrate `NotificationCenter` in the header, `DashboardOverview`, and workspace view tabs (**Tasks**, **Calendar & Schedule**, **Split View**)
- [x] Run `npm run verify && npm run e2e` and commit

**Acceptance criteria**

- `DashboardOverview` (`design.md` §4.4) displays a dedicated **Tasks for the Day** section listing tasks due today ordered by `startTime`, plus Total, Active, Completed, and Due Today counts and the completion progress bar (`role="progressbar"`).
- `CalendarScheduleView` (`design.md` §4.5) lets the user select a date and displays that date's time-blocked tasks (`startTime – endTime`) in chronological order alongside all-day/unscheduled tasks due on that date.
- `NotificationCenter` (`design.md` §4.6) renders a `Notifications` button in the header with a count of overdue + today's scheduled active tasks, and clicking it displays a popover listing those reminders.
- Users can switch workspace views between **Tasks**, **Calendar & Schedule**, and **Split View** in `src/app/page.tsx`.

**Tests**

- component (`test/components/DashboardOverview.test.tsx`): renders today's tasks ordered by `startTime`, shows empty state (`"No tasks scheduled for today."`) when no tasks are due today, and updates progress bar.
- component (`test/components/CalendarScheduleView.test.tsx`): switches selected date and renders time-blocked tasks and all-day tasks for that date.
- component (`test/components/NotificationCenter.test.tsx`): displays badge count for overdue and today's scheduled tasks and toggles notification panel on click.
- component (`test/app/page.test.tsx`): integrates Today's Dashboard, Notification Center, and workspace view switching.
- e2e (`e2e/todos.spec.ts`): creates a time-blocked task for today via the modal composer, verifies it appears in Today's Dashboard, Calendar & Schedule view, and Notification Center, and persists across reload.

---

## V1.3 Slice 05: Finish version 1.3

- [ ] Run `/finish 1.3` — audit, README update, and release notes
- [ ] Human reviews output, merges branch to `main`, and tags `v1.3`

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
