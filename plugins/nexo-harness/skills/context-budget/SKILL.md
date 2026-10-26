---
name: context-budget
description: Keep Codex context focused with progressive reads, bounded tool output, and selective delegation while preserving decision-critical information.
---

# Context Budget

Use this skill for long repository tasks, broad research, large logs, or work where context volume is becoming a constraint.

## Workflow

1. Start from the user request, the nearest `AGENTS.md`, and the smallest relevant source files.
2. Search first, then read narrow ranges around matching symbols or configuration. Expand only when those references require it.
3. Request bounded output from tools: relevant fields, limited rows, changed lines, or a short summary plus a way to retrieve the raw detail.
4. Keep raw evidence available when a filtered view could hide an error, a security condition, or a value that changes the decision.
5. Load a skill or reference only when its task applies. Do not include multiple skills that own the same procedure.
6. Delegate only independent work. Give each agent a separate question, file boundary, and concise output contract; compare the coordination and synthesis cost against doing the work sequentially.
7. Summarize discoveries as facts with source paths, and retain unresolved questions explicitly.

## Fidelity rules

- Never omit error lines, failed assertions, relevant diff context, security findings, or contradictory evidence to make output shorter.
- Preserve exact identifiers, versions, paths, and values that will be used in implementation.
- When truncating, state what was omitted and how to retrieve the full output.
- Treat byte counts or estimates as context-volume indicators, not billed token counts.
- Accept a reduction only when the same task can still be completed with the needed evidence and quality.
