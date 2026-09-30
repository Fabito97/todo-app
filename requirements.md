# Requirements

## Goal

A fast, resilient, full-viewport task and schedule workspace backed by a serverless PostgreSQL database (Neon) via Drizzle ORM and Next.js Route Handlers. Features an executive Dashboard (4 metric cards, Today's Tasks, Important/Critical Tasks, Recent Tasks, and single-line Quick Add), a dedicated Tasks view, a full month-by-month interactive Calendar view, in-app notifications, true modal overlays for creating, inspecting, and editing tasks, and a zero-flash Warm Graphite dark mode experience, with server persistence across devices and reloads. It doubles as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Versions

| Version | Storage & Backend | Core Scope | Status |
| :--- | :--- | :--- | :--- |
| **Version 1** | Browser `localStorage` (`todos:v1`) | Core CRUD: title, completed, basic filters, counter, resilience | **Complete** (`v1`) |
| **Version 1.1** | Browser `localStorage` (`todos:v1`) | Rich metadata: description, priority, due date, category, sorting | **Complete** (`v1.1`) |
| **Version 1.2** | Browser `localStorage` (`todos:v1`, `theme:v1`) | `/test` folder reorganization, theme toggle, dashboard progress stats | **Complete** (`v1.2`) |
| **Version 1.3** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Zero-flash Warm Graphite dark mode, nullable `startTime`/`endTime`, initial schedule & notifications | **Complete** (`v1.3`) |
| **Version 1.4** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Full-viewport Sidebar Workspace (`Dashboard`, `Tasks`, `Calendar`), Dedicated Metric Cards, Critical & Recent Tasks, Full Month-by-Month Calendar Grid, and True Modal Overlays for Add, Edit & Task Details | **Complete** (`v1.4`) |
| **Version 2** | Route Handlers + Neon PostgreSQL | REST API routes (`/api/todos`), Drizzle ORM, server validation, client service swap (`HttpTodoService`) | **Approved (Target Version)** |
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

### Version 1.4 (Completed)
- **Full-Viewport Workspace Layout & Sidebar Navigation**:
  - Full-viewport responsive workspace shell (`flex h-screen overflow-hidden`, desktop left **Sidebar** + top header bar, and responsive mobile bottom navigation bar).
  - Clean view switching between **Dashboard**, **Tasks**, and **Calendar** using `aria-current="page"`.
  - Persistent **+ New Task** primary button in navigation and content header.
- **Spacious Executive Dashboard (`DashboardView`)**:
  - 4 live Metric Cards: **Total Tasks**, **Active Tasks**, **Completed Tasks** (with animated progress bar), and **Critical Tasks** (high-priority count with urgency badge).
  - Single-line **Quick Add Task Bar** with instant submit and transient `<Toast>` notifications.
  - Three demarcated executive panels: **Today's Tasks** (chronological agenda), **Important / Critical Tasks** (high priority), and **Recent Tasks** (latest creations with relative dates).
- **Full Month-by-Month Calendar Grid (`CalendarView`)**:
  - 7-column monthly calendar grid (`Sun`–`Sat`) with date navigation (**Previous month**, **Today**, **Next month**), day numbers, today date highlight, selected date ring, and task count indicator dots.
  - Side-by-side or stacked **Daily Schedule** panel with independent vertical scrolling showing time-blocked schedule slots and all-day tasks.
- **True Centered Modal Dialog System**:
  - `AddTaskModal`: Centered modal dialog (`role="dialog"`, `aria-modal="true"`) for creating tasks with full metadata (Title, Description, Priority, Due Date, Start Time, End Time, Category).
  - `TaskDetailsModal`: Inspection dialog (`role="dialog"`, `aria-modal="true"`) displaying full task metadata with actions to Toggle Complete, Edit, or Delete.
  - `EditTaskModal`: Pre-populated modal dialog (`role="dialog"`, `aria-modal="true"`) for editing all task fields without inline row distortion.
  - Simplified `TodoItem` to clean view-only rows.

### Version 2 (Target Scope — Routes & Database)
- **Database & Drizzle ORM Persistence**:
  - Serverless PostgreSQL database (Neon) configured via `DATABASE_URL` environment variable (`src/server/db.ts`).
  - Drizzle ORM schema (`src/server/schema.ts`) defining the `todos` table matching the full `Todo` shape:
    - `id`: UUID string primary key.
    - `title`: text / varchar(200) not null.
    - `completed`: boolean not null default false.
    - `description`: text nullable.
    - `priority`: varchar(20) not null default 'medium'.
    - `dueDate`: varchar(50) nullable.
    - `startTime`: varchar(10) nullable.
    - `endTime`: varchar(10) nullable.
    - `category`: varchar(50) nullable.
    - `createdAt`: timestamp with timezone not null default now().
    - `updatedAt`: timestamp with timezone not null default now().
  - Drizzle migration management (`drizzle-kit generate` & `drizzle-kit migrate`).
- **Database Repository (`src/server/todo-repository.ts`)**:
  - Implements the async `TodoService` interface directly on Neon PostgreSQL using Drizzle ORM queries.
  - Passes the shared `todo-service.contract.ts` suite.
- **REST Route Handlers (`src/app/api/todos`)**:
  - `GET /api/todos`: Returns `{ todos: Todo[] }`.
  - `POST /api/todos`: Validates request body with `CreateTodoSchema`, creates item in repository, and returns created `Todo` with HTTP 201.
  - `PATCH /api/todos/[id]`: Validates request body with `TodoPatchSchema`, updates item, and returns updated `Todo` with HTTP 200 (or HTTP 404 if item does not exist).
  - `DELETE /api/todos/[id]`: Deletes item, returns HTTP 200/204 (or HTTP 404 if not found).
  - Standardized JSON error response shape: `{ error: string, details?: unknown }` with HTTP 400 for validation errors, 404 for not found, and 500 for unexpected errors.
- **Client HTTP Todo Service (`src/services/http-todo-service.ts`)**:
  - Implements `TodoService` by making client HTTP requests (`fetch`) to `/api/todos`.
  - The single client module permitted to use `fetch` to interact with `/api/todos`.
  - Passes the shared contract test suite (`todo-service.contract.ts`).
- **Zero-UI-Diff Backend Swap**:
  - `src/services/index.ts` exports `HttpTodoService` as the active provider.
  - **No changes to `src/components/` or `src/hooks/`**: the full V1.4 workspace (sidebar, dashboard, metric cards, modal dialogs, calendar, schedule, notifications, filters, sorting) operates seamlessly against the database backend.
- **Network Resilience & Feedback**:
  - Network and API failures gracefully surfaced via toast notifications without crashing the UI.
  - Non-blocking loading states while synchronizing with the server.

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
- Full backwards compatibility with existing Version 1.0 through 1.4 items stored in `localStorage`.
- No new dependencies without prior approval.
- Every acceptance criterion in `task.md` maps to at least one passing test.
- Keyboard accessibility and zero unhandled console errors during test execution.

## Out of Scope

- User authentication, login sessions, or user accounts.
- Collaborative multi-user editing or live WebSockets sync.
- Drag-and-drop manual reordering.
- External calendar integrations (Google Calendar / iCal sync).
