---
description: Report project progress, gate health, and git state in one concise summary
---
1. If `task.md` exists, count the checked and unchecked tasks per version, name the current version (the lowest-numbered one with unchecked slices), and name its next unchecked slice. Also report each version's status line from `implementation_plan.md`. If it does not exist, say the project has not been planned yet and suggest `/spec`.
2. List the skills in `.agents/skills` and the workflows in `.agents/workflows`. Flag any empty skill directory.
// turbo
3. Run `git status --short` and `git branch --show-current`.
// turbo
4. Run `git log --oneline -5`.
5. If `package.json` exists, run `bash .agents/hooks/post_task.sh incremental-orchestrator fast` and report pass or fail.
6. Report concisely: progress per version (X of Y tasks), current branch, uncommitted changes, gate status, and the recommended next command (`/spec`, `/plan`, `/bootstrap`, `/slice`, `/review`, or `/finish`).
