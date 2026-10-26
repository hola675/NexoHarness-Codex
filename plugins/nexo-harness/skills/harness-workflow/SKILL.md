---
name: harness-workflow
description: Choose a focused Codex workflow for planning, implementation, review, or verification while respecting repository rules and preserving user changes.
---

# NexoHarness workflow

Use this skill when the user asks to plan or carry out software work and the project does not already provide a more specific workflow.

## Before acting

1. Restate the requested outcome and scope internally; keep the user's language in the response.
2. Read the nearest `AGENTS.md` and the smallest set of relevant project files. Inspect the working tree before editing.
3. Check whether the repository already has a suitable workflow or capability. Do not add a second owner for the same job.
4. Separate known facts from assumptions. Ask only when a missing decision blocks safe progress; continue independent work meanwhile.

## Choose the smallest useful path

- For a small, clear change, make it directly and inspect the final diff.
- For a multi-file or architectural change, map the affected modules and dependencies, then work in reviewable slices.
- Delegate only independent work with a specific deliverable and file ownership. The coordinator integrates and verifies the result.
- Prefer local capabilities and narrow tool output. Use an external service only when the task needs it and the user has authorized its use.
- Use `context-budget` for long tasks or excessive tool output; retrieve raw detail when a filtered result could hide a decision-critical fact.
- The project contains Codex custom agent profiles for exploration, review, and focused implementation. Delegate only independent work, assign separate file ownership, and synthesize the evidence. The project caps concurrent agent threads at two.

## Implementation and handoff

- Preserve unrelated user edits. Never overwrite or clean up work that is not part of the task.
- Follow repository commands and verification gates. Do not claim a check passed unless it was actually run and its output was read.
- Keep provenance, license, permissions, dependencies, and destination recorded for any third-party component added to the project.
- Keep credentials and private account state out of source files and generated artifacts.
- Summarize what changed, what evidence supports it, and what remains blocked or requires an in-app/manual action.

## Authority limits

- A discovered tool or connector does not grant permission to use it.
- Do not send messages, publish, connect accounts, change global Codex settings, or promote automated proposals without explicit authorization.
- Do not allow an observer or generated agent proposal to approve or install its own changes.
