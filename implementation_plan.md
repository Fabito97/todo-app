Status V1: APPROVED by human on 2026-09-29
Status V1.1: APPROVED by human on 2026-09-29
Status V2: DRAFT

---

# Implementation Plan

## Architecture Summary

The app is a Next.js App Router project with a strict `src/` layout. All business logic lives behind a single `TodoService` interface.

- In **Version 1** and **Version 1.1**, the UI runs entirely in the browser and delegates storage to `LocalTodoService`, which is the only module allowed to touch `localStorage`.
- In **Version 1.1**, the data model and UI are enriched with `description`, `priority`, `dueDate`, and `category`, along with rich filtering/sorting and backwards compatibility with existing stored V1 data.
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

export const TodoSchema = z.object({
  id:          z.string().uuid(),
  title:       z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  completed:   z.boolean(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').optional().default(''),
  priority:    PrioritySchema.default('medium'),
  dueDate:     z.string().nullable().optional(),
  category:    z.string().trim().max(50, 'Category must be 50 characters or fewer').nullable().optional(),
})

export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoSchema = z.object({
  title:       z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string().trim().max(1000).optional(),
  priority:    PrioritySchema.optional().default('medium'),
  dueDate:     z.string().nullable().optional(),
  category:    z.string().trim().max(50).nullable().optional(),
})

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>

export const TodoPatchSchema = z.object({
  title:       z.string().trim().min(1).max(200).optional(),
  completed:   z.boolean().optional(),
  description: z.string().trim().max(1000).optional(),
  priority:    PrioritySchema.optional(),
  dueDate:     z.string().nullable().optional(),
  category:    z.string().trim().max(50).nullable().optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' })

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

```
src/
  app/                   # Next.js App Router pages and layouts
    layout.tsx
    page.tsx
    api/todos/           # V2 only: route handlers
  lib/
    schemas.ts           # Todo type, Priority, Zod schemas
    errors.ts            # NotFoundError
  services/
    todo-service.ts      # Interface + TodoFilter, ListOptions, SortOption types
    local-todo-service.ts  # V1/V1.1 localStorage implementation
    todo-service.contract.ts  # Shared contract test suite
    index.ts             # Active service export + storage notice subscriber
    http-todo-service.ts # V2 HTTP implementation
  hooks/
    use-todos.ts         # React hook; depends only on TodoService
  components/            # UI components; no storage or fetch
  server/                # V2 only: DB client, Drizzle schema, repository
e2e/                     # Playwright tests
```

---

## Version 1 Plan — localStorage (Completed)

Completed and verified on branch `auto/v1`. Full baseline CRUD and client-side resilience.

---

## Version 1.1 Plan — Rich Metadata & Enhanced Controls

### What is new
- Extended todo data shape: `description`, `priority`, `dueDate`, `category`.
- Backwards compatibility: Existing V1 items stored in `todos:v1` seamlessly parse with default priority (`medium`) and null/empty metadata without throwing or wiping data.
- Creation form (`AddTodoForm`): Collapsible details panel to enter description, select priority badges, pick due date, and choose/type category.
- Item rendering (`TodoItem`): Visual badges for priority (colored pills), due date with overdue warning indicator, category pill, and inline expansion for description and editing all fields.
- Filtering & Sorting (`FilterBar` + `useTodos`): Filter by priority and category in addition to status; sort by newest, due date, or priority.

### Backwards Compatibility Strategy
`LocalTodoService.readStorage()` validates stored JSON through `TodoSchema.array()`. Because `priority` has `.default('medium')` and optional fields have safe fallbacks, legacy V1 items `{ id, title, completed, createdAt, updatedAt }` automatically parse into valid V1.1 items without manual data migration.

### Files to Modify in Version 1.1

| File | Change |
|------|--------|
| `src/lib/schemas.ts` | Add `PrioritySchema`, update `TodoSchema`, `CreateTodoSchema`, `TodoPatchSchema` |
| `src/services/todo-service.ts` | Add `ListOptions`, `SortOption`, update method signatures |
| `src/services/local-todo-service.ts` | Support new fields, sorting, and backwards compatibility |
| `src/services/todo-service.contract.ts` | Add contract assertions for metadata, defaults, sorting, and legacy V1 data parsing |
| `src/hooks/use-todos.ts` | Expose priority/category filter states and sorting options |
| `src/components/AddTodoForm.tsx` | Add expandable inputs for description, priority, due date, and category |
| `src/components/TodoItem.tsx` | Render priority badge, due date status, category tag, and full-field inline edit |
| `src/components/FilterBar.tsx` | Add category/priority filters and sort dropdown selector |
| `e2e/todos.spec.ts` | Add e2e tests for rich todo creation, filtering by priority/category, and sorting |

### Open Decisions for V1.1
- **DECISION 1 (Category values)**: Provide standard predefined category suggestions (`Work`, `Personal`, `Shopping`, `Other`) with free-text custom entry option.
- **DECISION 2 (Sort controls)**: Implement sort selection as a compact dropdown inside the filter toolbar.

---

## Version 2 Plan — Neon + Vercel (Outline; detail with `/plan 2`)

### Goal
Move persistence from browser `localStorage` to Neon PostgreSQL via Drizzle ORM and Next.js Route Handlers. The database schema will directly reflect the enriched V1.1 `Todo` shape. Components and hooks remain completely unchanged.
