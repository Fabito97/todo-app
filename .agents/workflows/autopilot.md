---
description: Hands-off build of ONE version. Once the human has approved that version's plan, builds, tests, reviews, and audits every slice of it, then stops
---
This workflow reuses the other workflows instead of repeating them. Follow `bootstrap.md`, `slice.md`, and `finish.md` step by step, with the overrides below. Overrides always win over the text of those files. It builds **one version per run** and always stops when that version is complete.

## A. Preconditions (all must hold, otherwise STOP)

1. Read `AGENTS.md`, `.agents/rules/nextjs-todo.md`, `requirements.md`, `implementation_plan.md`, and `task.md`. If any is missing, STOP and tell the human which command to run.
2. Decide the version `V`: the number the human passed (for example `/autopilot 2`), otherwise the lowest-numbered version in `task.md` (headings `# Version <n>`) that still has an unchecked non-optional slice. If there is none, tell the human every version is complete and STOP.
// turbo
3. Run `grep -m1 "^Status V<V>:" implementation_plan.md`, with `<V>` replaced by the number. The result must start with `Status V<V>: APPROVED by human`. If not, STOP and say: "The plan for version <V> is not approved. Run /plan <V>, review it, and approve it, or use the manual /slice workflow." You must never edit this line yourself.
4. If `V` is greater than 1, earlier versions must already be merged: run `git show main:task.md` and check that every non-optional slice of the versions below `V` is checked there. If not, STOP and say which version still needs to be reviewed and merged from its `auto/v<n>` branch.
5. Confirm there is no ambiguity: every item marked `OPEN` for version `V` in `implementation_plan.md` is resolved, and `requirements.md` is unambiguous for this version. If there is any doubt, STOP and list the exact questions. Also check the design: if `design.md` exists and its `Design V<V>` line is `DRAFT`, STOP and ask the human to finish approving the design, because builders only follow approved designs. If `design.md` exists but has no line for this version and the version changes the UI, continue but note in the report that plain defaults are being used.
// turbo
6. Run `git status --short` and `git branch --show-current`. The working tree must be clean. If the repository has no commits, make an initial commit on `main`.
7. Create the branch `auto/v<V>` off `main`, or check it out if it already exists (this is how a stopped run resumes). All work happens on this branch. **Never commit to `main`. Never push, merge, or force anything.**
8. Adopt the `prerequisites-checker` skill. If Node, npm, git, or the Playwright browsers are missing, STOP and give the human the exact command to fix it.
9. Make sure `review.md` and `autopilot-report.md` are listed in `.gitignore`. Create `autopilot-report.md` if it does not exist, or append a "Run started: version <V>" section if it does.

## B. Build version V

10. If `V` is 1 and its Slice 00 is unchecked, run `bootstrap.md` steps 1 to 12. Override: in step 4 stay on `auto/v1` (do not create `slice/v1-00-bootstrap`), and skip step 13 (the stop). Record the result in `autopilot-report.md`.
11. For each remaining unchecked slice of version `V`, in order, **skipping slices marked `(optional)`** (list them in the report as skipped), repeat steps 12 to 18. Never touch slices of other versions.
12. Record the starting point: `START=$(git rev-parse HEAD)`.
13. Run `slice.md` steps 1 to 13 with these overrides. Step 14 of `slice.md` (the stop) is replaced by steps 14 to 18 below.
   - Step 4 (slice branch): stay on `auto/v<V>`.
   - Step 5 (slice plan approval): write the slice plan into `autopilot-report.md` and **auto-approve it only if every check passes**: (a) every file it touches lies inside the folder structure of `implementation_plan.md`; (b) each acceptance criterion has at least one planned test; (c) no new dependency is needed beyond those the plan names; (d) no change is needed to the `TodoService` interface, the API contract, a committed migration, or the plan, **beyond exactly what the approved plan for this version already specifies** (so a version that adds fields may change the interface, but only as the plan describes it); (e) nothing depends on a decision that `requirements.md` and the plan do not settle; (f) for version 2 and later, the plan does not modify `src/components` or `src/hooks` unless the plan already lists them. If any check fails, STOP.
   - Step 10 (three-strikes): if the same failure survives three fix attempts, STOP.
   - Step 13 (`/log`): record the entry and commit it, but do not propose changes to the rules file. Mention any lesson in `autopilot-report.md` instead.
// turbo
14. Mechanical scope checks. Run these and STOP if any check fails: `git diff --name-only $START HEAD` lists only files named in the slice plan plus `task.md` and `docs/ai-workflow-log.md`; `git diff $START HEAD -- package.json` shows no dependency the plan did not name; no test file was deleted (`git diff --diff-filter=D --name-only $START HEAD`); no added line contains `.skip`, `.only`, `xit(`, or `xdescribe` (`git diff $START HEAD`).
15. Automated review. Adopt the `code-reviewer` skill on `git diff $START HEAD` and write `review.md`. If your tool can run the review in a separate agent session, use that; otherwise run it in this session and note in the report that the review was not independent.
   - Verdict `REQUEST CHANGES` or any blocking finding: switch back to the builder role, fix each one, add a regression test for each, rerun the checks, and review again. You have **two fix rounds**. If blocking findings remain after that, STOP.
   - Never dismiss a blocking finding without evidence. If you believe a finding is wrong, STOP and let the human decide.
// turbo
16. Run `bash .agents/hooks/post_task.sh incremental-orchestrator full`. It must pass.
17. Append to `autopilot-report.md`: slice name, commit hashes, which checks ran and whether each passed (lint, typecheck, tests with the count, e2e with the count), the review verdict, every review finding with how it was resolved, and any notes. `review.md` is overwritten by the next slice, so this entry is the permanent record of the findings. Do not commit `review.md` or `autopilot-report.md` during the build.
18. Check that `task.md` shows the slice checked off, then continue with the next slice of this version. Do not ask the human anything between slices.

## C. Finish the version, then stop

19. When every non-optional slice of version `V` is checked off, run `finish.md` for version `V`. If the audit rejects, you may fix documentation-only problems (README wording, missing docs) once and re-run the audit. Any other failure: STOP.
20. Write the final section of `autopilot-report.md`: all slices and commits, gate results, review verdicts, skipped optional slices, anything unusual, and the reviewer-independence note. Then copy the whole report to `docs/autopilot-report-v<V>.md` and commit only that file as `docs: autopilot report for version <V>`, so the record stays in the branch history.
21. Tell the human what to do next: read `autopilot-report.md`, look through `git diff main...auto/v<V>`, run `/review` in a **fresh conversation** on the whole branch, merge `auto/v<V>` into `main` themselves, and tag it with `git tag v<V>`. To continue with the next version: run `/spec` to update `requirements.md`, `/design <V+1>` if the UI changes (optional), and `/plan <V+1>` and approve it; commit the documents; then run `/autopilot` again.
22. **STOP.** Do not start version `V+1`, even if its plan already shows as approved.

## What you may decide alone

Names of variables and files inside the planned folders, styling and layout details, how tests are organised inside the planned test files, and wording of UI text that `requirements.md` does not fix. Everything else is a human decision.

## When to STOP

Stop immediately, and do not guess, when any of these happens: a precondition fails; anything is ambiguous or contradicts the requirements or plan; three fix attempts fail on the same problem; blocking review findings remain after two fix rounds; a scope check fails; a new dependency, a plan change, or a change to the service interface, API contract, or schema is needed; a test looks wrong; credentials or secrets are needed; a command you are not allowed to run seems necessary; your tool asks a permission question you cannot answer from these rules.

To stop cleanly: save any unfinished work with `git stash push -u -m "autopilot-wip"` (never `reset` or `clean`), write a **STOPPED** section in `autopilot-report.md` stating where you stopped, why, what you tried, and the specific question or decision you need, then tell the human the same in a few lines. Re-running `/autopilot` resumes from `task.md` and the report, so the run is safe to continue in a new conversation.

## Never

Never approve a plan, edit `requirements.md` or `implementation_plan.md`, or edit `task.md` beyond ticking finished items. Never weaken, skip, or delete a test. Never add a dependency the plan does not name. Never touch `main`. Never push, merge, or use force or destructive git commands. Never run destructive commands outside the folders allowed in the rules file. Never build more than one version per run.
