---
name: repo-harness-assessment
description: Assess whether a repository gives Codex clear instructions, safe edit boundaries, useful validation, and reviewable evidence; recommend the smallest useful harness improvement.
---

# Repo Harness Assessment

> Adapted from `yfge/agent-harness-skills` version 0.2.0, `repo-harness-assessment`, commit `cbc6910e76cbc349bda44711f220265b62d60181`, under MIT. See `vendor/agent-harness-skills/LICENSE`.

## Purpose

Assess how well Codex can find a repository's rules, make safe changes, verify them, and leave reviewable evidence. This skill owns the first assessment and the Codex `AGENTS.md` entrypoint decision. It does not create configuration for other agent clients.

## Use when

- The user asks whether a repository is ready for Codex work or what harness pieces are missing.
- The user asks to create, shorten, reconcile, or diagnose Codex `AGENTS.md` instructions.
- You need to compare repository instructions, validation commands, runtime evidence, work state, or delivery records.
- You need to choose the smallest useful next improvement: an entrypoint, validation command, artifact, contract check, or quality gate.

## Inputs

- Repository root.
- User scope: whole repository, one module, documentation, runtime behavior, CI, or delivery flow.
- Expected harness shape or maturity target, if the user supplied one.
- Existing Codex instruction files and whether any are subtree overrides, generated mirrors, or pointers.

## Assessment sequence

1. Read the root `AGENTS.md`, README, architecture documents, validation commands, CI, and work-state files relevant to the requested scope.
2. Map the existing files to entrypoint, work state, delivery evidence, contracts, validation, runtime evidence, and quality roles before proposing new files.
3. Identify the canonical Codex entrypoint. Classify other Codex-facing instruction files as subtree overrides, generated mirrors, symlinks, or short pointers.
4. Check whether a validation command connects failures to useful evidence such as logs, reports, traces, screenshots, or review records.
5. If a required role is missing, use `references/build-when-missing.md` to choose the minimum artifact. Do not scaffold optional roles by default.
6. Recommend no more than three next steps, ordered by value and risk.

## Checks

- **Entrypoint:** Codex can find the first-read documents, edit boundaries, and minimum validation command quickly.
- **Consistency:** instruction precedence is clear and mirrors cannot silently drift.
- **Structure:** the repository has a clear source of truth, directory ownership, and a way to detect new drift.
- **Validation:** there is a useful local check and, when appropriate, a CI gate.
- **Evidence:** a failure can be connected to logs, traces, reports, or runtime artifacts.
- **Scope:** recommend a small slice before proposing a broad platform or optional infrastructure.

## Output format

```markdown
# Codex Repository Harness Assessment

## Current Mapping
- entrypoint:
- subtree instructions / mirrors:
- work state:
- delivery evidence:
- contracts:
- validation:
- runtime evidence:
- quality:

## Entrypoint Decision
- canonical file:
- navigation changes:
- drift prevention:

## Gaps
1.
2.
3.

## Smallest Useful Slice
- first:
- then:
- finally:

## Defer
-

## Validation Needed
-
```

## Common mistakes

- Treating the presence of tests as proof of harness quality.
- Reading only the README while ignoring scripts, CI, and existing artifacts.
- Copying the same rules into several independent instruction files.
- Turning the root entrypoint into an encyclopedia.
- Copying private URLs, credentials, account names, or machine-specific settings.
- Producing a wish list instead of a small implementable next step.

## References

- Read `references/entrypoint-policy.md` when deciding which Codex instruction file is canonical or how mirrors should work.
- Read `references/build-when-missing.md` when a required harness role has no existing artifact.
- Read `references/harness-profiles.json` for lightweight repository archetypes and their minimum roles.
