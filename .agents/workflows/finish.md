---
description: Final audit of one completed version. Checks requirements, docs, and quality, then prepares release notes
---
1. Decide which version to audit: the number the human passed (for example `/finish 1`), otherwise the highest-numbered version whose non-optional slices are all checked in `task.md`. Adopt the `project-auditor` skill and audit **only versions up to that one**: compare the matching parts of `requirements.md` and `task.md` against the code. Ignore anything planned for later versions, and flag any code that belongs to a later version.
// turbo
2. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full`.
// turbo
3. Search for leftovers with `git grep -nE "TODO|FIXME|console\.log"` and list each hit.
4. Confirm `README.md` (a product README, not the scaffold's default) describes the app as of this version: what it is, the stack, the features, and how to install, run, and test it. It must state where data is stored (Version 1: browser `localStorage`; Version 2: SQLite on the server) and list API endpoints and environment variables only if they exist in this version.
// turbo
5. Confirm `.env` files and database files are not tracked (`git ls-files | grep -E "\.env$|\.db$|\.sqlite"` must return nothing).
6. Confirm `docs/ai-workflow-log.md` has an entry for every completed slice of this version, each showing the checks run. List any slice with a missing entry.
7. For Version 2 and later, confirm the upgrade stayed small: `git diff` between the previous version's merge and now shows no changes under `src/components` or `src/hooks` beyond what the plan named.
8. Produce an audit report: approve or reject, with exact failures. If rejected, list what to fix and stop. If approved, draft short release notes for this version and remind the human to tag it after merging (`git tag v<n>`). Then tell the human the path to the next version: merge to `main` and tag it; run `/spec` to update `requirements.md` for the next version; run `/design <next>` if the UI changes (optional); run `/plan <next>` and approve it; commit the documents; then `/autopilot` or `/slice`.
