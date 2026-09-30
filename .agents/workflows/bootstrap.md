---
description: Version 1, Slice 00. Scaffold the Next.js app (with a src folder) and build the verification harness
---
1. Adopt the `prerequisites-checker` skill and verify git, node, npm, and Playwright are ready. Stop and report if anything is missing.
2. Adopt the `project-scaffolder` skill's safety rules. The project root already contains `.agents`, `AGENTS.md`, `requirements.md`, `task.md`, and possibly `.git`. **Do not run `create-next-app` in the root.** Scaffold into `.scaffold_tmp` with TypeScript, ESLint, Tailwind, App Router, and **a `src/` directory**. Then move the generated files into the root **without overwriting anything that already exists**. If the scaffold produced its own `AGENTS.md`, `CLAUDE.md`, or `README.md`, keep ours, discard those, and tell the human. Delete `.scaffold_tmp`.
3. Read `.agents/rules/nextjs-todo.md` and confirm the generated project matches the stack, and that routes live in `src/app`. Report any mismatch before continuing.
4. Make sure `main` has an initial commit, then create branch `slice/v1-00-bootstrap` off it (autopilot stays on its own branch instead).
5. Install and configure the harness: Zod, Vitest with `@vitejs/plugin-react`, jsdom and React Testing Library, and Playwright (put its tests in `e2e/`). State the exact versions installed. **Do not install Drizzle or `better-sqlite3`; those belong to Version 2.**
6. Ensure `package.json` defines these scripts: `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `verify` (lint, typecheck, and test chained), and `e2e` (`playwright test`).
7. Add an ESLint rule (flat config `no-restricted-globals`) that forbids `localStorage`, `sessionStorage`, and `fetch` inside `src/components` and `src/hooks`. Do not write any service code yet; that is the next slice.
8. Add one trivial passing unit test and one trivial Playwright test that loads the home page, so the gate proves it can go green.
9. Add a CI workflow at `.github/workflows/ci.yml` that runs `npm ci`, `npm run verify`, installs Playwright browsers, and runs `npm run e2e`.
10. Add `.env.example` for any environment variables, and confirm `.env*` (except `.env.example`), database files, `node_modules`, `.next`, `test-results`, and `playwright-report` are gitignored.
// turbo
11. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full`. It must pass.
12. Check off V1 Slice 00 in `task.md`, make one commit per logical step using Conventional Commits (the last one includes the `task.md` update), then run the `/log` workflow, which commits its own entry.
13. Summarize the result and **STOP**. Tell the human to review the diff and merge `slice/v1-00-bootstrap` into `main` themselves (later slices branch from `main`). Then they continue with `/slice` for the next slice, or with `/autopilot` to build the rest of the version hands-off (it resumes from `task.md`).
