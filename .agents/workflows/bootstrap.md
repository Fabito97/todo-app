---
description: Slice 0. Scaffold the Next.js app and build the verification harness (lint, typecheck, tests, e2e, CI)
---

1. Adopt the `prerequisites-checker` skill and verify git, node, npm, and Playwright are ready. Stop and report if anything is missing.
2. Adopt the `project-scaffolder` skill's safety rules. The project root already contains `.agents`, `requirements.md`, and possibly `.git`. **Do not run `create-next-app` in the root.** Scaffold into `.scaffold_tmp` with TypeScript, ESLint, Tailwind, App Router, and include `src` directory unless the plan says otherwise. Then move the generated files into the root without overwriting existing files, and delete `.scaffold_tmp`.
3. Read `.agents/rules/nextjs-todo.md` and confirm the generated project matches the stack. Report any mismatch before continuing.
4. Create branch `slice/00-bootstrap` off `main`. If `main` has no commits, make an initial commit with the framework files first.
5. Install and configure the harness: Vitest, Drizzle with `better-sqlite3`, Zod, and Playwright. State the exact versions installed.
6. Ensure `package.json` defines these scripts: `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `verify` (lint, typecheck, and test chained), and `e2e` (`playwright test`).
7. Add one trivial passing unit test and one trivial Playwright test that loads the home page, so the gate proves it can go green.
8. Add a CI workflow at `.github/workflows/ci.yml` that runs `npm ci`, `npm run verify`, installs Playwright browsers, and runs `npm run e2e`.
9. Add `.env.example` for any environment variables, and confirm `.env` and database files are gitignored.
// turbo
10. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full`. It must pass.
11. Make one commit per logical step using Conventional Commits, check off Slice 0 in `task.md`, and run the `/log` workflow.
12. Summarize the result and **STOP**. Tell the human to review the diff and then run `/slice` for Slice 1.