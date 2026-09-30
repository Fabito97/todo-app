# Project Rules: Next.js Todo App

These rules are always on. The human owns decisions and verification; the agent owns typing. If a rule blocks you, stop and ask. Do not work around it.

## Versions

The app is built in versions. Each version is complete, tested, and merged before the next one starts.

- **Version 1**: data lives in the browser's `localStorage`. No backend, no database, no API routes.
- **Version 2**: real API routes (Route Handlers) backed by SQLite. Data moves from the browser to the server.

Only build the version you were told to build. Do not write Version 2 code during Version 1. The one exception is the service structure below, which exists from Version 1 on precisely so that Version 2 is a small change.

## Stack (decided, do not change without asking)

- Next.js, App Router, **with a `src/` directory** (`src/app`, never a root-level `app`). No `pages/`. TypeScript strict. Tailwind CSS.
- Zod for validation, in all versions.
- Vitest with React Testing Library (jsdom) for unit, component, and API tests. Playwright for end-to-end tests in `e2e/`.
- Package manager: npm.
- **Version 2 only**: SQLite via `better-sqlite3` and Drizzle ORM. Migrations are generated, reviewed, and committed. Never edit or delete a committed migration.

## Commands

| Purpose | Command |
| :--- | :--- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Unit, component, and API tests | `npm run test` |
| Fast gate (lint + typecheck + test) | `npm run verify` |
| End-to-end tests | `npm run e2e` |
| Gate script used by workflows | `bash .agents/hooks/post_task.sh incremental-orchestrator [full]` |

## Service structure (the rule that makes upgrading cheap)

The UI never touches `localStorage` or `fetch`. It talks to a `TodoService`.

| Path | Purpose | Version |
| :--- | :--- | :--- |
| `src/lib/schemas.ts` | The `Todo` type, Zod schemas, and validation rules (trim, 1 to 200 characters). Single source of truth. | 1 |
| `src/services/todo-service.ts` | The `TodoService` interface. **Every method returns a Promise from Version 1 on**, even though `localStorage` is synchronous. | 1 |
| `src/services/local-todo-service.ts` | Implements `TodoService` on `localStorage`. The only module allowed to touch `localStorage`. | 1 |
| `src/services/todo-service.contract.ts` | A shared contract test suite that every implementation must pass. | 1 |
| `src/services/index.ts` | The one place that chooses which implementation the app uses. | 1 |
| `src/hooks/use-todos.ts` | Depends on `TodoService` only. | 1 |
| `src/components/` | UI only. | 1 |
| `src/server/` | DB client, schema, and `todo-repository.ts`. The repository implements `TodoService` on SQLite and is the only code allowed to touch the database. | 2 |
| `src/app/api/todos/` | Route Handlers. They validate with `schemas.ts` and call the repository. | 2 |
| `src/services/http-todo-service.ts` | Implements `TodoService` by calling the API. The only client module allowed to call `/api/todos`. | 2 |

Consequences you must respect:

- Components and hooks never import `localStorage`, `fetch`, `src/server`, or a concrete service. ESLint enforces this for `localStorage`, `sessionStorage`, and `fetch`.
- Business rules (trimming, length limits) live in `schemas.ts`, never only in a form.
- Going from Version 1 to Version 2 should add files and change `src/services/index.ts`. If a slice needs to change a component or hook to swap the backend, the interface is wrong: stop and ask.
- Changing the `TodoService` interface is a plan change that needs the human's approval.

## Coding rules

- Todo shape: `{ id: string, title: string, completed: boolean, createdAt: string (ISO), updatedAt: string (ISO) }`. It is defined once, in `schemas.ts`.
- **Version 1**: the storage key is `todos:v1`. Never read `localStorage` during render or in a Server Component; load it in an effect after mount and show a loading state. Wrap every storage call in `try/catch` (blocked, private mode, and full quota all throw). Validate stored data with Zod; corrupt or wrong-shaped data becomes an empty list plus a visible notice, never a crash.
- **Version 2**: validate all input on the server with Zod, even if the client already did. Every API error uses the shape in the plan: `{ "error": { "code", "message", "fields"? } }`. Never leak stack traces or raw database errors.
- Never swallow errors. No empty `catch`. Handle it or surface it.
- No `any` unless justified in a comment. No `// @ts-ignore`.
- No new dependency without asking first. State what it does and what you considered instead.
- Do not invent APIs. Check the installed version's types or the official docs. If unsure, say so.
- Keep it simple. No abstractions the current slice does not need.

## Testing rules

- Test-first: write tests from the acceptance criteria and watch them fail for the right reason before implementing.
- Every acceptance criterion maps to at least one test. Tests must assert behavior. `expect(true)` does not count.
- Every `TodoService` implementation must pass the shared contract suite. When a new implementation is added, run the same suite against it instead of writing new expectations.
- Never weaken, skip, or delete a test to make a check pass. If a test is wrong, say why and get approval.
- Query the UI by role or label (`getByRole`, `getByLabelText`), not by CSS class. Playwright tests use the same accessible selectors.
- Tests must not depend on each other: clear `localStorage` before each test (Version 1) or use a fresh test database (Version 2). End-to-end tests written in Version 1 should keep passing in Version 2 with their assertions unchanged.

## Git rules

- Never commit to `main`. Manual work goes on `slice/v<version>-<nn>-<short-name>`. `/autopilot` works on `auto/v<version>`.
- One commit per completed task, in Conventional Commits style (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- Never `git push --force`, `git reset --hard`, or `git clean -fd` without explicit approval.
- Never commit `.env` files, database files, or secrets. Keep `.env.example` current.

## Working rules

- Work on **one slice at a time**. Touch only files the slice plan lists. If you need another file, update the plan first.
- Check items off in `task.md` only after the checks pass and the commit exists.
- **Three-strikes rule**: if the same failure survives three fix attempts, stop. Report the error, what you tried, and your top two hypotheses.
- After each slice, stop and wait for human review. Never start the next slice on your own.
- Terminal safety: no `rm -rf` outside `.scaffold_tmp`, `.next`, `node_modules`, `test-results`, and `playwright-report`. Ask before deleting anything else.
- Record decisions and caught bugs with the `/log` workflow.

## Design

- If `design.md` exists and the version being built has `Design V<n>: APPROVED by human`, read it before touching any UI and follow it: use its tokens, component specs, and copy, and do not invent colours, spacing, or wording that it defines. If that version's design is not approved, use plain Tailwind defaults and keep the UI simple.
- Never edit `design.md` or the `design/` folder during a build. Only the `/design` workflow changes them.
- These hold with or without a design: every control has an accessible name and a visible focus style, everything works by keyboard, and meaning is never carried by colour alone (always add a text label or icon alternative).

## Approval and autonomy

- Only the human approves a version's plan. Approval is recorded as a line in `implementation_plan.md`: `Status V<n>: APPROVED by human on <date>`. Never write that line without an explicit approval message from the human in chat, and never edit `requirements.md` or `implementation_plan.md` during a build.
- `/autopilot` builds one version at a time, and only after that version's approval line exists. It stops when the version is complete. It never starts the next version on its own.
- When in doubt, stop and ask.
