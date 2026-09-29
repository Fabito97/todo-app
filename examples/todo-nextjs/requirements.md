# Project Requirements

## Goal

A small, reliable todo app where a user can create, view, edit, complete, and delete todos, with data that persists across reloads. It doubles as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Core Features

- Create a todo with a title (required, trimmed, 1 to 200 characters).
- List todos, filterable by All, Active, and Completed.
- Toggle a todo between active and completed.
- Edit a todo's title.
- Delete a todo.
- Data persists in SQLite across reloads and restarts.
- Clear empty, loading, and error states. Keyboard accessible. Works on mobile widths.

## Tech Stack

DEFAULTS. Change any of these before running `/plan`.

- Next.js (current stable release, version pinned in `package.json`), App Router, TypeScript strict.
- Tailwind CSS.
- SQLite with `better-sqlite3` and Drizzle ORM.
- Zod for validation, shared by client and server.
- Vitest for unit and API tests. Playwright for end-to-end tests.
- Mutations through Route Handlers under `app/api/todos`. Reads through a shared `lib/todos.ts` service.

## Constraints

- All input validated server-side.
- Standard error shape on every API failure.
- No new dependencies without approval.
- Every acceptance criterion in `task.md` maps to a test.

## Out of Scope

- Authentication and multiple users (see the optional slice in `task.md`).
- Due dates, priorities, tags, drag-and-drop ordering, and sharing.
- Offline support and real-time sync.

## Open Decisions

- Auth: none (default) or add the optional auth slice.
- Deployment target: undecided. SQLite on a serverless host does not persist, so pick a host with a persistent disk or swap to a hosted database before deploying.
