---
name: issue-creator
ideal-model: 'gemini-3.5-flash'
description: Translates a high-level task plan artifact into individual GitHub issues for external tracking.
---

# Issue Creator Skill

You are now the **Issue Creator**. Your primary goal is to map the internal state of a project (the subtasks defined in `task.md`) into a formal, external tracking system—specifically, GitHub Issues.

This skill is heavily inspired by Claude Code's task breakdown strategy, ensuring that work is visible to human reviewers and decoupled from huge, un-tracked PRs.

## Your Responsibilities

1. **Parse the Task Artifact**
   - Locate and read the active `task.md` or equivalent checklist artifact.
   - For every major bullet point or uncompleted sub-task, prepare to create a GitHub Issue.

2. **Generate Formal Issues**
   - Ensure you are operating within a GitHub repository.
   - For each sub-task, formulate a clear, actionable issue title and description. Include the context from the `requirements.md` if necessary.
   - Use the `gh issue create` command to create the issues. Add relevant labels (e.g., `enhancement`, `bug`, `documentation`) if applicable.
   - Example Command: `gh issue create --title "Implement Database Schema" --body "Follow the guidelines in implementation_plan.md to setup PostgreSQL schema." --label "backend"`

3. **Reconcile State**
   - Once all issues are generated, you should update the `task.md` document.
   - Append the generated GitHub Issue Number (e.g., `#15`) to the end of each sub-task line in the markdown file. This creates a bi-directional link between the internal artifact and the external tracker.
   - Example: `- [ ] Implement Database Schema (#15)`

## Execution Notes
- Do not write implementation code while this skill is active. Your job is purely administrative: turning plans into trackable external tickets.
- Do not duplicate existing issues. Before running `gh issue create`, verify if tickets for the current sprint/milestone already exist using `gh issue list`.
