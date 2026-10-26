# Codex Desktop compatibility check

**Status:** local marketplace discovery and plugin installation are confirmed with Codex CLI; Codex Desktop UI discovery and skill invocation remain pending.
**Target:** Codex desktop app on Windows.
**Checked against official documentation:** 2026-10-26.

## Package layout

- Repo marketplace: `.agents/plugins/marketplace.json`
- Portable plugin manifest: `plugins/nexo-harness/plugin.json`
- Skill: `plugins/nexo-harness/skills/harness-workflow/SKILL.md`
- Marketplace source: `./plugins/nexo-harness`, relative to the repository root.

The current OpenAI plugin documentation describes repo marketplaces at `.agents/plugins/marketplace.json`, portable `plugin.json` manifests, skills under `skills/<name>/SKILL.md`, and plugin copies installed under the local Codex plugin cache. The editable source remains this repository.

## Manual app check

1. Open this repository in Codex Desktop and mark it trusted if Codex asks.
2. Open the Plugins Directory and select the `NexoHarness Codex (local)` marketplace.
3. Install `NexoHarness` and restart/refresh the app if it requests it.
4. Start a new conversation in this repository and invoke the `harness-workflow` skill for a small planning request.
5. Confirm the skill is discovered and its workflow is followed. Do not use sensitive project content for this first check.
6. Record the app version, visible marketplace/plugin names, and result below. Do not copy cache files back into the source repo.

## Evidence log

### Codex CLI isolated install

On 2026-10-26, Codex CLI `0.164.0-alpha.11.1` added this repository as a local marketplace, listed `nexo-harness` as available, installed it, and listed it as installed/enabled. The isolated cache contained 8 package files (the plugin manifest, three skills with references, and the MIT license); all 8 SHA-256 hashes matched their source files. The command used a temporary `CODEX_HOME`, so the normal Codex profile and cache were not changed. Codex printed a warning that it would not create PATH aliases under the temporary directory; marketplace discovery and plugin installation still returned success.

This verifies the CLI marketplace and package installation path. It does not confirm what the desktop Plugins Directory displays or skill invocation behavior in a desktop conversation.

The temporary verification profile is retained outside the repository. It contains only the isolated Codex marketplace configuration and local plugin cache and was not used for account authentication.

### Repository catalog, doctor, and profile validation

On 2026-10-26, `node tools/validate-catalog.mjs`, `node tools/doctor.mjs`, and `node tools/doctor.mjs --json` passed with Node `v26.12.1`. The doctor reports 3 packaged skills, 3 project roles, concurrency cap 2, and Codex CLI `0.164.0-alpha.11.1`; it marks Desktop runtime pending. PowerShell parsed both role installer scripts without syntax errors. Profile loading and invocation in a Codex session remain unverified.

| Date | App version | Marketplace visible | Plugin installed | Skill invoked | Result |
|---|---|---|---|---|---|
| 2026-10-26 | Not recorded | Pending manual check | Pending | Pending | Static structure check passed; app behavior remains unverified |

## Official references

- [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [Desktop-only plugins](https://developers.openai.com/plugins/deploy/desktop-only)
