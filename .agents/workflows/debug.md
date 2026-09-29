---
description: Evidence-first debugging. Reproduce, list hypotheses, confirm the cause, fix, and add a regression test
---
1. Ask the human for the symptom, the exact error text or logs, and the steps to reproduce, unless they are already in the message. Also ask for any suspected cause. A human hint is high-value evidence.
2. Reproduce the failure. Write a failing test that captures it if practical, or record the exact command and output. If you cannot reproduce it, say so and stop.
3. List **at least two** hypotheses, ranked by likelihood, each with the evidence for and against and a cheap way to test it. Do not edit code yet.
4. Test the top hypothesis with the cheapest experiment (a log line, a narrower test, a query). Report the result. Repeat for the next hypothesis if needed.
5. State the confirmed root cause in one or two sentences before changing code.
6. Make the smallest fix that addresses the root cause. Do not refactor nearby code.
// turbo
7. Run `bash .agents/hooks/post_task.sh incremental-orchestrator fast`. The reproduction test must now pass, along with everything else.
8. Commit as `fix: ...` with the regression test included. Run the `/log` workflow and record the bug, the root cause, and how it was found.
9. If the same failure survives three fix attempts, stop and report what you tried and your top two remaining hypotheses.
