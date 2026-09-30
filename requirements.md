# Requirements

## Goal

A fast, resilient, single-user task and schedule workspace with a full-viewport sidebar layout, an executive Dashboard (dedicated metric cards, Today's Tasks, Important/Critical Tasks, Recent Tasks, and Quick Add), a dedicated Tasks view, a full month-by-month interactive Calendar view, in-app notifications, true modal overlays for creating, inspecting, and editing tasks, and a zero-flash Warm Graphite dark mode experience, with data that persists across reloads. It doubles as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Versions

| Version | Storage & Backend | Core Scope | Status |
| :--- | :--- | :--- | :--- |
| **Version 1** | Browser `localStorage` (`todos:v1`) | Core CRUD: title, completed, basic filters, counter, resilience | **Complete** (`v1`) |
| **Version 1.1** | Browser `localStorage` (`todos:v1`) | Rich metadata: description, priority, due date, category, sorting | **Complete** (`v1.1`) |
| **Version 1.2** | Browser `localStorage` (`todos:v1`, `theme:v1`) | `/test` folder reorganization, theme toggle, dashboard progress stats | **Complete** (`v1.2`) |
| **Version 1.3** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Zero-flash Warm Graphite dark mode, nullable `startTime`/`endTime`, initial schedule & notifications | **Complete** (`v1.3`) |
| **Version 1.4** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Full-viewport Sidebar Workspace (`Dashboard`, `Tasks`, `Calendar`), Dedicated Metric Cards, Critical & Recent Tasks, Full Month-by-Month Calendar Grid, and True Modal Overlays for Add, Edit & Task Details | **Approved** (current target) |
| **Version 2** | Route Handlers + Neon PostgreSQL | REST API routes, Drizzle ORM, server validation, Vercel deployment | Planned |
| **Version 3+** | Multi-user / Cloud sync | Authentication, multi-tenant workspaces, external calendar sync | Postponed |

## Core Features

### Version 1 (Completed)
- Create a todo with a title (required, trimmed, 1 to 200 characters).
- List todos, filterable by **All**, **Active**, and **Completed**.
- Toggle a todo between active and completed.
- Edit a todo's title in place (Enter to save, Escape to cancel).
- Delete a todo permanently.
- Data persists across reloads in browser `localStorage`.
- Storage resilience: visible notices on corrupt storage or storage write failures.
- Keyboard accessible (<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Escape</kbd>) and responsive down to 375px mobile screens.

### Version 1.1 (Completed)
- **Description / Notes**: Optional multiline text field (up to 1,000 characters).
- **Priority**: Categorized as `low`, `medium`, or `high` (defaults to `medium`). Visual badges in list items.
- **Due Date**: Optional date picker/field with ISO format; visual indicator for overdue vs upcoming items.
- **Category / Tags**: Optional category identifier (e.g. Work, Personal, Shopping, Other).
- **Enhanced Filtering & Sorting**: Filter by category or priority; sort by due date or priority in addition to newest-first.
- **Schema Migration**: Seamless backwards compatibility with existing Version 1 `localStorage` todos (missing fields receive default values upon read).

### Version 1.2 (Completed)
- **Dedicated `/test` Directory Structure**:
  - Relocate all Vitest unit, component, and service contract test files out of `src/` into a top-level `test/` directory mirroring `src/` (`test/app/`, `test/components/`, `test/hooks/`, `test/services/`, `test/sanity.test.ts`).
  - Keep `src/` strictly for production application source code and update `vitest.config.ts` accordingly.
- **Interactive Theme Switcher**:
  - Accessible **Theme Toggle** (**Light**, **Dark**, **System**) in the header, persisted under `theme:v1` via the service layer and applied via a `.dark` class on `<html>`.
- **Dashboard Progress & Filter Reset**:
  - Visual completion progress bar and stat pills (Total, Active, Completed) plus a one-click **Reset filters** button when any non-default filter is active.

### Version 1.3 (Completed)
- **Time-Blocking Schema (`startTime` & `endTime`)**:
  - Optional, nullable `startTime` (`"HH:mm"` | `null`, default `null`) and `endTime` (`"HH:mm"` | `null`, default `null`) on `TodoSchema`, `CreateTodoSchema`, and `TodoPatchSchema`.
  - Validation ensuring `endTime > startTime` whenever both `startTime` and `endTime` are provided (`"End time must be after start time"`).
  - Chronological secondary sorting by `startTime` when sorting by `dueDate`.
- **Zero-Flash Theme Load & Warm Graphite Dark Palette**:
  - Synchronous blocking `<script>` in `<head>` inside `src/app/layout.tsx` that reads `localStorage.getItem("theme:v1")` / `prefers-color-scheme: dark` and applies `.dark` to `<html>` before first paint.
  - Neutral **Warm Graphite** dark surface hierarchy (`#121316` page canvas, `#1a1d24` elevated cards, `#22262f` interactive controls, `#2e3340` subtle borders).
- **In-App Notification Center (`NotificationCenter`)**:
  - Header notification button (`aria-label="Notifications"`) with active count badge for **Overdue** and **Today's Scheduled** incomplete tasks, opening an accessible notifications popover.

### Version 1.4 (Current Scope)
- **Full-Viewport Workspace Layout & Sidebar Navigation**:
  - Replace the single narrow column (`max-w-2xl`) with a full-viewport responsive workspace shell (`w-full`, desktop left **Sidebar** + top header bar, and responsive mobile navigation bar).
  - Clear, purposeful navigation items to switch between separate workspace views instead of crowding everything onto one page:
    1. **Dashboard** (`aria-label="Dashboard"`): Executive overview, metrics, today's agenda, critical tasks, recent tasks, and month calendar preview.
    2. **Tasks** (`aria-label="Tasks"`): Focused full-width task management board with filters, sorting, and list actions.
    3. **Calendar** (`aria-label="Calendar"`): Full month-by-month interactive calendar grid alongside the selected day's time-blocked schedule and tasks.
  - Persistent **+ New Task** primary button in the workspace navigation/header that opens the Add Task Modal from any view.
- **Spacious Executive Dashboard (`DashboardOverview`)**:
  - **Dedicated Metric Cards**: 4 full-sized metric cards (in a responsive grid) for **Total Tasks**, **Active Tasks**, **Completed Tasks** (with progress bar), and **Important / Critical Tasks** (active `high` priority count).
  - **Quick Add Task Bar**: Lightweight single-line input on the Dashboard (`aria-label="Todo title"` + `Add Todo` submit button) for rapid title-only task capture without opening the full modal.
  - **Today's Tasks Panel**: Lists tasks due today (`dueDate === today`) ordered chronologically by `startTime`, with time-block badges, quick completion toggles, and click-to-inspect details.
  - **Important / Critical Tasks Panel**: Highlights active high-priority (`priority === "high"`) tasks requiring immediate attention.
  - **Recent Tasks Panel**: Displays the most recently created tasks across the workspace.
- **Full Month-by-Month Calendar Grid (`CalendarScheduleView`)**:
  - Full 7-column monthly calendar grid (`Sun`–`Sat`) displaying the entire month day-by-day.
  - Month-by-month navigation (**Previous month**, **Today**, **Next month**, plus direct date selection) with clear month/year heading (e.g., `September 2026`).
  - Visually highlights **Today's date**, **Selected date**, and displays task count / priority indicators inside each day cell.
  - Clicking any day cell selects that date and updates the adjacent **Daily Schedule** panel (**Time-Blocked Schedule** slots ordered by `startTime` and **All-Day Tasks** for that date).
- **True Modal Overlays for Add, Edit, and Task Details (No Inline List Distortion)**:
  - **Add Task Modal (`role="dialog"`, `aria-modal="true"`)**: Triggered by the **New Task** / **Toggle details** button; renders a centered modal overlay with backdrop where users can submit a task with just a title or full metadata (Description, Priority, Due Date, Start Time, End Time, Category). Closes automatically on submit, `Escape`, or clicking close.
  - **Task Details Modal (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details"`)**: Clicking a task's title/body opens a clean inspection modal displaying the full title, full description/notes, priority badge, category, due date, time block (`startTime – endTime`), and status, with direct action buttons: **Edit**, **Toggle Complete**, and **Delete**.
  - **Edit Task Modal (`role="dialog"`, `aria-modal="true"`, `aria-label="Edit task"`)**: Clicking **Edit** on a task card (or inside the Task Details Modal) opens a centered modal overlay pre-populated with all task fields (Title, Description, Priority, Due Date, Start Time, End Time, Category) instead of expanding an inline form inside the list row.
- **Purposeful, Self-Explanatory Language**:
  - Every navigation item, card header, badge, and button uses natural, direct copy that communicates its exact function (`Dashboard`, `Tasks`, `Calendar`, `New Task`, `Important / Critical`, `Today's Tasks`, `Recent Tasks`).

### Version 2 (Upcoming Backend)
- Neon (PostgreSQL) database backing with Drizzle ORM.
- REST Route Handlers (`src/app/api/todos`).
- Server-side validation matching shared Zod schemas (including `startTime` and `endTime`).

## Todo Shape

```ts
export type Priority = "low" | "medium" | "high";
export type ThemeMode = "light" | "dark" | "system";

export interface Todo {
  id: string;               // UUID
  title: string;            // trimmed, 1–200 chars
  completed: boolean;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  description?: string;     // optional notes, max 1,000 chars
  priority: Priority;       // default: "medium"
  dueDate?: string | null;  // optional ISO 8601 date string (YYYY-MM-DD)
  startTime?: string | null; // optional 24h time string (HH:mm), default: null (V1.3+)
  endTime?: string | null;   // optional 24h time string (HH:mm), default: null (V1.3+)
  category?: string | null; // optional category tag, max 50 chars
}
```

## Tech Stack per Version

### All Versions
- Next.js (current stable App Router) with **`src/` directory** (`src/app`, never root `app`).
- TypeScript strict mode.
- Tailwind CSS v4 (class-based `.dark` variant + Warm Graphite dark surface tokens).
- Zod for runtime schema validation.
- Vitest with React Testing Library (jsdom) for unit, component, and contract tests in `test/`.
- Playwright for end-to-end tests in `e2e/`.
- Package manager: npm.

### Version 1, 1.1, 1.2, 1.3 & 1.4 — Local
- Client-side storage in browser `localStorage` (`todos:v1`, `theme:v1`).
- Asynchronous `TodoService` interface (`LocalTodoService`) and theme storage helper in `src/services/`.
- ESLint boundary banning `localStorage`, `sessionStorage`, and `fetch` from `src/components/` and `src/hooks/`.

### Version 2 — Server & Database
- Neon PostgreSQL serverless database.
- Drizzle ORM and migration management.
- Route Handlers under `src/app/api/todos/`.
- `HttpTodoService` replacing `LocalTodoService` via `src/services/index.ts`.

## Architecture Principle

The UI never directly accesses `localStorage` or `fetch`. All reads and writes must pass through `src/services/`:
- `src/lib/schemas.ts`: Defines `Todo` types and Zod schemas (the single source of truth).
- `src/services/`: Defines the async `TodoService` interface, `LocalTodoService`, and theme persistence helpers.
- `src/hooks/` & `src/components/`: Consume `src/services/` via hooks.
- `test/`: Houses all unit, component, and contract tests cleanly separated from `src/`.

Upgrading between versions modifies schema definitions and service implementations, leaving UI components cleanly decoupled.

## Constraints

- Every mutation and creation must validate through Zod schemas.
- Full backwards compatibility with existing Version 1, 1.1, 1.2, and 1.3 items stored in `localStorage`.
- No new dependencies without prior approval.
- Every acceptance criterion in `task.md` maps to at least one passing test.
- Keyboard accessibility and zero unhandled console errors during test execution.

## Out of Scope

- User authentication, login sessions, or user accounts.
- Collaborative multi-user editing or live WebSockets sync.
- Drag-and-drop manual reordering.
- External calendar integrations (Google Calendar / iCal sync).
