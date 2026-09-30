Status V1: APPROVED by human on 2026-09-29
Status V1.1: APPROVED by human on 2026-09-29
Status V1.2: APPROVED by human on 2026-09-29
Status V1.3: APPROVED by human on 2026-09-30
Status V1.4: APPROVED by human on 2026-09-30
Status V2: APPROVED by human on 2026-09-30
Status V2.1: APPROVED by human on 2026-09-30

---

# Implementation Plan

## Architecture Summary

The app is a Next.js App Router project with a strict `src/` layout for production code and a dedicated `test/` directory for Vitest unit, component, and contract tests. All business logic and browser persistence live behind the `src/services/` boundary.

- In **Version 1** and **Version 1.1**, the UI runs entirely in the browser and delegates storage to `LocalTodoService`, which is the only module allowed to touch `localStorage`.
- In **Version 1.1**, the data model and UI are enriched with `description`, `priority`, `dueDate`, and `category`, along with rich filtering/sorting and backwards compatibility with existing stored V1 data.
- In **Version 1.2**, all Vitest test suites are relocated out of `src/` into a dedicated root-level `test/` folder, the dark mode palette is softened from harsh pitch-black (`#0a0a0a` / `zinc-950`) to a layered slate surface hierarchy (`#0f172a` / `slate-900` & `slate-800`) with an interactive **Theme Toggle** (**Light** / **Dark** / **System**), and the dashboard UI is redesigned with a completion progress bar, stat pills, a one-click **Reset Filters** control, and priority-accented todo cards.
- In **Version 1.3**, the data model adds optional nullable `startTime` and `endTime` (`"HH:mm"` | `null`) for time-blocking and schedule sorting; dark mode is upgraded to the approved **Warm Graphite** surface hierarchy (`#121316` canvas, `#1a1d24` cards, `#22262f` inputs, `#2e3340` borders) with a synchronous `<head>` theme script that eliminates initial light-to-dark flash (FOUC); task creation is demarcated into a dedicated Quick Command card whose details/schedule fields open in an accessible **Modal Dialog** (`role="dialog"`); and the workspace adds **Today's Dashboard** (`DashboardOverview`), an interactive **Calendar & Schedule View** (`CalendarScheduleView`), a header **Notification Center** (`NotificationCenter`), and a workspace view switcher (**Tasks** | **Calendar & Schedule** | **Split View**).
- In **Version 2**, the UI calls `HttpTodoService`, which calls Route Handlers that in turn call a `TodoRepository` backed by Neon (PostgreSQL) via Drizzle ORM. Swapping versions is a one-file change (`src/services/index.ts`) plus new server-side files; no component or hook changes.

ESLint rules enforce the service boundary: components and hooks may not import `localStorage`, `sessionStorage`, `fetch`, or concrete service classes.

---

## Shared Foundation

### Todo type and Schemas

Defined once in `src/lib/schemas.ts`. Single source of truth.

```ts
// src/lib/schemas.ts
import { z } from 'zod'

export const PrioritySchema = z.enum(['low', 'medium', 'high'])
export type Priority = z.infer<typeof PrioritySchema>

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM (24-hour) format')

const hasValidTimeRange = (data: { startTime?: string | null; endTime?: string | null }) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime
  }
  return true
}

export const TodoSchema = z
  .object({
    id:          z.string().uuid(),
    title:       z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
    completed:   z.boolean(),
    createdAt:   z.string().datetime(),
    updatedAt:   z.string().datetime(),
    description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').optional().default(''),
    priority:    PrioritySchema.default('medium'),
    dueDate:     z.string().nullable().optional(),
    startTime:   TimeStringSchema.nullable().optional().default(null),
    endTime:     TimeStringSchema.nullable().optional().default(null),
    category:    z.string().trim().max(50, 'Category must be 50 characters or fewer').nullable().optional(),
  })
  .refine(hasValidTimeRange, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoSchema = z
  .object({
    title:       z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
    description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').optional(),
    priority:    PrioritySchema.optional().default('medium'),
    dueDate:     z.string().nullable().optional(),
    startTime:   TimeStringSchema.nullable().optional().default(null),
    endTime:     TimeStringSchema.nullable().optional().default(null),
    category:    z.string().trim().max(50, 'Category must be 50 characters or fewer').nullable().optional(),
  })
  .refine(hasValidTimeRange, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>

export const TodoPatchSchema = z
  .object({
    title:       z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer').optional(),
    completed:   z.boolean().optional(),
    description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').optional(),
    priority:    PrioritySchema.optional(),
    dueDate:     z.string().nullable().optional(),
    startTime:   TimeStringSchema.nullable().optional(),
    endTime:     TimeStringSchema.nullable().optional(),
    category:    z.string().trim().max(50, 'Category must be 50 characters or fewer').nullable().optional(),
  })
  .refine(d => Object.keys(d).length > 0, { message: 'At least one field required' })
  .refine(hasValidTimeRange, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type TodoPatchInput = z.infer<typeof TodoPatchSchema>
```

### Error types

```ts
// src/lib/errors.ts
export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Todo "${id}" not found`)
    this.name = 'NotFoundError'
  }
}
```

### TodoService interface

```ts
// src/services/todo-service.ts
import type { Todo, CreateTodoInput, TodoPatchInput, Priority } from '@/lib/schemas'

export type TodoFilter = 'all' | 'active' | 'completed'
export type SortOption = 'newest' | 'dueDate' | 'priority'

export interface ListOptions {
  filter?: TodoFilter
  priority?: Priority | 'all'
  category?: string | 'all'
  sortBy?: SortOption
}

export interface TodoService {
  /** Returns todos sorted and filtered according to options. */
  list(options?: ListOptions | TodoFilter): Promise<Todo[]>

  /** Creates a todo validating against CreateTodoSchema. */
  create(data: CreateTodoInput | { title: string }): Promise<Todo>

  /** Applies patch to matching todo. Throws NotFoundError if id does not exist. */
  update(id: string, patch: TodoPatchInput): Promise<Todo>

  /** Removes matching todo. Throws NotFoundError if id does not exist. */
  remove(id: string): Promise<void>
}
```

### Folder structure

```text
src/
  app/                          # Next.js App Router pages and layouts
    globals.css
    layout.tsx
    page.tsx
    api/todos/                  # V2 only: route handlers
  lib/
    schemas.ts                  # Todo type, Priority, TimeStringSchema, Zod schemas
    errors.ts                   # NotFoundError
  services/
    todo-service.ts             # Interface + TodoFilter, ListOptions, SortOption types
    local-todo-service.ts       # V1/V1.x localStorage implementation
    theme-storage.ts            # V1.2+ theme preference storage helper (theme:v1)
    index.ts                    # Active service export + storage/theme helpers
    http-todo-service.ts        # V2 HTTP implementation
  hooks/
    use-todos.ts                # React hook; depends only on TodoService
    use-theme.ts                # V1.2+ React hook for Light/Dark/System theme mode
  components/                   # UI components; no direct storage or fetch
    AddTodoForm.tsx             # V1.3 Quick Command Bar + Modal Composer
    CalendarScheduleView.tsx    # V1.3 Interactive Calendar & Schedule View
    DashboardOverview.tsx       # V1.3 Today's Dashboard (stats, progress, Tasks for the Day)
    FilterBar.tsx
    NotificationCenter.tsx      # V1.3 Header Notification Bell & Popover
    ThemeToggle.tsx             # V1.2+ Light / Dark / System switcher
    TodoItem.tsx                # V1.3+ Task card with time-block badge & edit inputs
    TodoList.tsx
  server/                       # V2 only: DB client, Drizzle schema, repository
test/                           # V1.2+: All Vitest unit, component, and contract tests
  sanity.test.ts
  app/
    page.test.tsx
  components/
    AddTodoForm.test.tsx
    CalendarScheduleView.test.tsx
    DashboardOverview.test.tsx
    FilterBar.test.tsx
    NotificationCenter.test.tsx
    ThemeToggle.test.tsx
    TodoItem.test.tsx
    TodoList.test.tsx
  hooks/
    use-todos.test.ts
  services/
    local-todo-service.test.ts
    todo-service.contract.ts
e2e/                            # Playwright end-to-end tests
```

---

## Version 1 Plan — localStorage (Completed)

Completed and verified on branch `auto/v1`. Full baseline CRUD and client-side resilience.

---

## Version 1.1 Plan — Rich Metadata & Enhanced Controls (Completed)

Completed and verified on branch `auto/v1.1` (merged to `main`). Added `description`, `priority`, `dueDate`, `category`, rich inline edit, and advanced filtering/sorting.

---

## Version 1.2 Plan — `/test` Directory Reorganization, Softer Dark Mode, & Intuitive UI Redesign (Completed)

Completed and verified on branch `auto/v1.2` (merged to `main`).

### What is new
1. **Dedicated `/test` Directory**:
   - Move all unit, component, and contract test files from `src/` into `test/` mirroring the `src/` folder hierarchy.
   - Update `vitest.config.ts` so `include` targets `test/**/*.{test,spec}.{ts,tsx}`.
   - Keep `src/` strictly for production application code.
2. **Softer Dark Mode Palette & Interactive Theme Switcher**:
   - Configure Tailwind CSS v4 class-based dark mode in `src/app/globals.css` (`@custom-variant dark (&:where(.dark, .dark *));`) alongside softer dark mode CSS variables (`--background: #0f172a`, `--foreground: #f1f5f9`).
   - Add `src/services/theme-storage.ts` (`getStoredTheme`, `setStoredTheme` using key `theme:v1`) and export via `src/services/index.ts` so components and hooks continue to obey the ESLint `no-restricted-globals` rule for `localStorage`.
   - Add `src/hooks/use-theme.ts` and `src/components/ThemeToggle.tsx` allowing the user to toggle between **Light**, **Dark**, and **System** modes, applying or removing `.dark` on `document.documentElement`.
   - Replace pitch-black `dark:from-zinc-950` / `dark:bg-zinc-900` backgrounds across `page.tsx`, `AddTodoForm.tsx`, `TodoItem.tsx`, `TodoList.tsx`, and `FilterBar.tsx` with a balanced, eye-friendly slate palette (`dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40`, elevated `dark:bg-slate-800/90` cards, and `dark:bg-slate-700/60` inputs).
3. **Intuitive Dashboard UI Redesign**:
   - **Dashboard Header & Progress Summary (`page.tsx`)**: Header bar pairing the title and `ThemeToggle` with a completion progress card (`role="progressbar"`, percentage indicator, and stat pills for **Total**, **Active**, and **Completed** tasks).
   - **Streamlined Filter & Sort Toolbar (`FilterBar.tsx`)**: Clean two-tier filter bar with a one-click **Reset filters** button (`aria-label="Reset filters"`) visible whenever status, priority, or category filters are active.
   - **Priority-Accented Todo Cards (`TodoItem.tsx`)**: Left accent border (`border-l-4`) color-coded by priority (`high` rose, `medium` amber, `low` blue) for instant visual scanning, plus refined spacing and badge contrast.

### Open Decisions for V1.2
- None (`OPEN` count: 0).

---

## Version 1.3 Plan — Zero-Flash Warm Graphite Dark Mode, Modal Composer, Time-Blocking & Today's Dashboard

**Design Reference**: Relies on [`design.md`](file:///c:/Users/hp/Documents/hng/todo-list/design.md) (`Design V1.3: APPROVED by human on 2026-09-30`), including Section 2 (Warm Graphite tokens), Section 3 (Desktop/Mobile layouts), Section 4 (Components 4.1–4.6), Section 6 (Microcopy), and Section 7 (Verified WCAG contrast pairs).

### What is new in Version 1.3 (and what it leaves alone)
1. **Time-Blocking Data Model & Sorting (`src/lib/schemas.ts`, `src/services/local-todo-service.ts`, `src/hooks/use-todos.ts`)**:
   - Adds optional, nullable `startTime` and `endTime` (`"HH:mm"` 24-hour format, defaulting to `null`) to `TodoSchema`, `CreateTodoSchema`, and `TodoPatchSchema`.
   - Enforces `endTime > startTime` whenever both `startTime` and `endTime` are non-null (both on create and when merging a patch with an existing todo in `LocalTodoService.update`), failing with `"End time must be after start time"`.
   - Preserves 100% backwards compatibility with existing V1, V1.1, and V1.2 records in `localStorage` (`todos:v1`) by defaulting missing `startTime` and `endTime` to `null`.
   - Enhances `sortBy: 'dueDate'` in `LocalTodoService` and `useTodos` so todos sharing the same `dueDate` are sorted chronologically by `startTime` (earliest `startTime` first; items without a `startTime` placed after time-blocked items on that same date).
   - Leaves the `TodoService` method signatures (`list`, `create`, `update`, `remove`) and storage keys (`todos:v1`, `theme:v1`) unchanged.
2. **Zero-Flash Theme Initialization & Warm Graphite Dark Palette (`src/app/layout.tsx`, `src/app/globals.css`, components)**:
   - Injects a synchronous blocking `<script>` in `<head>` inside `src/app/layout.tsx` that reads `localStorage.getItem("theme:v1")` (or falls back to `window.matchMedia("(prefers-color-scheme: dark)").matches`) and applies `.dark` to `document.documentElement` before first paint so reloading never flashes light.
   - Replaces the blue-tinted `slate-900` (`#0f172a`) dark background across the app with the approved **Warm Graphite** surface hierarchy from `design.md`: `#121316` page canvas (`dark:bg-[#121316]`), `#1a1d24` elevated cards/modals (`dark:bg-[#1a1d24]`), `#22262f` inputs/controls (`dark:bg-[#22262f]`), and `#2e3340` borders (`dark:border-[#2e3340]`).
   - Removes initial page-load background transition classes on `<body>`/`<main>` that previously caused a visible fade from light to dark on load.
3. **Demarcated Task Creation & Modal Composer (`src/components/AddTodoForm.tsx`, `src/components/TodoItem.tsx`, `src/app/page.tsx`)**:
   - Renders `AddTodoForm` inside its own dedicated Quick Command card (`aria-label="Create task"`), visually demarcated from the Task Board card below.
   - Clicking `Toggle details` (`aria-label="Toggle details"`) opens an accessible **Modal Dialog** (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details and schedule"`) with Description, Priority, Due Date, `Start time` (`aria-label="Start time"`), `End time` (`aria-label="End time"`), and Category + preset chips, closing automatically on valid submission or when pressing `Escape` / clicking `Close modal`.
   - Updates `TodoItem.tsx` to render a monospace time-block badge (e.g., `09:00 – 10:30`) when `startTime` or `endTime` is set, and adds `Edit start time` (`aria-label="Edit start time"`) and `Edit end time` (`aria-label="Edit end time"`) inputs in inline edit mode.
4. **Today's Dashboard, Interactive Calendar & Schedule View, and Notification Center**:
   - **`src/components/DashboardOverview.tsx`**: Renders the `Task progress summary` card with daily stat pills (**Total**, **Active**, **Completed**, **Due Today**), completion `role="progressbar"`, and a **Tasks for the Day** section (`aria-label="Tasks for the day"`) listing todos due today (`dueDate === today`) ordered by `startTime`, with interactive completion checkboxes and time-block pills.
   - **`src/components/CalendarScheduleView.tsx`**: Interactive date navigator (`Previous day`, `Today`, `Next day`, date picker `aria-label="Select schedule date"`, and 7-day week strip) plus a daily schedule separating **Time-Blocked Schedule** (`startTime – endTime`) from **All-Day / Unscheduled Tasks** for the selected date.
   - **`src/components/NotificationCenter.tsx`**: Header `Notifications` button (`aria-label="Notifications"`) with an active count badge for overdue incomplete tasks and today's scheduled incomplete tasks, toggling an accessible `Notifications panel` popover (`role="region"`, `aria-label="Notifications panel"`).
   - **`src/app/page.tsx`**: Integrates `NotificationCenter`, `DashboardOverview`, demarcated `AddTodoForm`, workspace view switcher (**Tasks** | **Calendar & Schedule** | **Split View**), `TodoList`/`FilterBar`, and `CalendarScheduleView`.

### Storage & Data Model Details (Version 1.3)
- **Todo Storage Key**: `todos:v1` in browser `localStorage` (JSON array of `Todo` objects).
- **Theme Storage Key**: `theme:v1` in browser `localStorage` (`"light"` | `"dark"` | `"system"`).
- **Stored Todo JSON Shape**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Architecture sync & API review",
    "completed": false,
    "createdAt": "2026-09-30T08:00:00.000Z",
    "updatedAt": "2026-09-30T08:00:00.000Z",
    "description": "Review V1.3 schema and schedule views",
    "priority": "high",
    "dueDate": "2026-09-30",
    "startTime": "09:00",
    "endTime": "10:30",
    "category": "Work"
  }
  ```

### Files Expected to be Added or Changed in Version 1.3

| File | Change |
| :--- | :--- |
| `src/lib/schemas.ts` | Add `TimeStringSchema` (`HH:mm`), nullable `startTime` and `endTime` (`default(null)`), and `endTime > startTime` refinement to `TodoSchema`, `CreateTodoSchema`, and `TodoPatchSchema` |
| `src/services/local-todo-service.ts` | Normalize `startTime` and `endTime` to `null` on legacy records, validate merged `startTime`/`endTime` on `update`, and sort same-date items by `startTime` when `sortBy === 'dueDate'` |
| `src/hooks/use-todos.ts` | Include `startTime` chronological secondary sort when sorting by `dueDate` |
| `src/app/layout.tsx` | Add synchronous `<head>` theme initialization script and Warm Graphite `dark:bg-[#121316]` body classes |
| `src/app/globals.css` | Update `.dark` CSS custom properties to Warm Graphite (`--background: #121316`, `--foreground: #f4f4f5`) |
| `src/components/AddTodoForm.tsx` | Convert `Toggle details` into an accessible Modal Dialog (`role="dialog"`) with `Start time` and `End time` inputs and Warm Graphite tokens |
| `src/components/TodoItem.tsx` | Render `startTime – endTime` time-block badge, add `Edit start time` / `Edit end time` inputs in edit mode, and apply Warm Graphite tokens |
| `src/components/TodoList.tsx` | Apply Warm Graphite dark surface and border tokens |
| `src/components/FilterBar.tsx` | Apply Warm Graphite dark surface and control tokens |
| `src/components/ThemeToggle.tsx` | Apply Warm Graphite dark control tokens |
| `src/components/DashboardOverview.tsx` | **New component**: Stat pills, completion progress bar, and **Tasks for the Day** section |
| `src/components/CalendarScheduleView.tsx` | **New component**: Date navigator, 7-day strip, and daily **Time-Blocked Schedule** + **All-Day Tasks** |
| `src/components/NotificationCenter.tsx` | **New component**: Header `Notifications` button, active reminder count badge, and notifications popover |
| `src/app/page.tsx` | Integrate `NotificationCenter`, `DashboardOverview`, demarcated Quick Command card, workspace view tabs (**Tasks**, **Calendar & Schedule**, **Split View**), and `CalendarScheduleView` |
| `test/services/todo-service.contract.ts` | Add contract tests for `startTime`/`endTime` creation, defaults, `endTime <= startTime` rejection, and `dueDate` + `startTime` sorting |
| `test/services/local-todo-service.test.ts` | Add legacy backwards-compatibility test for missing `startTime`/`endTime` |
| `test/hooks/use-todos.test.ts` | Add hook test for `sortBy: 'dueDate'` ordering same-day items by `startTime` |
| `test/components/AddTodoForm.test.tsx` | Add tests for Modal Dialog (`role="dialog"`), `Start time`/`End time` submission, invalid time range alert, and `Escape` dismissal |
| `test/components/TodoItem.test.tsx` | Add tests for time-block badge rendering and editing `startTime`/`endTime` |
| `test/components/DashboardOverview.test.tsx` | **New test file**: Tests **Tasks for the Day** ordering, completion toggle, empty state, and progress stats |
| `test/components/CalendarScheduleView.test.tsx` | **New test file**: Tests date switching, time-blocked slots, and all-day tasks |
| `test/components/NotificationCenter.test.tsx` | **New test file**: Tests badge count for overdue + today's scheduled tasks and popover toggle |
| `test/app/page.test.tsx` | Update integration tests for Warm Graphite theme, Today's Dashboard, Notification Center, and workspace view switching |
| `e2e/todos.spec.ts` | Add E2E tests for zero-flash dark reload (`#121316`), modal time-block creation, Today's Dashboard, Calendar & Schedule view, and Notification Center |

### Test Strategy for Version 1.3
- **Contract & Unit (`test/services/`, `test/hooks/`)**: Verify `startTime`/`endTime` validation, `null` defaults, `endTime <= startTime` error handling, backwards compatibility with legacy `localStorage` items, and chronological `startTime` sorting.
- **Component (`test/components/`, `test/app/`)**: Verify modal `role="dialog"` behavior, time-block badge & edit inputs, `DashboardOverview` (**Tasks for the Day**), `CalendarScheduleView`, `NotificationCenter`, and workspace view tabs using accessible `getByRole`/`getByLabelText` queries.
- **End-to-End (`e2e/todos.spec.ts`)**: Verify dark mode has `class="dark"` and `rgb(18, 19, 22)` (`#121316`) immediately on reload without flashing, and verify creating a time-blocked task for today via the Modal Composer updates Today's Dashboard, Calendar & Schedule view, and Notification Center.

### Risks and Open Decisions for Version 1.3
- **Open Decisions**: None (`0` `OPEN` items). Every requirement and design token has been specified and approved in `requirements.md` and `design.md`.

---

## Version 1.4 Plan — Full-Viewport Sidebar Workspace, Dedicated Metric Cards, Month-by-Month Calendar Grid & True Modal System

**Design Reference**: Relies on [`design.md`](file:///c:/Users/hp/Documents/hng/todo-list/design.md) (`Design V1.4: APPROVED by human on 2026-09-30`), including Section 1 (Principles), Section 2 (Tokens & Layout), Section 3 (Desktop/Mobile Wireframes), Section 4 (Components 4.7–4.18), Section 6 (Microcopy), Section 7 (Accessibility & Contrast), and the interactive mockup at [`design/mockups/v1.4.html`](file:///c:/Users/hp/Documents/hng/todo-list/design/mockups/v1.4.html).

### What is new in Version 1.4 (and what it leaves alone)

1. **Full-Viewport Workspace Shell & Sidebar Navigation (`src/app/page.tsx`, `src/components/SidebarNav.tsx`, `src/components/ContentHeader.tsx`)**:
   - Replaces the centered narrow-column container (`max-w-2xl` / `max-w-5xl`) with a full-viewport root shell (`w-screen h-screen overflow-hidden flex flex-col lg:flex-row`).
   - Adds `src/components/SidebarNav.tsx`: a desktop left navigation rail (`w-60 flex-none flex flex-col justify-between bg-slate-100 dark:bg-[#161920] border-r border-slate-200 dark:border-[#2e3340] p-4`) containing workspace branding, three primary view buttons (**Dashboard**, **Tasks**, **Calendar**) with `aria-current="page"` when active, and the `<ThemeToggle>` anchored at the bottom.
   - Adds `src/components/ContentHeader.tsx`: top content bar displaying the active view title/subtitle on the left, and on the right the primary **`+ New Task`** CTA button (`aria-label="Open new task modal"`) beside the `<NotificationCenter>` trigger (and mobile theme toggle).
   - In `src/app/page.tsx`, manages active view state (`activeView: "dashboard" | "tasks" | "calendar"`) without Next.js route navigation (instantaneous client-side switch), and renders a responsive bottom navigation bar (`<nav aria-label="Mobile navigation">`) on mobile devices.
2. **Executive Dashboard View, Metric Cards Grid & Panels (`src/components/MetricCard.tsx`, `src/components/DashboardView.tsx`, `src/components/Toast.tsx`)**:
   - Replaces the compact horizontal stat pill row with 4 dedicated, responsive grid cards (`src/components/MetricCard.tsx`) for **Total Tasks**, **Active Tasks** (`"tasks remaining"`), **Completed Tasks** (with mini progress bar), and **Critical Tasks** (`"high priority"`).
   - Adds a single-row **Quick Add Task Bar** on the Dashboard for rapid title-only task creation without opening a modal.
   - Renders a **Today's Tasks** panel listing tasks due today ordered chronologically by `startTime`, with time-block badges and inline completion checkboxes.
   - Adds an **Important / Critical Tasks** panel highlighting active high-priority (`priority === "high"`) tasks with a direct `Edit` action button.
   - Adds a **Recent Tasks** panel displaying the 5 most recently created tasks with relative timestamp labels.
   - Adds `src/components/Toast.tsx` providing auto-dismissing, non-disruptive feedback (`role="status"`, `aria-live="polite"`) on task mutations.
3. **True Centered Modal System & Dedicated Tasks Board (`src/components/AddTaskModal.tsx`, `src/components/TaskDetailsModal.tsx`, `src/components/EditTaskModal.tsx`, `src/components/TasksView.tsx`, `src/components/TodoItem.tsx`)**:
   - Replaces inline list expansion with three centered modal overlays (`role="dialog"`, `aria-modal="true"`):
     - **Add Task Modal (`AddTaskModal.tsx`)**: Full-metadata task composer (Title, Description, Priority, Due Date, Start Time, End Time, Category), triggered by the header `+ New Task` button and Tasks view button.
     - **Task Details Modal (`TaskDetailsModal.tsx`)**: Clean inspection dialog displaying all metadata, time-block, and notes, with direct actions to Complete, Edit, or Delete.
     - **Edit Task Modal (`EditTaskModal.tsx`)**: Pre-populated form dialog for editing all fields of an existing task.
   - Simplifies `TodoItem.tsx` to a view-mode only item row: clicking title opens Task Details Modal, clicking Edit opens Edit Task Modal, clicking checkbox toggles complete, clicking Delete confirms deletion.
   - Creates `TasksView.tsx`: dedicated full-width task management board containing filters, sort options, and the task list.
4. **Interactive Full Month Calendar Grid & Daily Schedule (`src/components/CalendarView.tsx`)**:
   - Replaces the 7-day strip with a full 7-column month-by-month grid (Sunday through Saturday).
   - Displays month/year heading, previous/next month navigation buttons, a `Today` jump button, and a native month selector.
   - Visually indicates **Today's date** (indigo background), the **Selected date** (ring/accent), and renders colored task count dots on each cell (rose for high priority, indigo for default).
   - Pairs the month grid with a side-by-side **Daily Schedule** panel displaying that date's **Time-Blocked Schedule** slots and **All-Day / Unscheduled** tasks with independent panel scrolling (`overflow-y-auto`).
5. **What Version 1.4 Leaves Alone**:
   - The underlying `Todo` data schema (`src/lib/schemas.ts`), `TodoService` interface, and `localStorage` storage keys (`todos:v1`, `theme:v1`) remain unchanged and 100% backwards compatible.
   - Zero-flash dark mode script and Warm Graphite color hierarchy remain preserved.

### Files Expected to be Added or Changed in Version 1.4

| File | Change |
| :--- | :--- |
| `src/components/SidebarNav.tsx` | **New component**: Desktop left sidebar with brand, navigation buttons (`Dashboard`, `Tasks`, `Calendar`), and anchored Theme Toggle |
| `src/components/ContentHeader.tsx` | **New component**: View title/subtitle, persistent `+ New Task` CTA button, and Notification Center bell |
| `src/components/MetricCard.tsx` | **New component**: Reusable 4-up metric card with large numeral, label, and progress/accent |
| `src/components/Toast.tsx` | **New component**: Transient status notification container (`role="status"`, `aria-live="polite"`) |
| `src/components/DashboardView.tsx` | **New component**: Composes Metric Cards grid, Quick Add Bar, Today's Tasks, Critical Tasks, and Recent Tasks |
| `src/components/TasksView.tsx` | **New component**: Dedicated full-width task management board embedding `FilterBar` and `TodoList` |
| `src/components/AddTaskModal.tsx` | **New component**: Centered modal dialog (`role="dialog"`) for full-metadata task creation |
| `src/components/TaskDetailsModal.tsx` | **New component**: Inspection dialog (`role="dialog"`) with complete, edit, and delete actions |
| `src/components/EditTaskModal.tsx` | **New component**: Centered modal dialog (`role="dialog"`) for editing all task fields |
| `src/components/TodoItem.tsx` | Simplify to view-only item row; wire title click to Details modal and Edit button to Edit modal |
| `src/components/CalendarView.tsx` | **New component**: 7-column month grid with day cells, task count dots, and daily schedule panel (replaces `CalendarScheduleView.tsx`) |
| `src/app/page.tsx` | Refactor root to `flex h-screen overflow-hidden` with client-side view router and mobile bottom navigation bar |
| `test/components/SidebarNav.test.tsx` | **New test file**: Tests sidebar rendering, navigation clicks, active `aria-current="page"`, and theme toggle |
| `test/components/ContentHeader.test.tsx` | **New test file**: Tests view title/subtitle, `+ New Task` button, and notification bell |
| `test/components/MetricCard.test.tsx` | **New test file**: Tests metric cards display correct values and progress indicator |
| `test/components/Toast.test.tsx` | **New test file**: Tests toast rendering, accessibility attributes, and auto-dismissal |
| `test/components/DashboardView.test.tsx` | **New test file**: Tests Quick Add submission, Today's Tasks, Critical Tasks, and Recent Tasks panels |
| `test/components/TasksView.test.tsx` | **New test file**: Tests full-width task board with filters and task actions |
| `test/components/AddTaskModal.test.tsx` | **New test file**: Tests modal open/close, full metadata submit, error validation, and Escape key handling |
| `test/components/TaskDetailsModal.test.tsx` | **New test file**: Tests task inspection, complete toggle, edit trigger, and delete confirmation |
| `test/components/EditTaskModal.test.tsx` | **New test file**: Tests pre-population, field editing, validation alerts, and save changes |
| `test/components/TodoItem.test.tsx` | Update tests for view-only row triggers (click to view details, click to edit) |
| `test/components/CalendarView.test.tsx` | **New test file**: Tests 7-column month grid, month navigation, today highlight, and day schedule selection |
| `test/app/page.test.tsx` | Update integration tests for full-viewport shell, active view switching, and modals |
| `e2e/todos.spec.ts` | Update end-to-end tests to verify sidebar navigation, dashboard metric cards, month calendar grid, and modal flows |

### Open Decisions for Version 1.4
- None (`0` `OPEN` items — all choices resolved and verified in `design.md`).

---

## Version 2 Plan — Server Persistence via Neon PostgreSQL, Drizzle ORM & Next.js Route Handlers

### Goal
Migrate data persistence from browser `localStorage` to a serverless PostgreSQL database (Neon) using Drizzle ORM and Next.js App Router Route Handlers (`/api/todos` and `/api/todos/[id]`). The client interacts with the backend through `HttpTodoService`, implementing the same `TodoService` interface established in Version 1. **Zero changes** will be made to UI components (`src/components/`) or client hooks (`src/hooks/`), preserving all Version 1.4 features (workspace shell, executive dashboard, metric cards, modal system, full month calendar grid, daily schedule, notifications, filters, and sorting).

### Architecture & Service Boundary

```
[UI Components & Hooks]
         │ (calls TodoService interface)
         ▼
[HttpTodoService (src/services/http-todo-service.ts)]
         │ (HTTP fetch)
         ▼
[Next.js Route Handlers (src/app/api/todos/)]
         │ (validates with src/lib/schemas.ts)
         ▼
[TodoRepository (src/server/todo-repository.ts)]
         │ (Drizzle ORM queries)
         ▼
[Neon PostgreSQL Database]
```

- `src/services/index.ts` is the single switch that swaps the active client service from `LocalTodoService` to `HttpTodoService`.
- `src/server/` contains database connection logic (`db.ts`), Drizzle relational schema (`schema.ts`), and `TodoRepository` implementing `TodoService`.
- `src/app/api/todos/` contains Route Handlers that validate input with `CreateTodoSchema` and `TodoPatchSchema` and call `TodoRepository`.
- `git diff` under `src/components/` and `src/hooks/` must remain completely empty throughout Version 2.

### Data Model & Drizzle Schema (`src/server/schema.ts`)

PostgreSQL table `todos`:

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` / `varchar(36)` | Primary Key | Unique UUID v4 string |
| `title` | `varchar(200)` | NOT NULL | Todo title (trimmed, 1–200 chars) |
| `completed` | `boolean` | NOT NULL, DEFAULT `false` | Completion status |
| `description` | `text` | NULLABLE, DEFAULT `''` | Optional notes (up to 1,000 chars) |
| `priority` | `varchar(20)` | NOT NULL, DEFAULT `'medium'` | `'low'`, `'medium'`, or `'high'` |
| `due_date` | `varchar(50)` | NULLABLE | ISO date string (`YYYY-MM-DD`) |
| `start_time` | `varchar(10)` | NULLABLE | 24h start time (`HH:mm`) |
| `end_time` | `varchar(10)` | NULLABLE | 24h end time (`HH:mm`) |
| `category` | `varchar(50)` | NULLABLE | Category preset or custom tag |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT `now()` | ISO timestamp |
| `updated_at` | `timestamp with time zone` | NOT NULL, DEFAULT `now()` | ISO timestamp |

### API Contract (`src/app/api/todos`)

All endpoints accept and return JSON. Errors follow a standardized shape: `{ error: string, details?: Record<string, string[]> }`.

| Method | Path | Request Body | Success Status | Success Response | Error Statuses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/todos` | None | `200 OK` | `Todo[]` (or `{ todos: Todo[] }`) | `500` (unexpected error) |
| `POST` | `/api/todos` | `CreateTodoInput` | `201 Created` | `Todo` | `400` (Zod validation failure), `500` |
| `PATCH` | `/api/todos/[id]` | `TodoPatchInput` | `200 OK` | `Todo` | `400` (validation failure), `404` (not found), `500` |
| `DELETE` | `/api/todos/[id]` | None | `200 OK` / `204 No Content` | `{ success: true }` / Empty | `404` (not found), `500` |

### Files Expected to be Added or Changed in Version 2

| File | Change |
| :--- | :--- |
| `package.json` | Add `drizzle-orm`, `@neondatabase/serverless` to dependencies; add `drizzle-kit`, `dotenv` to devDependencies; add `db:generate` and `db:migrate` scripts |
| `drizzle.config.ts` | **New file**: Drizzle Kit configuration pointing to `src/server/schema.ts` and `drizzle/` migrations folder |
| `src/server/db.ts` | **New file**: Neon connection pool / HTTP client setup with Drizzle ORM |
| `src/server/schema.ts` | **New file**: PostgreSQL `todos` table definition |
| `src/server/todo-repository.ts` | **New file**: Implements `TodoService` using Drizzle queries against Neon |
| `src/app/api/todos/route.ts` | **New file**: Route Handler for `GET` (list all) and `POST` (create todo) |
| `src/app/api/todos/[id]/route.ts` | **New file**: Route Handler for `PATCH` (update todo) and `DELETE` (delete todo) |
| `src/services/http-todo-service.ts` | **New file**: Implements `TodoService` via client `fetch('/api/todos')` |
| `src/services/index.ts` | Switch active export from `localTodoService` to `httpTodoService` |
| `test/server/todo-repository.test.ts` | **New test file**: Tests `TodoRepository` against contract suite |
| `test/api/todos.test.ts` | **New test file**: Tests route handlers for status codes, validation errors, and happy paths |
| `test/services/http-todo-service.test.ts` | **New test file**: Tests `HttpTodoService` against contract suite with mocked fetch responses |
| `e2e/todos.spec.ts` | Ensure E2E tests run against the server API and verify persistence across reload |
| `README.md` | Update architecture section to describe Neon PostgreSQL + Drizzle ORM backend and environment setup |

### Testing & Quality Strategy

1. **Repository Contract Tests (`test/server/todo-repository.test.ts`)**:
   - Runs the standard `todo-service.contract.ts` suite against `TodoRepository` using an isolated test database (or in-memory mock schema).
2. **API Route Handler Tests (`test/api/todos.test.ts`)**:
   - Directly tests `GET`, `POST`, `PATCH`, `DELETE` handlers for proper HTTP status codes (`200`, `201`, `400`, `404`, `500`) and Zod error formatting.
3. **HTTP Service Tests (`test/services/http-todo-service.test.ts`)**:
   - Verifies `HttpTodoService` translates contract methods into correct HTTP requests, handles network errors, and parses server responses.
4. **End-to-End Tests (`e2e/todos.spec.ts`)**:
   - Validates that the full application works identically against the live server backend, persisting data across page reloads.

### Open Decisions for Version 2
- **None (`0` `OPEN` items)**: Database engine confirmed as Neon PostgreSQL via `@neondatabase/serverless` + Drizzle ORM. Service boundary and API shape adhere strictly to project rules.

---

## Version 2.1 Plan — High-Fidelity UI Polish, Tasks Search, Category Filter, Lucide Icons, Date Formatting & Calendar Interactivity

**Mockup Reference**: Relies on [`design/mockups/v1.4.html`](file:///c:/Users/hp/Documents/hng/todo-list/design/mockups/v1.4.html) and [`requirements.md`](file:///c:/Users/hp/Documents/hng/todo-list/requirements.md) (Version 2.1).

### Goal

Align the UI implementation directly with the high-fidelity HTML mockup in `design/mockups/v1.4.html`, resolving all user-identified gaps: replace raw SVGs and emojis with cohesive `lucide-react` iconography, introduce a real-time search input and category filter dropdown in the Tasks Board toolbar (while removing redundant `+ New Task` toolbar button), implement the exact mockup task card with short readable dates (`Sep 30, 2026`) and overdue cancellation styling, enable inspecting and editing tasks directly from the Calendar view, and polish loading, empty, and error feedback states—all while keeping full server persistence on Neon PostgreSQL via Drizzle ORM and `HttpTodoService`.

### What is New in Version 2.1 (and what it leaves alone)

1. **Crisp Lucide React Iconography**:
   - Install `lucide-react`.
   - Replace emojis and generic SVGs across the entire application with standard Lucide React icons:
     - Sidebar (`SidebarNav.tsx`): `LayoutDashboard` (Dashboard), `CheckSquare` (Tasks), `Calendar` (Calendar).
     - Content Header (`ContentHeader.tsx`): `Plus` (New Task), `Bell` (Notifications).
     - Metric Cards (`MetricCard.tsx`): `ClipboardList` (Total), `Zap` (Active), `CheckCircle2` (Completed), `Flame` (Critical).
     - Dashboard Sections (`DashboardView.tsx`): `Flame` (Important/Critical), `Clock` (Recent Tasks), `Plus` (Quick Add).
     - Tasks Toolbar (`TasksView.tsx`, `FilterBar.tsx`): `Search` (Search tasks input), `Tag` (Category filter).
     - Task Cards & Items (`TodoItem.tsx`, `TaskDetailsModal.tsx`, `EditTaskModal.tsx`): `Pencil` / `SquarePen` (Edit), `Trash2` / `X` (Delete), `Calendar` (Due Date), `Clock` (Time block).
     - Calendar (`CalendarView.tsx`): `ChevronLeft` (Previous Month), `ChevronRight` (Next Month).
2. **Tasks Board Toolbar Search & Category Filter**:
   - In `TasksView.tsx` / `FilterBar.tsx`, add a live search text input (`aria-label="Search tasks"`, placeholder `"Search tasks..."`) that filters tasks matching title or description in real time.
   - Add a dedicated category filter dropdown (`aria-label="Filter by category"`, options: `All Categories` plus dynamically extracted categories from existing tasks) alongside Status tabs (`All`, `Active`, `Done`), Priority filter, and Sort selector.
   - Remove redundant `+ New Task` button from the Tasks board toolbar (as the primary `+ New Task` CTA is persistently anchored in the top content header).
3. **Exact Mockup Task Card, Short Date Formatting & Overdue Treatment**:
   - In `TodoItem.tsx` and wherever dates are rendered: format dates as short, human-readable strings (e.g. `Sep 30, 2026` via a lightweight date formatter helper) instead of raw `YYYY-MM-DD`.
   - Adopt the exact task card layout from `design/mockups/v1.4.html`:
     - Left accent border (`border-l-4 border-l-rose-500` for high, `border-l-amber-500` for medium, `border-l-blue-500` for low, `border-l-emerald-500` for completed).
     - Single-line title and 1-line description (`line-clamp-1 text-slate-500 dark:text-zinc-400`).
     - Metadata tags row: Priority badge (`high`, `medium`, `low`), Category badge (e.g. `Work`), Time-block badge (`09:00 – 10:30` / `All day`), and Due date tag (`Due: Sep 30, 2026`).
     - Overdue treatment: For any active incomplete task whose due date is in the past, render prominent `Overdue (<date>)` badge and visual strike-through/cancel out treatment matching the mockup (`Fix zero-flash theme bug in Safari` - `Overdue (Sep 28)`).
     - Inline action buttons: `Edit` button and `✕` delete button with click propagation stopped, while clicking the card body opens `TaskDetailsModal`.
4. **Calendar View Task Interactivity (View & Edit)**:
   - In `CalendarView.tsx`, allow clicking any scheduled task item in the Daily Schedule panel or day view to open `TaskDetailsModal` for full inspection, with direct action to open `EditTaskModal`.
5. **Polished Application States**:
   - Loading state: sleek skeleton or spinner while tasks are fetched from `/api/todos`.
   - Empty states: contextual, informative messages when no tasks match current search/filter criteria.
   - Error states: accessible toast and banner notifications when network or server operations encounter issues.
6. **What Version 2.1 Leaves Alone**:
   - The underlying PostgreSQL schema (`src/server/schema.ts`), Route Handlers (`src/app/api/todos/`), and `TodoService` interface remain unchanged.
   - Binary completion (`completed: boolean` / Active vs. Done) is strictly preserved (no `in_progress` field, keeping single-click toggle performance).

### Files Expected to be Added or Changed in Version 2.1

| File | Change |
| :--- | :--- |
| `package.json` | Add `lucide-react` dependency |
| `src/lib/date-utils.ts` | **New file**: Helper to format dates as short human-readable strings (e.g. `Sep 30, 2026`) and calculate overdue status |
| `src/components/SidebarNav.tsx` | Replace SVG icons with Lucide React `LayoutDashboard`, `CheckSquare`, `Calendar` |
| `src/components/ContentHeader.tsx` | Replace SVG icons with Lucide React `Plus`, `Bell` |
| `src/components/MetricCard.tsx` | Replace emojis with Lucide React `ClipboardList`, `Zap`, `CheckCircle2`, `Flame` |
| `src/components/DashboardView.tsx` | Replace emojis with Lucide icons; format short dates; handle overdue badge in Important/Critical panel |
| `src/components/FilterBar.tsx` | Add live search input (`aria-label="Search tasks"`) and category dropdown (`aria-label="Filter by category"`); remove redundant `+ New Task` button |
| `src/components/TodoItem.tsx` | Match exact mockup card: `border-l-4`, 1-line description, short dates, overdue styling, Lucide icons |
| `src/components/CalendarView.tsx` | Replace raw symbols with Lucide `ChevronLeft`, `ChevronRight`; wire task items to `TaskDetailsModal` and `EditTaskModal` |
| `src/components/AddTaskModal.tsx` | Use Lucide icons (`X`, `Clock`, `Calendar`, `Tag`) |
| `src/components/TaskDetailsModal.tsx` | Use Lucide icons; display formatted short dates and overdue badge |
| `src/components/EditTaskModal.tsx` | Use Lucide icons (`X`, `Clock`, `Calendar`, `Tag`) |
| `src/hooks/use-todos.ts` | Support real-time search term filtering across title and description |
| `test/components/FilterBar.test.tsx` | Update tests for search input and category filter |
| `test/components/TodoItem.test.tsx` | Update tests for short date formatting, overdue cancellation styling, and Lucide icons |
| `test/components/CalendarView.test.tsx` | Update tests for clicking tasks to view/edit in modal |
| `test/lib/date-utils.test.ts` | **New test file**: Unit tests for date formatting and overdue checks |
| `e2e/todos.spec.ts` | End-to-end tests for search filtering, category filtering, calendar task modal opening, and overdue display |

### Testing Strategy for Version 2.1

1. **Unit Tests (`test/lib/date-utils.test.ts`)**:
   - Verify date formatting produces short readable dates (`Sep 30, 2026`).
   - Verify overdue calculation correctly flags past active dates while ignoring today/future dates or completed tasks.
2. **Component Tests (`test/components/`)**:
   - Verify `FilterBar` search input fires on change and filters items by text.
   - Verify `FilterBar` category dropdown lists all available categories and filters properly.
   - Verify `TodoItem` applies exact mockup card classes, short dates, and overdue badges.
   - Verify `CalendarView` daily schedule tasks trigger `onSelectTask` to open `TaskDetailsModal`.
3. **End-to-End Tests (`e2e/todos.spec.ts`)**:
   - Full flow: create tasks, search by keyword, filter by category, inspect in Calendar, view details and edit from Calendar.

### Open Decisions for Version 2.1

- **None (`0` `OPEN` items)**: All design questions and user specifications (e.g. dropping `in_progress` to maintain binary checkbox speed, using `lucide-react`, short date format) have been resolved.

