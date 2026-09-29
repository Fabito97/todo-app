---
description: Fresh-eyes review of the current slice's diff against the spec, contract, and rules. Writes review.md and changes no code
---
1. Adopt the `code-reviewer` skill. This works best in a **new conversation** with a different model than the one that wrote the code. If this conversation wrote the code, say so and recommend starting a fresh one.
// turbo
2. Run `git branch --show-current` and `git diff main...HEAD --stat`.
3. Read `requirements.md`, `implementation_plan.md` (especially the API contract), `task.md`, `.agents/rules/nextjs-todo.md`, the full diff, and the tests.
// turbo
4. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full` and record the result. Do not fix failures.
5. Work through the full review checklist. For each new test file, name one deliberate breakage of the implementation that the tests should catch, and check the test would really fail.
6. Write `review.md` in the required format. Do not modify source code, tests, or config.
7. Give the human the verdict and the blocking findings in five lines or fewer. The human decides which findings go back to the builder.
