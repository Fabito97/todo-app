---
description: Run the full gate and report a pass/fail table with the first failure explained
---
1. Read `.agents/rules/nextjs-todo.md` for the command list.
// turbo
2. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full`.
3. Report a short table with lint, typecheck, unit/API tests, and e2e, each marked pass or fail.
4. If anything failed, quote the first error, name the likely cause, and propose a fix. Do not change any code. Ask the human whether to proceed.
