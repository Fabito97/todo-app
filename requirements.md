# Requirements

## Goal

A fast, resilient, single-user task and schedule workspace where a user can create, view, edit, complete, categorize, time-block, and delete tasks with rich metadata, an intuitive Today's Dashboard, an interactive Calendar/Schedule view, in-app notifications, and a zero-flash Warm Graphite dark mode experience, with data that persists across reloads. It doubles as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Versions

| Version | Storage & Backend | Core Scope | Status |
| :--- | :--- | :--- | :--- |
| **Version 1** | Browser `localStorage` (`todos:v1`) | Core CRUD: title, completed, basic filters, counter, resilience | **Complete** (`v1`) |
| **Version 1.1** | Browser `localStorage` (`todos:v1`) | Rich metadata: description, priority, due date, category, sorting | **Complete** (`v1.1`) |
| **Version 1.2** | Browser `localStorage` (`todos:v1`, `theme:v1`) | `/test` folder reorganization, theme toggle, dashboard progress stats | **Complete** (`v1.2`) |
| **Version 1.3** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Zero-flash Warm Graphite dark mode, Modal Composer, nullable `startTime`/`endTime`, Today's Dashboard, Calendar/Schedule & Notifications | **Approved** (current target) |
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

### Version 1.3 (Current Scope)
- **Time-Blocking Schema (`startTime` & `endTime`)**:
  - Add optional, nullable `startTime` (`"HH:mm"` | `null`, default `null`) and `endTime` (`"HH:mm"` | `null`, default `null`) to `TodoSchema`, `CreateTodoSchema`, and `TodoPatchSchema`.
  - Validate that `endTime > startTime` whenever both `startTime` and `endTime` are provided (`"End time must be after start time"`).
  - Seamless backwards compatibility with existing Version 1, 1.1, and 1.2 `localStorage` items (missing `startTime` and `endTime` default to `null`).
  - When sorting by `dueDate`, order items sharing the same `dueDate` chronologically by `startTime` (earliest first, followed by items without a `startTime`).
- **Zero-Flash Theme Load & Warm Graphite Dark Palette**:
  - Inject a synchronous blocking `<script>` in `<head>` inside `src/app/layout.tsx` that reads `localStorage.getItem("theme:v1")` (or system `prefers-color-scheme: dark`) and applies `.dark` to `<html>` before first paint so reloading never flashes light.
  - Replace the blue-heavy `slate-900` (`#0f172a`) dark background with a neutral **Warm Graphite** surface hierarchy (`#121316` page canvas, `#1a1d24` elevated cards, `#22262f` interactive inputs/controls, `#2e3340` subtle borders).
- **Demarcated Task Creation & Modal Composer**:
  - Render `AddTodoForm` in its own dedicated Quick Command card visually separated from the Task Board card.
  - Opening full task/schedule details (`Toggle details`) opens an accessible **Modal Dialog** (`role="dialog"`, `aria-modal="true"`, `Escape` or close button to dismiss) containing Description, Priority, Due Date, `Start time`, `End time`, and Category without pushing the todo list inline.
  - Display a visible time-block badge (e.g., `09:00 – 10:30`) on `TodoItem` when `startTime` / `endTime` are set, and allow editing `startTime` and `endTime` in `TodoItem` edit mode.
- **Intuitive Today's Dashboard, Calendar/Schedule View & Notification Center**:
  - **Today's Dashboard (`DashboardOverview`)**: Highlights **Tasks for the Day** (`dueDate === today`, ordered by `startTime`, with quick completion toggles and time-block badges) alongside daily stat pills (Total, Active, Completed, Due Today) and the completion progress bar.
  - **Interactive Calendar & Schedule View (`CalendarScheduleView`)**: Date navigation (Previous Day, Today, Next Day, date picker, and 7-day week strip) + daily schedule separating **Time-Blocked Schedule** slots (`startTime – endTime`) from **All-Day / Unscheduled Tasks** for the selected date.
  - **Workspace View Switcher**: Switch cleanly between **Tasks**, **Calendar & Schedule**, and **Split View** in `src/app/page.tsx`.
  - **Notification Center (`NotificationCenter`)**: Header notification button (`aria-label="Notifications"`) with an active count badge for **Overdue** and **Today's Scheduled** incomplete tasks, opening an accessible notifications popover.

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

### Version 1, 1.1, 1.2 & 1.3 — Local
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
- Full backwards compatibility with existing Version 1, 1.1, and 1.2 items stored in `localStorage`.
- No new dependencies without prior approval.
- Every acceptance criterion in `task.md` maps to at least one passing test.
- Keyboard accessibility and zero unhandled console errors during test execution.

## Out of Scope

- User authentication, login sessions, or user accounts.
- Collaborative multi-user editing or live WebSockets sync.
- Drag-and-drop manual reordering.
- External calendar integrations (Google Calendar / iCal sync).
