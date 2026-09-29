---
description: Build the next unchecked slice test-first with a verify gate, a commit, and a human review stop
---
1. Adopt the `incremental-orchestrator` skill. Read `.agents/rules/nextjs-todo.md`, `requirements.md`, `implementation_plan.md`, and `task.md`.
// turbo
2. Run `git status` and `git branch --show-current`. If the tree is dirty, stop and ask the human.
3. Identify the next unchecked slice, or use the slice number the human passed with this command. State which slice you picked and why.
4. Create the slice branch `slice/<nn>-<short-name>` off `main`.
5. Write the **slice plan**: files to create or change, one test per acceptance criterion, risks, and any contract concerns. **STOP and wait for approval or comments.** Skip only if the human said "auto".
6. Write the tests first. Run them and show that they fail for the right reason.
7. Implement the minimum code to make the tests pass. Touch only files listed in the slice plan.
// turbo
8. Run `bash .agents/hooks/post_task.sh incremental-orchestrator fast`.
9. If the slice changes a user flow, add or update a Playwright test and run `bash .agents/hooks/post_task.sh incremental-orchestrator full`.
10. If a gate fails, fix the root cause and rerun. After three failed attempts on the same failure, stop and report the error, what you tried, and two hypotheses.
11. Read your own `git diff` against the acceptance criteria and the rules. Remove anything the slice did not need.
12. Commit using Conventional Commits. Check off the finished tasks in `task.md`. Run the `/log` workflow.
13. Report: what changed, tests added, gate results, open questions. Recommend that the human open a **new conversation** and run `/review`. **STOP.** Do not start the next slice.
