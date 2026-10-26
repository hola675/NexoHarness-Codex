# Codex workforce roles

NexoHarness uses Codex's project-scoped custom agents. Each profile is a TOML file in `.codex/agents/`; profiles inherit the parent session's permissions, provider, and MCP servers. The parent remains responsible for scope, permissions, synthesis, and final verification.

## Roles

| Agent | Work | Handoff |
|---|---|---|
| `nexo-scout` | Read-only exploration of a bounded area | Relevant paths/symbols, evidence, and open questions |
| `nexo-reviewer` | Independent review of a named diff or files | Concrete findings with file/line and impact; no edits |
| `nexo-worker` | One implementation task with coordinator-assigned file ownership | Changed files, decisions, checks, and blockers |

## Dispatch rules

- Keep small or dependent work in one agent turn.
- Delegate only tasks that can proceed independently and have separate file ownership or read-only scopes.
- Provide each subagent a specific question, file boundary, expected result, and handoff format.
- The coordinator reconciles reports, checks returned claims against the repository, and performs final verification.
- The project caps concurrent agent threads at two. Avoid adding agents when the extra context and synthesis cost exceeds the saved work.
- If profiles are not available in a target project, use Codex's built-in agents or a direct sequential workflow. Do not assume these profiles were installed there.

## Distribution

The profiles are active for this repository when Codex trusts and opens it. Use [the project installer](installing.md) to copy them to another project's `.codex/agents/`. The installer will not write into the personal Codex profile. Profile invocation in Codex Desktop remains a manual compatibility checkpoint.

The exact `MultiAgent Workforce` and `TAC Ops Server` sources have not yet been provided. They are not runtime dependencies; compare them against these native roles once the documents arrive.

## References

- [Codex subagents and custom agents](https://developers.openai.com/codex/agent-configuration/subagents)
- [Local plugin marketplaces](https://developers.openai.com/plugins/build/plugins)
