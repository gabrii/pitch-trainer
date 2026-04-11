---
name: new-plan
description: Create a new implementation plan. Explores the codebase, designs an approach, and saves a structured plan to plans/. Use when the user wants to plan a new feature, refactor, or change.
argument-hint: "<plan-filename> <description>"
allowed-tools: Read Grep Glob
effort: high
---

# New Plan

You are creating a new plan. The plan will be saved in the `plans/` directory as a markdown file with YAML frontmatter.

**Plan filename**: `plans/$0.md`
**Description from user**: $ARGUMENTS

If `plans/$0.md` already exists, read it and ask the user if they want to overwrite or pick a different name.

## Existing plans for reference

!`python3 ${CLAUDE_SKILL_DIR}/../plans/list_plans.py`

## Step 1: Create the plan file immediately

Create `plans/$0.md` right away with status BACKLOG so it shows up in the plan list:

```yaml
---
name: <a short human-readable title derived from the description>
status: BACKLOG
description: <one sentence description>
---

# <Title>

## Context
<why this change is being made — to be filled in>

## Approach
<to be filled in>

## Files to modify
<to be filled in>

## Tasks
- [ ] <to be filled in>

## Verification
<to be filled in>
```

## Step 2: Explore the codebase

Goal: Understand the user's request and the relevant code.

1. Focus on understanding the request and finding existing patterns to reuse.
2. Launch up to 3 Explore agents IN PARALLEL to research the codebase efficiently.
   - Use 1 agent for isolated/focused tasks.
   - Use multiple agents when scope is uncertain or multiple areas are involved.
3. Ask the user clarifying questions with AskUserQuestion if anything is ambiguous.

## Step 3: Design the approach

Launch Plan agent(s) to design the implementation. Provide them with:
- Context from Step 2 exploration (filenames, code paths)
- Requirements and constraints
- Request a detailed implementation plan

## Step 4: Write the final plan

Update `plans/$0.md` with the complete plan. The file must include:

- **Context**: why this change is being made, what prompted it, intended outcome
- **Approach**: your recommended approach (not all alternatives)
- **Files to modify**: paths of critical files
- **Reuse**: existing functions/utilities to reuse, with file paths
- **Tasks**: a checklist of implementation steps as `- [ ] task description`
- **Verification**: how to test the changes end-to-end

Keep it concise enough to scan quickly, but detailed enough to execute.

## Step 5: Present to user

Tell the user:
- The plan is saved at `plans/$0.md` with status BACKLOG
- Summarize the key points
- They can use `/plans` to manage it (move to TODO, DOING, etc.)
