# AGENTS.md

Instructions for any AI coding agent working in this repository (Antigravity, Claude Code, Codex, Gemini CLI, Cursor, Copilot, and others). Read this file first. Deeper detail lives in the files it points to.

## Project

A Next.js todo app (create, list, filter, edit, complete, delete) built with an AI-assisted, spec-first, test-gated workflow. The human owns decisions and verification. You own the typing. Scope and features are defined in `requirements.md`.

If `requirements.md`, `implementation_plan.md`, or `task.md` do not exist yet, the project has not been planned. Do not start coding. Follow the `spec` and `plan` workflows below.

## Source of truth

Read these before making changes. When they disagree, the higher item wins.

1. The human's latest instruction.
2. `.agents/rules/nextjs-todo.md`: stack, coding, testing, and git rules. This is the full rulebook; the summary below is not a substitute.
3. `implementation_plan.md`: architecture and the API contract.
4. `requirements.md` and `task.md`: scope, slices, and acceptance criteria.

## Commands

| Purpose | Command |
| :--- | :--- |
| Install | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Unit and API tests | `npm run test` |
| Fast gate (lint, typecheck, test) | `npm run verify` |
| End-to-end tests | `npm run e2e` |
| Gate used by workflows | `bash .agents/hooks/post_task.sh incremental-orchestrator fast` (or `full` to include e2e) |

If a command does not exist yet, the bootstrap slice has not been done. Run the `bootstrap` workflow instead of inventing scripts.

## Stack

Next.js App Router (no `pages/`), TypeScript strict, Tailwind, SQLite with `better-sqlite3` and Drizzle, Zod for validation, Vitest, Playwright, npm. Only `lib/todos.ts` touches the database. Mutations go through Route Handlers in `app/api/todos/`.

## Non-negotiable rules

Summary only. The full list is in `.agents/rules/nextjs-todo.md`.

- Work on **one slice at a time**, on branch `slice/<nn>-<short-name>`. Never commit to `main`.
- **Tests first.** Write tests from the acceptance criteria, watch them fail for the right reason, then implement.
- Validate all input on the server with Zod. Use the standard error shape from the contract.
- Never swallow errors. Never leak stack traces or raw DB errors to clients.
- Never weaken, skip, or delete a test to get green.
- No new dependencies without asking first.
- Do not invent APIs. Check the installed version's types or docs. If unsure, say so.
- One Conventional Commit per completed task. Never force-push. Never commit `.env` files, database files, or secrets.
- **Three strikes**: if the same failure survives three fix attempts, stop and report the error, what you tried, and two hypotheses.
- After finishing a slice, stop and wait for human review. Do not start the next slice.

## Ask first

Stop and ask the human before you:

- change the stack, the API contract, or the database schema of a committed migration
- add or upgrade a dependency
- touch files outside the current slice plan
- delete data, files, branches, or run destructive git commands
- make a decision that `requirements.md` leaves open

## Workflows

Procedures live in `.agents/workflows/<name>.md`. In Antigravity they run as slash commands (for example `/slice`). In any other tool, when the human asks for a workflow by name, open the matching file and follow its numbered steps in order.

Notes for tools other than Antigravity:

- Lines that say `// turbo` mark commands Antigravity may auto-run. Treat them as ordinary steps and follow your own tool's permission rules.
- Where a step says to "adopt" a skill, read that skill's `SKILL.md` and act within its role and rules.
- Steps that say STOP are human gates. Stop and wait even if your tool would let you continue.

| Command | File | Purpose |
| :--- | :--- | :--- |
| `spec` | `.agents/workflows/spec.md` | Idea to `requirements.md` |
| `plan` | `.agents/workflows/plan.md` | API contract, `implementation_plan.md`, slice-based `task.md` |
| `bootstrap` | `.agents/workflows/bootstrap.md` | Slice 0: scaffold and verification harness |
| `slice` | `.agents/workflows/slice.md` | Build the next slice test-first with a verify gate |
| `verify` | `.agents/workflows/verify.md` | Run the full gate and report |
| `review` | `.agents/workflows/review.md` | Fresh-eyes review; writes `review.md`, changes no code |
| `debug` | `.agents/workflows/debug.md` | Reproduce, hypothesize, confirm, fix, add regression test |
| `log` | `.agents/workflows/log.md` | Append to `docs/ai-workflow-log.md` |
| `finish` | `.agents/workflows/finish.md` | Final audit and release notes |
| `status-check` | `.agents/workflows/status-check.md` | Progress, gate health, next step |

Typical order: `spec`, `plan`, `bootstrap`, then repeat `slice` and `review` per slice, then `finish`.

## Roles (skills)

Skills in `.agents/skills/<name>/SKILL.md` define roles. Use one role at a time, and respect its limits.

| Skill | Role | Writes code? |
| :--- | :--- | :--- |
| `product-manager` | Interviews the human, writes `requirements.md` | No |
| `team-lead-orchestrator` | Architecture, API contract, `task.md` | No |
| `incremental-orchestrator` | Builds one slice with the test-first, gated loop | Yes |
| `code-reviewer` | Reviews a diff, writes `review.md` | No |
| `project-auditor` | Final completeness audit | No |
| `prerequisites-checker` | Verifies tools and environment | No |
| `project-scaffolder` | Safe project initialization | Boilerplate only |
| `issue-creator`, `project-board-manager` | GitHub issues and boards (only when `task.md` says `Tracking: github`) | No |
| `doc-reviewer`, `markdown-formatter` | Documentation prose and formatting | Docs only |

A reviewer should not be the same session that wrote the code. If you wrote the code, do not review it; ask the human to start a fresh session.

## Definition of done (per slice)

A slice is done only when all of these are true:

- Every acceptance criterion has a passing test that asserts real behavior.
- `bash .agents/hooks/post_task.sh incremental-orchestrator fast` passes, plus `full` if a user flow changed.
- The diff touches only files listed in the slice plan.
- The tasks are checked off in `task.md` and a Conventional Commit exists.
- An entry was added with the `log` workflow.

## Repository map

- `.agents/rules/`: always-on rules (`nextjs-todo.md`).
- `.agents/skills/`: role definitions.
- `.agents/workflows/`: step-by-step procedures.
- `.agents/hooks/`: `post_task.sh` is the quality gate; `pre_task.sh` handles optional model routing.
- `PROMPTS.md`: prompts the human can copy for each stage.
- `examples/todo-nextjs/`: seed `requirements.md` and draft `task.md`.
- `docs/ai-workflow-log.md`: running log of decisions and caught bugs.

## When in doubt

Prefer the smaller change, ask a question, and show evidence (test output, diff, error text) instead of asserting that something works.
