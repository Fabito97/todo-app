---
description: Produce implementation_plan.md (with API contract) and a slice-based task.md, then wait for approval
---
1. Adopt the `team-lead-orchestrator` skill. Read `requirements.md` and `.agents/rules/nextjs-todo.md`. If `requirements.md` is missing, tell the human to run `/spec` and stop.
2. Write `implementation_plan.md` with these sections: architecture summary, data model, API contract table (methods, paths, bodies, status codes, shared error shape, validation rules), folder structure, test strategy, risks and open decisions.
3. Write `task.md` starting with `Tracking: local` (unless the human asked for GitHub). Slice 0 is bootstrap and the verification harness. Every later slice is a vertical feature slice with acceptance criteria and a test list.
4. Self-check before presenting: every acceptance criterion is testable, every endpoint in the contract is covered by some slice, and no slice touches more than one feature.
5. Present both artifacts and list the open decisions you need answered. **STOP and wait.** Apply the human's comments to the artifacts and re-present until they approve.
6. Once approved, tell the human to run `/bootstrap`.
