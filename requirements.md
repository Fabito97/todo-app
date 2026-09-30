# Requirements

## Goal

A fast, resilient, full-viewport task and schedule workspace backed by a serverless PostgreSQL database (Neon) via Drizzle ORM and Next.js Route Handlers. Features an executive Dashboard (4 live metric cards, Today's Tasks, Important/Critical Tasks, Recent Tasks, and single-line Quick Add), a dedicated Tasks board with live text search and multi-dimensional filtering (Status, Priority, Category, Sorting), a full month-by-month interactive Calendar view with daily schedule inspection and editing, in-app notifications, true modal overlays for creating, inspecting, and editing tasks, crisp Lucide React iconography, human-readable dates with overdue task treatment, and a zero-flash Warm Graphite dark mode experience, with server persistence across devices and reloads. It doubles as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Versions

| Version | Storage & Backend | Core Scope | Status |
| :--- | :--- | :--- | :--- |
| **Version 1** | Browser `localStorage` (`todos:v1`) | Core CRUD: title, completed, basic filters, counter, resilience | **Complete** (`v1`) |
| **Version 1.1** | Browser `localStorage` (`todos:v1`) | Rich metadata: description, priority, due date, category, sorting | **Complete** (`v1.1`) |
| **Version 1.2** | Browser `localStorage` (`todos:v1`, `theme:v1`) | `/test` folder reorganization, theme toggle, dashboard progress stats | **Complete** (`v1.2`) |
| **Version 1.3** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Zero-flash Warm Graphite dark mode, nullable `startTime`/`endTime`, initial schedule & notifications | **Complete** (`v1.3`) |
| **Version 1.4** | Browser `localStorage` (`todos:v1`, `theme:v1`) | Full-viewport Sidebar Workspace (`Dashboard`, `Tasks`, `Calendar`), Dedicated Metric Cards, Critical & Recent Tasks, Full Month-by-Month Calendar Grid, and True Modal Overlays for Add, Edit & Task Details | **Complete** (`v1.4`) |
| **Version 2** | Route Handlers + Neon PostgreSQL | REST API routes (`/api/todos`), Drizzle ORM, server validation, client service swap (`HttpTodoService`), error resilience | **Complete** (`v2`) |
| **Version 2.1** | Route Handlers + Neon PostgreSQL | **High-Fidelity UI Polish, Tasks Search, Category Filter, Lucide Icons, Date Formatting & Calendar Interactivity** (matching `design/mockups/v1.4.html`) | **Approved (Target Version)** |
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
- **Schema Migration**: Seamless backwards compatibility with existing Version 1 `localStorage` todos.

### Version 1.2 (Completed)
- **Dedicated `/test` Directory Structure**:
  - All Vitest unit, component, and contract test suites live in `test/` mirroring `src/`.
- **Interactive Theme Switcher**:
  - Accessible **Theme Toggle** (**Light**, **Dark**, **System**) in header and desktop sidebar, persisted under `theme:v1`.
- **Dashboard Progress & Filter Reset**:
  - Visual completion progress bar and stat pills plus a one-click **Reset filters** button.

### Version 1.3 (Completed)
- **Time-Blocking Schema (`startTime` & `endTime`)**:
  - Optional, nullable `startTime` (`"HH:mm"` | `null`) and `endTime` (`"HH:mm"` | `null`) with validation (`endTime > startTime`).
  - Chronological secondary sorting by `startTime` when sorting by `dueDate`.
- **Zero-Flash Theme Load & Warm Graphite Dark Palette**:
  - Synchronous blocking `<script>` in `<head>` eliminating light-to-dark flashing.
  - Neutral **Warm Graphite** dark surface hierarchy (`#121316` page canvas, `#1a1d24` elevated cards, `#22262f` interactive controls, `#2e3340` subtle borders).
- **In-App Notification Center (`NotificationCenter`)**:
  - Header notification button with active reminder count for overdue and today's scheduled incomplete tasks.

### Version 1.4 (Completed)
- **Full-Viewport Workspace Layout & Sidebar Navigation**:
  - Full-viewport responsive workspace shell (`flex h-screen overflow-hidden`, desktop left **Sidebar** + top header bar, and responsive mobile bottom navigation bar).
  - Clean view switching between **Dashboard**, **Tasks**, and **Calendar** using `aria-current="page"`.
  - Persistent **+ New Task** primary button in content header.
- **Spacious Executive Dashboard (`DashboardView`)**:
  - 4 live Metric Cards: **Total Tasks**, **Active Tasks**, **Completed Tasks**, and **Critical Tasks**.
  - Single-line **Quick Add Task Bar** with instant submit and transient `<Toast>` notifications.
  - Three demarcated executive panels: **Today's Tasks**, **Important / Critical Tasks**, and **Recent Tasks**.
- **Full Month-by-Month Calendar Grid (`CalendarView`)**:
  - 7-column monthly calendar grid (`Sun`–`Sat`) with date navigation, today date highlight, and task indicator dots.
  - Side-by-side or stacked **Daily Schedule** panel showing time-blocked slots and all-day tasks.
- **True Centered Modal Dialog System**:
  - `AddTaskModal`, `TaskDetailsModal`, and `EditTaskModal` centered dialogs.
  - Simplified `TodoItem` to clean view-only rows.

### Version 2 (Completed)
- **Database & Drizzle ORM Persistence**:
  - Serverless PostgreSQL database (Neon) configured via `DATABASE_URL` environment variable (`src/server/db.ts`).
  - Drizzle ORM schema (`src/server/schema.ts`) defining the `todos` table matching the full `Todo` shape.
  - Drizzle migration management (`npm run db:generate` & `npm run db:migrate`).
- **Database Repository (`src/server/todo-repository.ts`)**:
  - Implements the async `TodoService` interface on PostgreSQL with in-memory offline development and testing fallback.
- **REST Route Handlers (`src/app/api/todos`)**:
  - `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/[id]`, and `DELETE /api/todos/[id]` with Zod schema validation.
- **Client HTTP Todo Service (`src/services/http-todo-service.ts`)**:
  - Implements `TodoService` via client HTTP requests (`fetch`) to `/api/todos`.
- **Network Resilience & Feedback**:
  - Safe error recovery, non-blocking loading spinner, and transient error toast notices (`role="status"`, `aria-live="polite"`).

### Version 2.1 (Target Scope — High-Fidelity UI Polish & Mockup Alignment)
- **Crisp Lucide React Iconography**:
  - Replace all emojis and raw SVGs with cohesive icons from `lucide-react`:
    - Metric Cards: `ClipboardList` (Total), `Zap` (Active), `CheckCircle2` (Completed), `Flame` (Critical).
    - Sidebar: `LayoutDashboard`, `CheckSquare`, `Calendar`.
    - Toolbar & Actions: `Search`, `Plus`, `Pencil`, `Trash2`, `Bell`, `Clock`, `Tag`, `ChevronLeft`, `ChevronRight`.
- **Tasks Board Toolbar Search & Category Filter**:
  - Add real-time text **Search bar** to the Tasks board toolbar (searching task titles and descriptions).
  - Add dedicated **Category filter dropdown** (`All Categories` + dynamic categories list) alongside the Status tabs (`All`, `Active`, `Done`) and Sort selector.
  - Remove redundant `+ New Task` button from the Tasks board toolbar (keeping the primary header CTA).
- **Exact Mockup Task Card & Human-Readable Dates**:
  - Match [`design/mockups/v1.4.html`](file:///c:/Users/hp/Documents/hng/todo-list/design/mockups/v1.4.html) task card structure:
    - Color-coded left priority accent border (`border-l-4 border-l-rose-500`, `border-l-amber-500`, `border-l-blue-500`).
    - Task title and 1-line description (`line-clamp-1 text-slate-500 dark:text-zinc-400`).
    - Human-readable short date format (e.g. `Sep 30, 2026` instead of raw `2026-09-30`).
    - Metadata pills row: Priority badge, Category tag, Time-block range, and Due date.
    - Inline action buttons: `Edit` button and Delete (`✕`) button.
    - Clicking the card body opens `TaskDetailsModal`.
- **Overdue Task Treatment**:
  - Tasks with past due dates that remain active are prominently flagged with an overdue alert pill/badge (e.g. `Overdue (Sep 28)`) and visual cancellation styling matching the mockup.
- **Interactive Calendar Task Inspection & Editing**:
  - Allow clicking any scheduled task in `CalendarView` (in the Daily Schedule panel or day view) to view its full details in `TaskDetailsModal` and edit via `EditTaskModal`.
- **Polished Component States**:
  - Refined loading spinners / skeletons during server fetch.
  - Informative, styled empty states for all views and active filter combinations.
  - Non-intrusive, accessible error banners and toasts.

## Todo Shape

```ts
export type Priority = "low" | "medium" | "high";
export type ThemeMode = "light" | "dark" | "system";

export interface Todo {
  id: string;               // UUID
  title: string;            // trimmed, 1–200 chars
  completed: boolean;       // binary completion state (active vs completed)
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  description?: string;     // optional notes, max 1,000 chars
  priority: Priority;       // default: "medium"
  dueDate?: string | null;  // optional ISO 8601 date string (YYYY-MM-DD)
  startTime?: string | null; // optional 24h time string (HH:mm), default: null
  endTime?: string | null;   // optional 24h time string (HH:mm), default: null
  category?: string | null; // optional category tag, max 50 chars
}
```

## Tech Stack per Version

### All Versions
- Next.js 16 (App Router with `src/` directory).
- TypeScript strict mode.
- Tailwind CSS v4 (class-based `.dark` variant + Warm Graphite dark surface tokens).
- Zod for runtime schema validation.
- Vitest with React Testing Library (jsdom) for unit, component, and contract tests in `test/`.
- Playwright for end-to-end tests in `e2e/`.
- Package manager: npm.

### Version 2 & 2.1
- Neon PostgreSQL serverless database with Drizzle ORM.
- Next.js App Router Route Handlers under `src/app/api/todos/`.
- `HttpTodoService` connecting client UI to REST API routes.
- `lucide-react` for crisp, modern, consistent iconography.

## Architecture Principle

The UI never directly accesses `localStorage` or `fetch`. All reads and writes must pass through `src/services/`:
- `src/lib/schemas.ts`: Defines `Todo` types and Zod schemas (the single source of truth).
- `src/services/`: Defines the async `TodoService` interface and active provider (`HttpTodoService`).
- `src/server/`: Database schema, repository, and Route Handlers.
- `src/hooks/` & `src/components/`: Consume `src/services/` via hooks.
- `test/`: Houses all unit, component, contract, and hook tests cleanly separated from `src/`.

## Constraints

- Every mutation and creation must validate through Zod schemas.
- Full backwards compatibility with existing Version 1.0 through 2.0 records.
- Binary completion (`completed: boolean`) is preserved without breaking multi-state changes.
- Every acceptance criterion in `task.md` maps to at least one passing test.
- Zero unhandled console errors during test execution.

## Out of Scope

- Tri-state progress / `in_progress` workflow (kept binary for effortless single-click speed).
- User authentication, login sessions, or user accounts.
- Collaborative multi-user editing or live WebSockets sync.
- Drag-and-drop manual reordering.
- External calendar integrations (Google Calendar / iCal sync).
