---
description: Append a dated entry to docs/ai-workflow-log.md recording prompts, decisions, and bugs caught
---
1. If `docs/ai-workflow-log.md` does not exist, create it with the title `# AI Workflow Log` and a one-paragraph description of the workflow used.
// turbo
2. Run `git log -1 --pretty=format:"%h %s"` to get the latest commit.
3. Append an entry with these fields, kept short and factual:
   - **Date and slice** (for example `2026-10-02 - Slice 03: Toggle complete`)
   - **Commit** (hash and subject)
   - **Key prompt or instruction** given to the agent, quoted or summarized in one or two lines
   - **Human decision or correction** (what the human changed in the plan, contract, or code)
   - **Bug or issue caught** and how it was found (review, test, or debug), or `none`
   - **Rule or prompt improvement** learned, and whether `.agents/rules/nextjs-todo.md` was updated
4. If a new rule was learned, propose the exact line to add to `.agents/rules/nextjs-todo.md` and ask the human to approve it. Do not edit the rules file on your own.
