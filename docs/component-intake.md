# Candidate component intake

Use `catalog/candidate-template.json` to record a skill, plugin, agent role, MCP server, or local utility before considering it for the runtime package.

```powershell
node .\tools\check-candidate.mjs .\catalog\candidate-template.json
node .\tools\check-candidate.mjs .\catalog\candidate-template.json --json
```

The checker reads one JSON file (up to 1 MiB) and writes its report to standard output. It performs no network access, source checkout, installer invocation, package installation, or file modification. The template intentionally reports blockers until its unknown values are replaced with verified evidence.

The highest possible result is `READY_FOR_HUMAN_REVIEW`. It is not an approval or an instruction to install. The reviewer still decides whether the source is trustworthy, whether the license permits the intended use, whether the capability duplicates Codex or another included component, and whether its runtime and permissions fit the project.

Record service-account requirements and network purposes explicitly. Account-backed services stay optional and require separate free-tier and terms checks. Do not place credentials or private project data in candidate records. Never run an unreviewed installer to inspect a source.
