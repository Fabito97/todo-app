# AGENTS.md

Instructions for any AI coding agent working in this repository (Antigravity, Claude Code, Codex, Gemini CLI, Cursor, Copilot, and others). Read this file first. Deeper detail lives in the files it points to.

## Project

A Next.js todo app (add, list, filter, edit, complete, delete) built in **versions**, with a spec-first, test-gated workflow. Version 1 stores data in the browser's `localStorage`; Version 2 moves it to API routes and SQLite. The human owns decisions and verification. You own the typing. Scope and features are defined in `requirements.md`. Build only the version you are told to build.

If `requirements.md`, `implementation_plan.md`, or `task.md` do not exist in the project root yet, the project has not been planned. Do not start coding. Follow the `spec` and `plan` workflows below.

## Source of truth

Read these before making changes. When they disagree, the higher item wins.

1. The human's latest instruction.
2. `.agents/rules/nextjs-todo.md`: stack, coding, testing, and git rules. This is the full rulebook.
3. `implementation_plan.md`: architecture, the `TodoService` interface, and the API contract. A version may only be built when its line reads `Status V<n>: APPROVED by human on <date>`.
4. `requirements.md` and `task.md`: scope, slices, and acceptance criteria.
5. `design.md` (optional): tokens, layouts, and component specs for the UI. Follow it only for a version whose line reads `Design V<n>: APPROVED by human on <date>`.

All of these files live in the project root, next to `package.json`. They are documents, not source code. Never put them in the Next.js `app/` folder.

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
| Gate used by workflows | `bash .agents/hooks/post_task.sh incremental-orchestrator` (add `full` to include e2e) |

If a command does not exist yet, the bootstrap slice has not been done. Run the `bootstrap` workflow instead of inventing scripts.

## Stack and structure

Next.js App Router with a **`src/` directory** (`src/app`, no `pages/`), TypeScript strict, Tailwind, Zod, Vitest with React Testing Library, Playwright, npm. Version 2 adds SQLite (`better-sqlite3`) and Drizzle.

The UI talks only to a `TodoService` interface, and every method is async from Version 1 on:

- `src/lib/schemas.ts`: the `Todo` type and Zod rules.
- `src/services/`: the interface, the localStorage implementation (V1), the HTTP implementation (V2), and `index.ts`, the one file that chooses which is used.
- `src/server/` and `src/app/api/todos/` (V2 only): the repository on SQLite and the Route Handlers.
- `src/hooks/` and `src/components/`: never import `localStorage`, `fetch`, or `src/server`.

Moving from Version 1 to Version 2 should add files and change `src/services/index.ts`, not the components. Details are in `.agents/rules/nextjs-todo.md`.

## Non-negotiable rules

Summary only. The full list is in `.agents/rules/nextjs-todo.md`.

- Work on **one slice at a time**, one version at a time. Never commit to `main`.
- **Tests first.** Write tests from the acceptance criteria, watch them fail for the right reason, then implement.
- Keep the service boundary: UI code never touches `localStorage` or `fetch` directly. Validate input with the shared Zod schemas (and on the server in Version 2).
- Never swallow errors. Never weaken, skip, or delete a test to get green.
- No new dependencies without asking first.
- Do not invent APIs. Check the installed version's types or docs. If unsure, say so.
- One Conventional Commit per completed task. Never force-push. Never commit `.env` files, database files, or secrets.
- **Three strikes**: if the same failure survives three fix attempts, stop and report the error, what you tried, and two hypotheses.
- Only the human approves a plan. Never write a `Status V<n>: APPROVED` line yourself.

## Ask first

Stop and ask the human before you:

- change the stack, the `TodoService` interface, the API contract, or a committed database migration
- add or upgrade a dependency
- touch files outside the current slice plan
- delete data, files, or branches, or run destructive git commands
- make a decision that `requirements.md` leaves open

## Workflows

Procedures live in `.agents/workflows/<name>.md`. In Antigravity they run as slash commands (for example `/slice`). In any other tool, when the human asks for a workflow by name, open the matching file and follow its numbered steps in order.

Notes for tools other than Antigravity:

- Lines that say `// turbo` mark commands Antigravity may auto-run. Treat them as ordinary steps and follow your own tool's permission rules.
- Where a step says to "adopt" a skill, read that skill's `SKILL.md` and act within its role and rules.
- Steps that say STOP are human gates. Stop and wait even if your tool would let you continue.

**Two ways to build**

- **Step by step**: `spec`, optionally `design`, `plan`, `bootstrap`, then `slice` and `review` for every slice, then `finish`. You approve each slice.
- **Hands-off**: `spec`, optionally `design`, `plan` (the human approves the plan for the version), then `autopilot`. It builds, tests, reviews, and audits **one version** on a branch called `auto/v<n>`, then stops. Stopping earlier happens only when a human is genuinely needed. To do the next version, run `plan <n+1>` and then `autopilot` again.

| Command | File | Purpose |
| :--- | :--- | :--- |
| `spec` | `.agents/workflows/spec.md` | Idea to `requirements.md` |
| `plan` | `.agents/workflows/plan.md` | Plans one version: `implementation_plan.md` and slice-based `task.md`; records approval |
| `bootstrap` | `.agents/workflows/bootstrap.md` | Slice 0: scaffold and verification harness |
| `slice` | `.agents/workflows/slice.md` | Build the next slice test-first with a verify gate |
| `design` | `.agents/workflows/design.md` | Optional. Designs the UI for one version: `design.md` and an optional mockup; records approval |
| `review` | `.agents/workflows/review.md` | Fresh-eyes review; writes `review.md`, changes no code |
| `autopilot` | `.agents/workflows/autopilot.md` | Hands-off build of one approved version, then stops |
| `verify` | `.agents/workflows/verify.md` | Run the full gate and report |
| `debug` | `.agents/workflows/debug.md` | Reproduce, hypothesize, confirm, fix, add regression test |
| `status-check` | `.agents/workflows/status-check.md` | Progress, gate health, next step |
| `log` | `.agents/workflows/log.md` | Append to `docs/ai-workflow-log.md` |
| `finish` | `.agents/workflows/finish.md` | Audit of one completed version and release notes |

## What comes next

Use this table to tell the human the right next command. `<n>` is the version being worked on.

| Situation | Next command |
| :--- | :--- |
| No `requirements.md`, or a new version needs scoping | `/spec` |
| Requirements ready, the version adds or changes screens, no approved design | `/design <n>` (optional), then `/plan <n>` |
| Requirements (and design) ready, plan missing or not approved | `/plan <n>`, then approve it and commit the documents |
| Plan approved, Version 1 not scaffolded | `/bootstrap` then `/slice`, or `/autopilot` |
| Plan approved, version partly built | `/slice` (step by step) or `/autopilot` (hands-off) |
| A slice is built but not reviewed | `/review` in a new conversation, then merge the branch |
| Every slice of the version is ticked | `/finish <n>`, then merge and tag |
| A version is finished and merged | `/spec` for the next version, then `/design`, `/plan` |
| Something is broken | `/debug` |
| Unsure where things stand | `/status-check` |

## Roles (skills)

Skills in `.agents/skills/<name>/SKILL.md` define roles. Use one role at a time, and respect its limits.

| Skill | Role | Writes code? |
| :--- | :--- | :--- |
| `product-manager` | Interviews the human, writes `requirements.md` | No |
| `team-lead-orchestrator` | Architecture, API contract, `task.md` | No |
| `ui-designer` | Tokens, layouts, component states, accessibility; writes `design.md` | No (docs and mockups only) |
| `incremental-orchestrator` | Builds one slice with the test-first, gated loop | Yes |
| `code-reviewer` | Reviews a diff, writes `review.md` | No |
| `project-auditor` | Final completeness audit | No |
| `prerequisites-checker` | Verifies tools and environment | No |
| `project-scaffolder` | Safe project initialization | Boilerplate only |
| `issue-creator`, `project-board-manager` | GitHub issues and boards (only when `task.md` says `Tracking: github`) | No |
| `doc-reviewer`, `markdown-formatter` | Documentation prose and formatting | Docs only |

A reviewer should not be the same session that wrote the code. If you wrote the code, do not review it; ask the human to start a fresh session. The one exception is `autopilot`, which reviews in-session when it cannot start a separate one and says so in its report.

## Definition of done (per slice)

A slice is done only when all of these are true:

- Every acceptance criterion has a passing test that asserts real behavior.
- `bash .agents/hooks/post_task.sh incremental-orchestrator` passes, with `full` if a user flow changed.
- The diff touches only files listed in the slice plan.
- The tasks are checked off in `task.md` and a Conventional Commit exists.

## Repository map

- `.agents/rules/`: always-on rules (`nextjs-todo.md`).
- `.agents/skills/`: role definitions.
- `.agents/workflows/`: step-by-step procedures.
- `.agents/templates/`: seed `requirements.md` and `task.md` that `spec` and `plan` copy into the project.
- `.agents/hooks/`: `check_setup.sh` reports missing or outdated kit files. `post_task.sh` is the check gate the workflows call. `pre_task.sh` is not used by any workflow; ignore it.
- `QUICKSTART.md`: beginner walkthrough. `PROMPTS.md`: prompts to copy for each stage.
- `requirements.md`, `implementation_plan.md`, `task.md`, `design.md`: project documents in the root. `design/mockups/` holds optional static mockups. `review.md` and `autopilot-report.md` are throwaway reports.
- `docs/ai-workflow-log.md`: running log written after every slice by `log` (what was done, checks run, review result, bugs caught). `docs/autopilot-report-v<n>.md` is the autopilot's report for a finished version.

## When in doubt

Prefer the smaller change, ask a question, and show evidence (test output, diff, error text) instead of asserting that something works.
