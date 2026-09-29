# Requirements

## Goal

A fast, resilient, single-user todo application where a user can create, view, edit, complete, categorize, and delete todos with rich metadata, with data that persists across reloads. It doubles as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Versions

| Version | Storage & Backend | Core Scope | Status |
| :--- | :--- | :--- | :--- |
| **Version 1** | Browser `localStorage` (`todos:v1`) | Core CRUD: title, completed, basic filters, counter, resilience | **Complete** on `auto/v1` |
| **Version 1.1** | Browser `localStorage` (`todos:v1`) | Rich metadata: description, priority, due date, category, sorting | **Approved** (current target) |
| **Version 2** | Route Handlers + Neon PostgreSQL | REST API routes, Drizzle ORM, server validation, Vercel deployment | Planned |
| **Version 3+** | Multi-user / Cloud sync | Authentication, multi-tenant todo lists, team sharing | Postponed |

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

### Version 1.1 (Current Scope)
- **Description / Notes**: Optional multiline text field (up to 1,000 characters).
- **Priority**: Categorized as `low`, `medium`, or `high` (defaults to `medium`). Visual badges in list items.
- **Due Date**: Optional date picker/field with ISO format; visual indicator for overdue vs upcoming items.
- **Category / Tags**: Optional category identifier (e.g. Work, Personal, Shopping, General).
- **Enhanced Filtering & Sorting**: Filter by category or priority; sort by due date or priority in addition to newest-first.
- **Schema Migration**: Seamless backwards compatibility with existing Version 1 `localStorage` todos (missing fields receive default values upon read).

### Version 2 (Upcoming Backend)
- Neon (PostgreSQL) database backing with Drizzle ORM.
- REST Route Handlers (`src/app/api/todos`).
- Server-side validation matching shared Zod schemas.

## Todo Shape

```ts
export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: string;               // UUID
  title: string;            // trimmed, 1–200 chars
  completed: boolean;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  description?: string;     // optional notes, max 1,000 chars
  priority: Priority;       // default: "medium"
  dueDate?: string | null;  // optional ISO 8601 date string (YYYY-MM-DD or full timestamp)
  category?: string | null; // optional category tag, max 50 chars
}
```

## Tech Stack per Version

### All Versions
- Next.js (current stable App Router) with **`src/` directory** (`src/app`, never root `app`).
- TypeScript strict mode.
- Tailwind CSS v4.
- Zod for runtime schema validation.
- Vitest with React Testing Library (jsdom) for unit, component, and contract tests.
- Playwright for end-to-end tests in `e2e/`.
- Package manager: npm.

### Version 1 & 1.1 — Local
- Client-side storage in browser `localStorage` (`todos:v1`).
- Asynchronous `TodoService` interface (`LocalTodoService`).
- ESLint boundary banning `localStorage`, `sessionStorage`, and `fetch` from `src/components/` and `src/hooks/`.

### Version 2 — Server & Database
- Neon PostgreSQL serverless database.
- Drizzle ORM and migration management.
- Route Handlers under `src/app/api/todos/`.
- `HttpTodoService` replacing `LocalTodoService` via `src/services/index.ts`.

## Architecture Principle

The UI never directly accesses `localStorage` or `fetch`. All reads and writes must pass through the `TodoService` interface:
- `src/lib/schemas.ts`: Defines `Todo` types and Zod schemas (the single source of truth).
- `src/services/`: Defines the async `TodoService` interface and implementations.
- `src/hooks/` & `src/components/`: Consume `TodoService` via hooks.

Upgrading between versions modifies schema definitions and service implementations, leaving UI components cleanly decoupled.

## Constraints

- Every mutation and creation must validate through Zod schemas.
- Full backwards compatibility with existing Version 1 items stored in `localStorage`.
- No new dependencies without prior approval.
- Every acceptance criterion in `task.md` maps to at least one passing test.
- Keyboard accessibility and zero unhandled console errors during test execution.

## Out of Scope

- User authentication, login sessions, or user accounts.
- Collaborative multi-user editing or live WebSockets sync.
- Drag-and-drop manual reordering.
- External calendar integrations (Google Calendar / iCal sync).
