---
description: Turn the project idea into requirements.md, with the stack and decisions fixed by the human
---
1. Adopt the `product-manager` skill. Read `.agents/rules/nextjs-todo.md` and `examples/todo-nextjs/requirements.md` if they exist. Treat the stack in the rules file as already decided; do not re-ask about it.
2. If `requirements.md` already exists, read it and list what is missing or ambiguous instead of starting over.
3. Ask only about genuinely unresolved decisions, ONE question at a time. For a todo app these are usually: auth or no auth, due dates or priorities, single list or multiple lists, deployment target.
4. Summarize the scope back to the human in under 15 lines and ask for approval.
5. On approval, write or update `requirements.md` with the sections Goal, Core Features, Tech Stack, Constraints, and a new section **Out of Scope** that names what will NOT be built.
6. Do not write code. Tell the human to run `/plan` next.
