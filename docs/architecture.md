# Architecture and runtime boundaries

NexoHarness has one canonical source tree and several Codex-facing surfaces. They remain separate because Codex loads each through a different mechanism.

| Surface | Source in this repo | Codex mechanism | Status |
|---|---|---|---|
| Skills and references | `plugins/nexo-harness/skills/` | Repo-local plugin marketplace and plugin cache | CLI discovery/install verified; Desktop invocation pending |
| Custom agent roles | `.codex/agents/*.toml` | Project-scoped Codex agent definitions | Files authored; app/session discovery pending |
| Agent concurrency | `.codex/config.toml` | Trusted project configuration | Caps concurrent subagent threads at 2 for this repo |
| Third-party provenance | `catalog/components.json`, `THIRD-PARTY-NOTICES.md` | Local audit and validation tools | Initial catalog in use |
| MCP providers | Not configured yet | Plugin `mcp.json` or project Codex MCP configuration | Add after a concrete gap and permission review |

## Agent roles

- **`nexo-scout`** explores one bounded scope and returns paths, symbols, evidence, and open questions without edits.
- **`nexo-reviewer`** reviews a diff independently and returns only concrete risks with file and line references.
- **`nexo-worker`** implements one assigned slice within coordinator-set file boundaries and returns verification evidence.

These are project-scoped custom Codex agents, separate from plugin skills. The plugin marketplace does not install files under `.codex/agents/` into other projects. A later installer must copy selected role files into a target project only when the user requests that installation; no global agent files are modified here.

The roles inherit the parent session's permissions, provider, and MCP servers. Their instructions define work scope but do not replace Codex sandboxing or user authorization. Delegation is for independent tasks only; every additional agent can increase token use, so the project limit is two concurrent agent threads.

The profile layout and inheritance behavior follow the [Codex subagents guide](https://developers.openai.com/codex/agent-configuration/subagents). The guide notes that parallel agent workflows use more tokens than comparable single-agent runs.

## Dependency boundaries

- The plugin uses only the local skills and support files packaged in this repository.
- The adapted `repo-harness-assessment` skill includes its MIT license and required references.
- No runtime MCP or external API is required by the current package.
- Local marketplace and agent source files do not read the old NexoHarness checkout, the global skills library, or downloaded research repos at runtime.
