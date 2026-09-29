---
description: Turn the project idea into requirements.md, including the version roadmap and planned structure, with the stack and decisions fixed by the human
---
// turbo
1. Run `bash .agents/hooks/check_setup.sh` and paste its full output at the top of your first message. If it reports MISSING kit files or OUTDATED items, STOP and tell the human to re-copy `.agents/` and `AGENTS.md` from the latest kit. Do not continue without the rules file.
2. Adopt the `product-manager` skill. Read `.agents/rules/nextjs-todo.md`. In one or two lines, state what you found there: the versions and the folder structure under `src/`. This proves you have the context. Treat the stack and the service structure as already decided; do not re-ask about them.
3. Look for `requirements.md` in the project root. If it exists, read it and list what is missing or ambiguous instead of starting over. If it does not exist, create it by copying `.agents/templates/todo-nextjs/requirements.md`, and tell the human you did.
4. Confirm the **version roadmap** with the human: Version 1 keeps data in the browser's `localStorage`, Version 2 adds real API routes with SQLite, and anything later is listed as postponed. Each version must be a complete, working app on its own.
5. Ask only about genuinely unresolved decisions, ONE question at a time (for example: extra features, whether a later version adds accounts, deployment target).
6. Summarize back to the human, in under 25 lines: (a) the version table, (b) the core features, and (c) a **structure preview**, meaning the `src/` folders and the `TodoService` idea from the rules file, in a few lines. Ask for approval.
7. On approval, write or update `requirements.md` in the project root with the sections Goal, Versions, Core Features (say which version each belongs to when it is not all of them), Tech Stack per version, Architecture Principle, Constraints, and **Out of Scope**.
8. Do not write code. Tell the human to run `/plan` next.
