# Installing NexoHarness into a Codex project

Installation has two independent parts because Codex loads plugin skills and custom agents from different locations.

## Plugin skills

Add this repository as a local marketplace in Codex Desktop or the CLI, then install `nexo-harness`. The Codex CLI marketplace and cache path were verified in an isolated profile; the Desktop UI still needs a visual check. See [the compatibility record](codex-desktop-compatibility.md).

## Project-scoped agent roles

The Codex agent TOML files belong in the target project's `.codex/agents/` directory. Preview the planned change first:

```powershell
pwsh -NoProfile -File .\tools\install-codex-agents.ps1 -TargetPath D:\Proyectos\MiProyecto -WhatIf
```

Install into a project after reviewing the preview:

```powershell
pwsh -NoProfile -File .\tools\install-codex-agents.ps1 -TargetPath D:\Proyectos\MiProyecto
```

The installer requires an existing project directory, refuses global Codex agent directories and symlinked paths, and does not overwrite a different profile with the same filename. It creates a project concurrency cap of two only when the target has no `.codex/config.toml`; an existing project config is preserved.

Remove only unchanged NexoHarness role files with:

```powershell
pwsh -NoProfile -File .\tools\remove-codex-agents.ps1 -TargetPath D:\Proyectos\MiProyecto -WhatIf
pwsh -NoProfile -File .\tools\remove-codex-agents.ps1 -TargetPath D:\Proyectos\MiProyecto
```

Removal preserves edited role files, `.codex/config.toml`, and directories. Reinstall from this repository to restore removed roles.
