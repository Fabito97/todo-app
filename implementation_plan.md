Status V1: APPROVED by human on 2026-09-29
Status V2: DRAFT

---

# Implementation Plan

## Architecture Summary

The app is a Next.js App Router project with a strict `src/` layout. All
business logic lives behind a single `TodoService` interface. In Version 1 the
UI runs entirely in the browser and delegates storage to `LocalTodoService`,
which is the only module allowed to touch `localStorage`. In Version 2 the UI
calls `HttpTodoService`, which POSTs and PATCHes to Route Handlers that in turn
call a `TodoRepository` backed by Neon (PostgreSQL) via Drizzle ORM. Swapping
versions is a one-file change (`src/services/index.ts`) plus new server-side
files; no component or hook changes.

ESLint rules enforce the service boundary: components and hooks may not import
`localStorage`, `sessionStorage`, `fetch`, or concrete service classes.

---

## Shared Foundation (both versions)

### Todo type

Defined once in `src/lib/schemas.ts`. Never duplicated.

```ts
// src/lib/schemas.ts
import { z } from 'zod'

export const TodoSchema = z.object({
  id:        z.string().uuid(),
  title:     z.string().trim().min(1).max(200),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Todo = z.infer<typeof TodoSchema>

// Used to validate a patch body (both client and server)
export const TodoPatchSchema = z.object({
  title:     z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' })

// Used to validate a create body (both client and server)
export const CreateTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
})
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

Every method is async from Version 1 on, even though `localStorage` is
synchronous. `list` returns todos sorted newest-first.

```ts
// src/services/todo-service.ts
import type { Todo } from '@/lib/schemas'

export type TodoFilter = 'all' | 'active' | 'completed'

export interface TodoService {
  /** Returns todos sorted by createdAt descending. */
  list(filter?: TodoFilter): Promise<Todo[]>

  /** Trims the title; rejects blank or >200-char titles (throws ZodError). */
  create(data: { title: string }): Promise<Todo>

  /**
   * Applies the patch to the matching todo and updates updatedAt.
   * Throws NotFoundError if the id does not exist.
   */
  update(id: string, patch: { title?: string; completed?: boolean }): Promise<Todo>

  /**
   * Removes the matching todo.
   * Throws NotFoundError if the id does not exist.
   */
  remove(id: string): Promise<void>
}
```

### Contract test suite

`src/services/todo-service.contract.ts` exports a function
`runContractTests(factory: () => TodoService)` that every implementation runs
against. It covers:

- `create` trims title, rejects empty / whitespace-only / >200-char, returns
  correct shape, `completed: false`, non-empty timestamps.
- `list` returns newest first, filters work for `all` / `active` / `completed`.
- `update` changes only the matching todo, updates `updatedAt`, throws
  `NotFoundError` for an unknown id.
- `remove` deletes only the matching todo, throws `NotFoundError` for unknown id.
- Isolation: a fresh service instance starts empty.

### Folder structure

```
src/
  app/                   # Next.js App Router pages and layouts
    layout.tsx
    page.tsx
    api/todos/           # V2 only: route handlers
  lib/
    schemas.ts           # Todo type, Zod schemas
    errors.ts            # NotFoundError
  services/
    todo-service.ts      # Interface + TodoFilter type
    local-todo-service.ts  # V1 localStorage implementation
    todo-service.contract.ts  # Shared contract test suite
    index.ts             # Chooses which implementation to export
    http-todo-service.ts # V2 HTTP implementation
  hooks/
    use-todos.ts         # React hook; depends only on TodoService
  components/            # UI components; no storage or fetch
  server/                # V2 only: DB client, Drizzle schema, repository
e2e/                     # Playwright tests
```

---

## Version 1 Plan — localStorage

### What is new

A complete, client-side todo app stored in `localStorage`. No backend. The
`TodoService` interface and the service-boundary ESLint rules are established
here so that Version 2 is a small additive change.

### What Version 1 deliberately leaves alone

No API routes, no database, no server-side rendering of todo data.

### Storage

- Key: `todos:v1`
- Value: `JSON.stringify(Todo[])` — the full array on every write.
- Never read in a Server Component or during SSR. Load in a `useEffect` after
  mount and expose a `loading: boolean` from the hook.
- Every storage call is wrapped in `try/catch`. Thrown storage (private mode,
  quota full) → surface an error state; the app continues in memory.
- Corrupt or mis-shaped data validated by `TodoSchema.array().catch([])` → empty
  list + visible notice. Never a crash.

### Files added in Version 1

| File | Purpose |
|------|---------|
| `src/lib/schemas.ts` | Todo type and Zod schemas |
| `src/lib/errors.ts` | NotFoundError |
| `src/services/todo-service.ts` | Interface |
| `src/services/local-todo-service.ts` | localStorage implementation |
| `src/services/todo-service.contract.ts` | Shared contract tests |
| `src/services/index.ts` | Exports `LocalTodoService` as the active service |
| `src/hooks/use-todos.ts` | React hook over `TodoService` |
| `src/components/AddTodoForm.tsx` | Controlled input + submit |
| `src/components/TodoItem.tsx` | Checkbox, inline edit, delete |
| `src/components/TodoList.tsx` | Renders list with empty/loading states |
| `src/components/FilterBar.tsx` | All / Active / Completed tabs + counter |
| `src/app/page.tsx` | Composes components |
| `e2e/todo.spec.ts` | Playwright happy-path tests |

### Test strategy

- Unit / contract: Vitest + jsdom. All service contract tests run against
  `LocalTodoService`. Additional cases for corrupt storage and throwing storage.
- Component: React Testing Library. Query by role / label only.
- End-to-end: Playwright against `npm run dev`. Tests use accessible selectors
  and must still pass unchanged in Version 2.

### Risks and open decisions

- **RESOLVED** — Auth: none.
- **RESOLVED** — Todo shape: `{ id, title, completed, createdAt, updatedAt }` only.
- `localStorage` quota (5 MB typical): acceptable for a demo; no pagination planned.

---

## Version 2 Plan — Neon + Vercel (outline; detail with `/plan 2`)

### Goal

Move persistence from the browser to a Neon PostgreSQL database accessed via
Drizzle ORM, exposed through Next.js Route Handlers. Deployed to Vercel.
Components and hooks must not change.

### Expected new / changed files

| Change | Files |
|--------|-------|
| Add | `src/server/db.ts`, `src/server/schema.ts`, `src/server/todo-repository.ts` |
| Add | `src/app/api/todos/route.ts`, `src/app/api/todos/[id]/route.ts` |
| Add | `src/services/http-todo-service.ts` |
| Add | `drizzle/` migrations, `drizzle.config.ts` |
| Change | `src/services/index.ts` (swap to `HttpTodoService`) |
| Add | `.env.example` entry for `DATABASE_URL` |

Components, hooks, and the `TodoService` interface are **unchanged**.

### Known risks

- Neon free tier cold-starts may add latency.
- `DATABASE_URL` must be set as a Vercel environment variable; local dev uses
  `.env.local` (gitignored).
- Drizzle migration tooling needs a `db:generate` and `db:migrate` npm script.
- The V1 e2e tests must pass without modification; the test-database reset
  helper is the only new e2e infrastructure.
