# Next.js Todo & Executive Workspace (Version 2)

A fast, resilient, and accessible task management and executive daily workspace built with Next.js 16 App Router, TypeScript, Tailwind CSS, Zod, and server persistence powered by **Neon serverless PostgreSQL** and **Drizzle ORM**.

## Architecture & Storage

In Version 2, task data is persisted server-side in a serverless **PostgreSQL** database hosted on **Neon**, accessed via **Drizzle ORM** through Next.js App Router Route Handlers (`/api/todos`).

The client connects through the `TodoService` interface via `HttpTodoService` (`src/services/http-todo-service.ts`), while user theme preferences (`light`, `dark`, or `system`) remain stored under `theme:v1` in `localStorage` via `src/services/theme-storage.ts`.

Strict separation of concerns is maintained:
- **UI Components & Hooks**: Interact exclusively with `todoService` imported from `@/services`. Zero direct `fetch` or database imports exist inside `src/components/` or `src/hooks/`.
- **API Route Handlers (`src/app/api/todos`)**: Next.js Route Handlers validate incoming payloads with shared Zod schemas (`CreateTodoSchema`, `TodoPatchSchema`) and interact with `TodoRepository`.
- **Database Repository (`src/server/todo-repository.ts`)**: Implements `TodoService` using type-safe Drizzle ORM queries against PostgreSQL with automatic fallback for offline development and testing.
- **Contract Tests (`test/server/todo-repository.test.ts` & `test/services/http-todo-service.test.ts`)**: Ensure both server repository and HTTP client adhere to the unified `TodoService` contract.

## API Specification

All endpoints reside under `/api/todos` and return standard JSON payloads.

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/todos` | List all todos. Supports query params: `filter` (`all`, `active`, `completed`), `priority` (`low`, `medium`, `high`), `category`, and `sortBy` (`newest`, `dueDate`, `priority`). | `200 OK`, `500 Internal Server Error` |
| `POST` | `/api/todos` | Create a new task. Validates body against `CreateTodoSchema`. | `201 Created`, `400 Bad Request`, `500 Internal Server Error` |
| `PATCH` | `/api/todos/:id` | Update task fields (title, completed, description, priority, dueDate, startTime, endTime, category). Validates body against `TodoPatchSchema`. | `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `DELETE` | `/api/todos/:id` | Delete a task by UUID. | `200 OK` (with `{ success: true }`), `404 Not Found`, `500 Internal Server Error` |

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Optional in dev / Required in prod | Connection string for Neon serverless PostgreSQL (`postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`). If omitted in local dev or unit tests, the system runs with a built-in offline in-memory fallback. |

To configure a live Neon database, copy `.env.example` (or create `.env.local`):

```bash
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
```

## Database Migrations

Database schemas and migrations are managed via **Drizzle Kit**:

```bash
# Generate SQL migration files from schema definition in src/server/schema.ts
npm run db:generate

# Run migrations against the target database specified by DATABASE_URL
npm run db:migrate
```

Migration SQL files reside in the `drizzle/` directory.

## Features

- **Executive Dashboard View (`DashboardView`)**:
  - 4 live Metric Cards: **Total Tasks**, **Active Tasks**, **Completed Tasks** (with animated progress bar and completion percentage), and **Critical Tasks** (high-priority count with urgency styling).
  - Single-line **Quick Add** input bar with instant submit and lightweight toast notifications.
  - Three demarcated executive panels:
    - **Today's Tasks**: Chronological agenda for today's time-blocked slots with quick completion toggles.
    - **Important / Critical**: Filtered high-priority tasks with quick edit and completion actions.
    - **Recent Tasks**: Latest tasks with relative timestamps and quick actions.
- **Full-Viewport Workspace Layout & Navigation**:
  - Persistent left sidebar on desktop (`w-60`, `hidden lg:flex`) featuring brand identity, navigation items (**Dashboard**, **Tasks**, **Calendar**), and anchored theme controls.
  - Responsive mobile bottom navigation bar (`lg:hidden`, `h-14`) with accessible touch targets.
  - Fixed top content header (`ContentHeader`) with active view titles, primary `+ New Task` action modal trigger, and notification center.
- **Modal Dialog System**:
  - Accessible modal dialogs (`role="dialog"`, `aria-modal="true"`, dismissible on `Escape`, backdrop click, or Cancel button):
    - `AddTaskModal`: Full task creation with title, description, priority, due date, start/end time, and category presets.
    - `TaskDetailsModal`: View-only read dialog displaying full task metadata, time block, notes, and inline delete confirmation.
    - `EditTaskModal`: Full-field task editor with pre-populated values and end-time validation.
- **Dedicated Tasks Board View (`TasksView`)**:
  - Clean view-only rows with status checkboxes, category tags, priority pills, and quick actions.
  - Comprehensive filtering by **Status** (All, Active, Completed), **Priority** (All, High, Medium, Low), and **Category**.
  - One-click **Reset filters** button and sorting by Newest, Due Date, or Priority.
- **Full Month Calendar Grid & Daily Schedule (`CalendarView`)**:
  - 7-column month grid displaying weekday headers, day numbers, today highlight, and task indicator dots.
  - Interactive month navigation (**Prev**, **Next**, **Today** jump).
  - Side-by-side or stacked Daily Schedule panel showing time-blocked intervals and all-day tasks for any selected date.
- **Zero-Flash Warm-Graphite Dark Mode**:
  - Synchronous blocking `<head>` script in `src/app/layout.tsx` eliminates theme flashing.
  - Curated Warm Graphite dark surface hierarchy (`#121316` canvas background, `#1a1d24` cards, `#22262f` interactive controls, `#2e3340` borders).
  - Interactive Light / Dark / Auto switcher.
- **Network Resilience & Error Handling**:
  - Seamless loading indicators and transient toast notices (`role="status"`, `aria-live="polite"`) for API mutations and network interruptions.
  - Safe error recovery without unhandled promise rejections or cascading renders.

## Tech Stack

- **Framework**: Next.js 16 (App Router with `src/` directory)
- **Language**: TypeScript (strict mode)
- **Database & ORM**: PostgreSQL via Neon Serverless (`@neondatabase/serverless`) & Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Unit & Component Testing**: Vitest & React Testing Library (`test/` directory, jsdom)
- **End-to-End Testing**: Playwright (`e2e/` directory, Chromium)

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v24)
- npm

### Installation

```bash
npm install
```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification & Testing

Run individual test suites or the complete verification pipeline:

```bash
# Typecheck TypeScript files
npm run typecheck

# Lint with ESLint
npm run lint

# Run unit, contract, and component test suites (Vitest)
npm run test

# Run the fast quality gate (lint + typecheck + test)
npm run verify

# Run Playwright end-to-end tests
npm run e2e
```
