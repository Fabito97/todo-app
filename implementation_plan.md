Status V1: APPROVED by human on 2026-09-29
Status V1.1: APPROVED by human on 2026-09-29
Status V1.2: APPROVED by human on 2026-09-29
Status V2: DRAFT

---

# Implementation Plan

## Architecture Summary

The app is a Next.js App Router project with a strict `src/` layout for production code and a dedicated `test/` directory for Vitest unit, component, and contract tests. All business logic and browser persistence live behind the `src/services/` boundary.

- In **Version 1** and **Version 1.1**, the UI runs entirely in the browser and delegates storage to `LocalTodoService`, which is the only module allowed to touch `localStorage`.
- In **Version 1.1**, the data model and UI are enriched with `description`, `priority`, `dueDate`, and `category`, along with rich filtering/sorting and backwards compatibility with existing stored V1 data.
- In **Version 1.2**, all Vitest test suites are relocated out of `src/` into a dedicated root-level `test/` folder, the dark mode palette is softened from harsh pitch-black (`#0a0a0a` / `zinc-950`) to a layered slate surface hierarchy (`#0f172a` / `slate-900` & `slate-800`) with an interactive **Theme Toggle** (**Light** / **Dark** / **System**), and the dashboard UI is redesigned with a completion progress bar, stat pills, a one-click **Reset Filters** control, and priority-accented todo cards.
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
    globals.css
    layout.tsx
    page.tsx
    api/todos/           # V2 only: route handlers
  lib/
    schemas.ts           # Todo type, Priority, Zod schemas
    errors.ts            # NotFoundError
  services/
    todo-service.ts      # Interface + TodoFilter, ListOptions, SortOption types
    local-todo-service.ts  # V1/V1.x localStorage implementation
    theme-storage.ts     # V1.2 theme preference storage helper (theme:v1)
    index.ts             # Active service export + storage/theme helpers
    http-todo-service.ts # V2 HTTP implementation
  hooks/
    use-todos.ts         # React hook; depends only on TodoService
    use-theme.ts         # V1.2 React hook for Light/Dark/System theme mode
  components/            # UI components; no direct storage or fetch
    AddTodoForm.tsx
    FilterBar.tsx
    ThemeToggle.tsx      # V1.2 Light / Dark / System switcher
    TodoItem.tsx
    TodoList.tsx
  server/                # V2 only: DB client, Drizzle schema, repository
test/                    # V1.2+: All Vitest unit, component, and contract tests
  sanity.test.ts
  app/
    page.test.tsx
  components/
    AddTodoForm.test.tsx
    FilterBar.test.tsx
    ThemeToggle.test.tsx
    TodoItem.test.tsx
    TodoList.test.tsx
  hooks/
    use-todos.test.ts
  services/
    local-todo-service.test.ts
    todo-service.contract.ts
e2e/                     # Playwright end-to-end tests
```

---

## Version 1 Plan — localStorage (Completed)

Completed and verified on branch `auto/v1`. Full baseline CRUD and client-side resilience.

---

## Version 1.1 Plan — Rich Metadata & Enhanced Controls (Completed)

Completed and verified on branch `auto/v1.1` (merged to `main`). Added `description`, `priority`, `dueDate`, `category`, rich inline edit, and advanced filtering/sorting.

---

## Version 1.2 Plan — `/test` Directory Reorganization, Softer Dark Mode, & Intuitive UI Redesign

### What is new
1. **Dedicated `/test` Directory**:
   - Move all unit, component, and contract test files from `src/` into `test/` mirroring the `src/` folder hierarchy.
   - Update `vitest.config.ts` so `include` targets `test/**/*.{test,spec}.{ts,tsx}`.
   - Keep `src/` strictly for production application code.
2. **Softer Dark Mode Palette & Interactive Theme Switcher**:
   - Configure Tailwind CSS v4 class-based dark mode in `src/app/globals.css` (`@custom-variant dark (&:where(.dark, .dark *));`) alongside softer dark mode CSS variables (`--background: #0f172a`, `--foreground: #f1f5f9`).
   - Add `src/services/theme-storage.ts` (`getStoredTheme`, `setStoredTheme` using key `theme:v1`) and export via `src/services/index.ts` so components and hooks continue to obey the ESLint `no-restricted-globals` rule for `localStorage`.
   - Add `src/hooks/use-theme.ts` and `src/components/ThemeToggle.tsx` allowing the user to toggle between **Light**, **Dark**, and **System** modes, applying or removing `.dark` on `document.documentElement`.
   - Replace pitch-black `dark:from-zinc-950` / `dark:bg-zinc-900` backgrounds across `page.tsx`, `AddTodoForm.tsx`, `TodoItem.tsx`, `TodoList.tsx`, and `FilterBar.tsx` with a balanced, eye-friendly slate palette (`dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40`, elevated `dark:bg-slate-800/90` cards, and `dark:bg-slate-700/60` inputs).
3. **Intuitive Dashboard UI Redesign**:
   - **Dashboard Header & Progress Summary (`page.tsx`)**: Header bar pairing the title and `ThemeToggle` with a completion progress card (`role="progressbar"`, percentage indicator, and stat pills for **Total**, **Active**, and **Completed** tasks).
   - **Streamlined Filter & Sort Toolbar (`FilterBar.tsx`)**: Clean two-tier filter bar with a one-click **Reset filters** button (`aria-label="Reset filters"`) visible whenever status, priority, or category filters are active.
   - **Priority-Accented Todo Cards (`TodoItem.tsx`)**: Left accent border (`border-l-4`) color-coded by priority (`high` rose, `medium` amber, `low` blue) for instant visual scanning, plus refined spacing and badge contrast.

### Files to Add or Modify in Version 1.2

| File | Change |
| :--- | :--- |
| `vitest.config.ts` | Update `test.include` to `["test/**/*.{test,spec}.{ts,tsx}"]` |
| `test/**/*` (moved from `src/**/*`) | Relocate `sanity.test.ts`, `app/page.test.tsx`, `components/*.test.tsx`, `hooks/use-todos.test.ts`, `services/local-todo-service.test.ts`, and `services/todo-service.contract.ts` into `test/` |
| `src/services/theme-storage.ts` | New helper to read/write `theme:v1` (`light` \| `dark` \| `system`) safely in `try/catch` |
| `src/services/index.ts` | Re-export `getStoredTheme`, `setStoredTheme`, and `ThemeMode` |
| `src/hooks/use-theme.ts` | Hook managing `ThemeMode` state and syncing `.dark` class on `document.documentElement` |
| `src/components/ThemeToggle.tsx` | Accessible segmented control for Light / Dark / System theme selection |
| `test/components/ThemeToggle.test.tsx` | Component tests for theme switching and persistence |
| `src/app/globals.css` | Add `@custom-variant dark` and softer slate dark mode palette variables (`#0f172a`) |
| `src/app/page.tsx` | Redesign dashboard header with `ThemeToggle`, completion progress bar, stat pills, and softer dark mode surfaces |
| `src/components/AddTodoForm.tsx` | Update surface colors and focus styling for softer dark mode and intuitive layout |
| `src/components/FilterBar.tsx` | Streamlined toolbar layout, softer dark mode styling, and **Reset filters** button |
| `src/components/TodoItem.tsx` | Left priority accent bar, softer dark mode card surfaces, and polished badge contrast |
| `src/components/TodoList.tsx` | Softer dark mode empty state and list spacing |
| `test/components/FilterBar.test.tsx` | Add test for **Reset filters** button |
| `test/app/page.test.tsx` | Add tests for progress bar / stats summary and theme toggle integration |
| `e2e/todos.spec.ts` | Add e2e test verifying theme toggle (`.dark` class & softer background) and filter reset |

### Open Decisions for V1.2
- None (`OPEN` count: 0). All requirements (moving tests to `/test`, softer slate dark mode palette with Light/Dark/System toggle, and intuitive dashboard redesign) were confirmed during `/spec`.

---

## Version 2 Plan — Neon + Vercel (Outline; detail with `/plan 2`)

### Goal
Move persistence from browser `localStorage` to Neon PostgreSQL via Drizzle ORM and Next.js Route Handlers. The database schema will directly reflect the enriched `Todo` shape. Components and hooks remain completely unchanged.
