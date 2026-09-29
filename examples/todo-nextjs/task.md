Tracking: local

# Task Checklist

DRAFT seed. Run `/plan` to have the Team Lead produce `implementation_plan.md` (including the API contract below in full) and refine this list.

## Draft API contract

`Todo` = `{ id: string (uuid), title: string, completed: boolean, createdAt: ISO string, updatedAt: ISO string }`

Error shape (all failures): `{ "error": { "code": "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL", "message": string, "fields"?: Record<string, string> } }`

| Method | Path | Request body | Success | Errors |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/todos?status=all\|active\|completed` | none | 200 `{ todos: Todo[] }` newest first | 400 invalid `status` |
| POST | `/api/todos` | `{ title }` | 201 `{ todo }` | 400 empty, whitespace-only, or over 200 characters |
| PATCH | `/api/todos/:id` | `{ title? , completed? }` at least one field | 200 `{ todo }` | 400 invalid body or id, 404 unknown id |
| DELETE | `/api/todos/:id` | none | 204 no body | 400 invalid id, 404 unknown id |

## Slice 00: Bootstrap and verification harness
- [ ] Scaffold Next.js, Vitest, Drizzle, Zod, Playwright, ESLint
- [ ] Scripts `lint`, `typecheck`, `test`, `verify`, `e2e` exist and pass
- [ ] CI workflow runs the full gate
**Acceptance criteria**
- `bash .agents/hooks/post_task.sh incremental-orchestrator full` exits 0.
- CI is green on the bootstrap branch.

## Slice 01: Data layer
- [ ] Write tests for the todo service
- [ ] Schema, first migration, `lib/todos.ts` (create, list, get, update, delete)
- [ ] Verify and commit
**Acceptance criteria**
- Creating a todo returns a uuid id, `completed: false`, and timestamps.
- Listing returns newest first and supports the status filter.
- Updating or deleting an unknown id reports "not found" rather than throwing a raw DB error.
**Tests**
- unit: every service function, using an in-memory or temp-file database

## Slice 02: Create todo
- [ ] Write API and UI tests
- [ ] POST route, shared Zod schema, add-todo form
- [ ] Verify and commit
**Acceptance criteria**
- A valid title returns 201 and the todo appears in the list without a full page reload.
- A title of `""`, `"   "`, or 201 characters returns 400 with `fields.title` set, and the UI shows the message.
- Titles are trimmed before saving.
**Tests**
- api: 201 and each 400 case
- e2e: add a todo and see it listed

## Slice 03: List and filter
- [ ] Write tests
- [ ] GET route with `status`, list UI, filter tabs, empty state
- [ ] Verify and commit
**Acceptance criteria**
- Filters All, Active, and Completed show the right todos, and the selected filter is visible to assistive tech.
- An invalid `status` returns 400.
- An empty list shows a helpful empty state.
**Tests**
- api: each status value and the invalid case
- e2e: switch filters

## Slice 04: Toggle complete
- [ ] Write tests
- [ ] PATCH `completed`, checkbox UI
- [ ] Verify and commit
**Acceptance criteria**
- Clicking the checkbox toggles the todo and the state survives a reload.
- If the request fails, the UI reverts and shows an error.
- Unknown id returns 404 with the standard error shape.
**Tests**
- api: 200, 400, 404
- e2e: toggle and reload

## Slice 05: Edit title
- [ ] Write tests
- [ ] PATCH `title`, inline edit UI with keyboard support
- [ ] Verify and commit
**Acceptance criteria**
- Editing saves on Enter, cancels on Escape, and applies the same validation as create.
- Whitespace-only edits are rejected and the old title is kept.
**Tests**
- api: valid and invalid titles, 404
- e2e: edit, cancel, and reject empty

## Slice 06: Delete
- [ ] Write tests
- [ ] DELETE route, delete button with accessible label
- [ ] Verify and commit
**Acceptance criteria**
- Deleting removes the todo, returns 204, and it stays gone after reload.
- Deleting an unknown id returns 404.
**Tests**
- api: 204, 404
- e2e: delete and reload

## Slice 07: Polish and hardening
- [ ] Loading and error states, responsive layout, focus management
- [ ] Verify and commit
**Acceptance criteria**
- The app is usable at 375px width and fully keyboard operable.
- API failures show a visible, dismissible error.
- No console errors during the e2e happy path.

## Slice 08 (optional): Authentication
Only if approved in `/spec`. Every query scoped to the current user, with a test proving user A cannot read, edit, or delete user B's todos.

## Slice 09: Finish
- [ ] Run `/finish`: audit, README, workflow log complete, release notes
