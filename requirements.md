# Requirements

## Goal

A small, reliable single-user todo app where a user can create, view, edit,
complete, and delete todos, with data that persists across reloads. It doubles
as a showcase of an AI-assisted, spec-first, test-gated engineering workflow.

## Core Features

- Create a todo with a title (required, trimmed, 1 to 200 characters).
- List todos, filterable by **All**, **Active**, and **Completed**.
- Toggle a todo between active and completed.
- Edit a todo's title in place.
- Delete a todo.
- Data persists across reloads (localStorage in V1; Neon PostgreSQL in V2).
- Clear empty, loading, and error states. Keyboard accessible. Works on mobile widths.

## Todo Shape

```ts
{
  id:        string   // UUID
  title:     string   // trimmed, 1–200 chars
  completed: boolean
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601
}
```

No additional fields (no due dates, priorities, or tags).

## Tech Stack

### Both versions

- Next.js (current stable, version pinned in `package.json`), App Router,
  **`src/` directory** (`src/app`, never a root-level `app`). No `pages/`.
  TypeScript strict.
- Tailwind CSS.
- Zod for validation (shared by client and server in V2).
- Vitest with React Testing Library (jsdom) for unit, component, and API tests.
- Playwright for end-to-end tests in `e2e/`.
- Package manager: npm.

### Version 1 — localStorage

- No backend, no API routes.
- `localStorage` key: `todos:v1`.
- Data loaded in an effect after mount; a loading state shown during hydration.
- Every storage call wrapped in `try/catch`; corrupt data → empty list + visible notice.

### Version 2 — Neon + Vercel

- Neon (PostgreSQL) as the database, accessed via Drizzle ORM.
- Mutations and reads through Route Handlers under `src/app/api/todos/`.
- Drizzle migrations committed and never edited after commit.
- Deployed to Vercel; `DATABASE_URL` stored as a Vercel environment variable /
  local `.env.local` (never committed).

## Constraints

- All API input validated server-side with Zod (V2), even if the client already did.
- Every API error uses the standard shape:
  `{ "error": { "code": string, "message": string, "fields"?: Record<string, string[]> } }`.
  No stack traces or raw database errors leaked to the client.
- No new dependency without asking first (state what it does and what was considered instead).
- Every acceptance criterion in `task.md` maps to at least one passing test.
- ESLint rules prevent components and hooks from importing `localStorage`,
  `sessionStorage`, `fetch`, or concrete service implementations directly.

## Out of Scope

- Authentication and multiple users.
- Due dates, priorities, tags, labels, or drag-and-drop ordering.
- Multiple todo lists.
- Offline support and real-time sync.
- Dark-mode toggle, i18n, and accessibility beyond keyboard navigation and
  sufficient colour contrast.
