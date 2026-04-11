---
name: plans
description: List all plans and manage their status. Use when the user wants to see plans, move plans between statuses (BACKLOG/TODO/DOING/DONE), or start working on a plan.
allowed-tools: Read Grep Glob
effort: high
---

# Plans

You are the plan manager. Your job is to list plans and help the user manage their status.

## Current Plans

!`python3 ${CLAUDE_SKILL_DIR}/list_plans.py`

## What you can do

Based on what the user asks, you can:

### List plans
Just show the embedded list above. Summarize briefly.

### Move a plan to a new status
The user may say things like "move X to TODO", "start working on X", "X is done", etc.

**Status transitions and what to do:**

1. **→ BACKLOG**: Edit the plan file's frontmatter `status: BACKLOG`. No tasks needed.

2. **→ TODO**: Edit the plan file's frontmatter `status: TODO`. Create ONE task for the plan itself using TaskCreate with the plan's `name` as subject and its `description` as description.

3. **→ DOING**: 
   - First, read the full plan file to find the task checklist.
   - Edit the plan file's frontmatter `status: DOING`.
   - Find the parent task (created when it moved to TODO). Mark it as `in_progress` with TaskUpdate.
   - For each unchecked checkbox (`- [ ] ...`) in the plan's Tasks section, create a subtask with TaskCreate. The description should reference the plan file path.

4. **→ DONE**:
   - Mark all tasks for this plan as `completed` with TaskUpdate.
   - Edit the plan file: set `status: DONE` in frontmatter.
   - Edit all checkboxes to `- [x]`.
   - If there were any deviations from the plan during implementation, add a `## Changes during implementation` section at the end.

### Sync tasks
When invoked, check if any TODO/DOING plans are missing their tasks and create them. This is a consistency check.

## Important rules
- When the user is working through a DOING plan, do NOT edit the checkboxes in the plan file as they complete work. Only use TaskUpdate to track progress. The plan file is only updated when the plan moves to DONE.
- Only read the full plan file when moving to DOING or when the user explicitly asks to see it. Otherwise, the frontmatter summary from the list above is sufficient.
- Plan files live in `plans/` and have this frontmatter format:
```yaml
---
name: Plan Name
status: BACKLOG
description: One sentence description.
---
```
