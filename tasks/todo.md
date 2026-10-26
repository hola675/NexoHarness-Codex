# Implementation task list

Plan approval and implementation were authorized by the user on 2026-10-26. The CLI-verified local package and first-party install tooling are implemented. Desktop installation/invocation remains a user-visible manual checkpoint.

## Slice 1 — Local marketplace and skill package

- [x] Create repo-local marketplace referencing the in-repo plugin.
  - Acceptance: marketplace uses a `./` path inside this repository and required local policy metadata.
  - Verify: inspect the JSON and resolve the source path from the repository root.
  - Files: `.agents/plugins/marketplace.json`
- [x] Create the portable plugin manifest and one original workflow skill.
  - Acceptance: package follows current documented root manifest and `skills/<name>/SKILL.md` layout; no third-party files or credentials.
  - Verify: inspect manifest fields, skill frontmatter and package paths.
  - Files: `plugins/nexo-harness/plugin.json`, `plugins/nexo-harness/skills/harness-workflow/SKILL.md`
- [x] Document the Codex Desktop compatibility procedure and current evidence.
  - Acceptance: documentation distinguishes prepared files from behavior confirmed in the app.
  - Verify: steps match the official local marketplace workflow; evidence row remains pending until the app check.
  - Files: `docs/codex-desktop-compatibility.md`, `README.md`

## Next slices

- [x] Record the environment baseline and initial import decisions without copying third-party packages.
  - Acceptance: existing suites/connectors and research candidates are distinguished from plugin contents; unresolved license/version questions are explicit.
  - Verify: review the source inventory against the Codex capability list and global harness README.
  - Files: `catalog/source-inventory.md`
- [x] Add a local component record and deterministic catalog validator.
  - Acceptance: included component has provenance, license state, dependencies, permissions, destination, and evidence; validator checks for missing metadata, duplicate IDs, path traversal, external links, and broken skill names.
  - Verify: run `node tools/validate-catalog.mjs`.
  - Files: `catalog/components.json`, `tools/validate-catalog.mjs`
- [x] Adapt and package one reviewed third-party Codex skill with its license and support files.
  - Acceptance: pinned source/version, MIT notice, Codex-only adaptation, complete local references, no external runtime dependency.
  - Verify: `node tools/validate-catalog.mjs`; isolated Codex CLI installation and SHA-256 comparison of all plugin files.
  - Files: `plugins/nexo-harness/skills/repo-harness-assessment/`, `plugins/nexo-harness/vendor/agent-harness-skills/LICENSE`, `catalog/components.json`, `THIRD-PARTY-NOTICES.md`
- [x] Add project-scoped Codex roles for exploration, review, and one bounded implementation slice.
  - Acceptance: roles are separate TOML profiles with concise handoff contracts; this repository caps concurrency at two.
  - Verify: PowerShell AST parse succeeded; catalog checks required TOML fields and concurrency setting.
  - Files: `.codex/agents/`, `.codex/config.toml`, `docs/architecture.md`, `catalog/components.json`
- [x] Add target-project installer and remover for Codex agent profiles.
  - Acceptance: requires an existing explicit target; refuses global profiles, symlinks, and conflicts; preserves existing configs and edited profile files; supports `-WhatIf`.
  - Verify: PowerShell parser and `-WhatIf` runs completed; no target files were created.
  - Files: `tools/install-codex-agents.ps1`, `tools/remove-codex-agents.ps1`, `docs/installing.md`
- [x] Add a read-only local doctor for catalog, marketplace, skills, project roles, and Codex CLI availability.
  - Acceptance: no network calls, no credential reads, concise text/JSON output, desktop behavior remains explicitly unconfirmed.
  - Verify: run `node tools/doctor.mjs` and `node tools/doctor.mjs --json`.
  - Files: `tools/doctor.mjs`, `README.md`, `tasks/plan.md`
- [x] Add the first context-evaluation tool and synthetic fixture; treat it as a literal-preservation screen, not a semantic fidelity or token-savings benchmark.
  - Acceptance: read-only local CLI compares bytes/lines and user-supplied required facts, caps inputs, and reports limitations; no telemetry or network.
  - Verify: run against included synthetic fixture and a negative omission fixture; catalog validation passes.
  - Files: `tools/evaluate-context.mjs`, `evals/fixtures/`, `docs/context-evaluations.md`, `catalog/components.json`
- [x] Add a component-intake record and completeness checker that never installs or approves its input.
  - Acceptance: requires provenance, license, platform, overlap, dependencies, permissions, network/account flags, and inspected evidence; unknowns block readiness; maximum result is ready for human review.
  - Verify: run the synthetic complete fixture and the intentionally incomplete template; catalog validation passes.
  - Files: `tools/check-candidate.mjs`, `catalog/candidate-template.json`, `docs/component-intake.md`, `catalog/components.json`
- [x] Add a plugin-only ZIP packager with path, file-list, CRC, and source-byte verification.
  - Acceptance: deterministic path ordering/metadata, safe output overwrite behavior, no credentials or project agent profiles included, standard library only.
  - Verify: package twice to separate paths, compare internal hashes, inspect ZIP listing and integrity, catalog validation passes.
  - Files: `tools/package_plugin.py`, `docs/packaging.md`, `catalog/components.json`
- [x] Add a structured inventory for host-managed MCP providers without copying their configs or credentials, including explicit pricing and inclusion guards.
  - Acceptance: record observed capabilities and unknown license/version/cost explicitly; doctor validates local metadata only and makes no availability claim for Desktop.
  - Verify: provider validator and doctor pass; negative fixture confirms an included provider with unknown pricing is rejected.
  - Files: `catalog/providers.json`, `tools/validate-providers.mjs`, `tools/doctor.mjs`, `docs/provider-registry.md`
- [ ] Confirm Codex Desktop loads and can use the project-scoped roles in a new project session.
  - Acceptance: the app/session lists the three Nexo roles and an invocation routes to the selected instructions.
  - Verify: inspect a new session started in a trusted project; record app/version evidence.
  - Files: `docs/architecture.md`, `docs/codex-desktop-compatibility.md`
- [x] Add a first-party context-budget skill that preserves decision-critical evidence while reducing broad reads and output.
  - Acceptance: skill is available in the local plugin with no external dependency and has a catalog record.
  - Verify: catalog validation and isolated plugin install with source/cache hashes. Desktop invocation remains pending.
  - Files: `plugins/nexo-harness/skills/context-budget/SKILL.md`, `catalog/components.json`
- [ ] Complete the manual Codex Desktop marketplace/install/skill and role invocation checkpoint; update evidence with observed app version and result.
- [ ] Resolve repository license and attribution format before adding third-party code.
- [ ] Receive and inspect the user's MultiAgent Workforce and TAC Ops Server documents/repositories before selecting a workforce adapter.
- [ ] Add MCP/provider records only after a concrete capability gap, license, permissions, startup model, and packaging are reviewed.
- [ ] Establish baseline and fidelity criteria before adding any context compression.
- [ ] Design local Observer retention and deletion behavior before collecting real run data.
