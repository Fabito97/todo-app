# Project Rules: Next.js Todo App

These rules are always on. They exist because the human owns decisions and verification; the agent owns typing. If a rule blocks you, stop and ask. Do not work around it.

## Stack (decided, do not change without asking)

- Next.js, App Router only. **No `pages/` directory.** TypeScript in strict mode.
- Styling: Tailwind CSS.
- Data: SQLite via `better-sqlite3` and Drizzle ORM. Migrations are generated, reviewed, and committed. Never edit or delete a committed migration.
- Validation: Zod. Schemas live in `lib/schemas.ts` and are shared by client and server.
- Unit and API tests: Vitest. End-to-end tests: Playwright.
- Package manager: npm.

## Commands

| Purpose | Command |
| :--- | :--- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Unit and API tests | `npm run test` |
| Fast gate (lint + typecheck + test) | `npm run verify` |
| End-to-end tests | `npm run e2e` |
| Gate script used by workflows | `bash .agents/hooks/post_task.sh incremental-orchestrator [fast|full]` |

## Architecture

- `db/` holds the schema, migrations, and the DB client.
- `lib/todos.ts` is the only module that touches the database. Route Handlers and Server Components call it; they never query the DB directly.
- Mutations go through Route Handlers in `app/api/todos/`. The contract is in `implementation_plan.md`. If code and contract disagree, the contract wins, or you stop and propose a contract change.
- Server Components may read via `lib/todos.ts`. Client components use `fetch` against the API.

## Coding rules

- Validate **all** input on the server with Zod, even if the client already validated it.
- Every API error uses the shape in the contract: `{ "error": { "code", "message", "fields"? } }`. Never leak stack traces or raw DB errors to clients.
- **Never swallow errors.** No empty `catch`. Log server-side, return a safe message.
- No `any` unless justified in a comment. No `// @ts-ignore`.
- No new dependency without asking first. State what it does and what you considered instead.
- Do not invent APIs. For Next.js, Drizzle, Zod, Vitest, and Playwright, check the installed version's types or the official docs. If you are not sure a function exists, say so instead of guessing.
- Keep it simple. No abstractions, layers, or generic utilities that the current slice does not need.
- If auth is added later: every query is scoped to the current user id, and there is a test proving user A cannot read or modify user B's todos.

## Testing rules

- Test-first: write tests from the acceptance criteria and watch them fail for the right reason before implementing.
- Every acceptance criterion maps to at least one test. Tests must assert behavior. `expect(true)` and snapshot-only tests do not count.
- Never weaken, skip, or delete a test to make the gate pass. If a test is wrong, say why and get approval.
- Playwright tests use accessible selectors (`getByRole`, `getByLabel`), not CSS class selectors.

## Git rules

- Never commit to `main`. Work on `slice/<nn>-<short-name>`.
- One commit per completed task. Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- Never `git push --force`, `git reset --hard`, or `git clean -fd` without explicit approval.
- Never commit `.env` files, database files, or secrets. Config goes through environment variables; keep `.env.example` current.

## Working rules

- Work on **one slice at a time**. Touch only files the slice plan lists. If you need another file, update the plan first.
- Keep `task.md` current: check items off only after the gate is green and the commit exists.
- **Three-strikes rule**: if the same failure survives three fix attempts, stop. Report the error, what you tried, and your top two hypotheses. Do not keep looping.
- After each slice, stop and wait for human review. Never start the next slice on your own.
- Terminal safety: no `rm -rf` outside `.scaffold_tmp`, `.next`, `node_modules`, `test-results`, or `playwright-report`. Ask before running anything that deletes data.
- Record decisions and caught bugs with the `/log` workflow.
