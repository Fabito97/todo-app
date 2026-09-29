---
description: Final audit and wrap-up. Checks requirements, docs, and quality, then prepares the release notes
---
1. Adopt the `project-auditor` skill. Compare `requirements.md` and `task.md` against what exists in the code. Every core feature must be built and tested, and nothing outside scope may have been added.
// turbo
2. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full`.
// turbo
3. Search for leftovers with `git grep -nE "TODO|FIXME|console\.log"` and list each hit.
4. Confirm `README.md` explains what the app is, the stack, how to install, run, test, and configure environment variables, and lists the API endpoints.
5. Confirm `.env` and database files are not tracked (`git ls-files | grep -E "\.env$|\.db$|\.sqlite"` must return nothing).
6. Confirm `docs/ai-workflow-log.md` has an entry for every completed slice.
7. Produce an audit report: approve or reject, with exact failures. If rejected, list what to fix and stop. If approved, draft short release notes and, in GitHub mode, the PR description.
