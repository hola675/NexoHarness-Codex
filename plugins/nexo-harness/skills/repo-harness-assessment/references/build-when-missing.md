# Build When Missing

Use this when a repository has no clear Codex harness inventory or usable `AGENTS.md` entrypoint.

## Equivalent artifacts

- Existing entrypoints, architecture docs, validation docs, trackers, delivery records, reports, or dashboards may already satisfy a harness role.
- Record the selected artifacts under `Current Mapping` before recommending new files.
- Use `harness-profiles.json` in this directory to choose a minimum role set for the repository shape.

## Minimum files

- `AGENTS.md` or an explicitly mapped Codex entrypoint.
- A validation command in README or a focused `docs/validation.md`.
- `docs/harness-assessment.md` for the first inventory only when no report already exists.
- An architecture document only when the repository needs explicit boundaries.

## Bootstrap steps

1. Choose the closest repository archetype from `harness-profiles.json`.
2. Inventory existing Codex instructions, docs, scripts, CI, artifacts, trackers, reports, and ledgers.
3. Choose one canonical Codex entrypoint and classify other instruction files with `entrypoint-policy.md`.
4. Classify each relevant role as present, partial, absent, or intentionally omitted: entrypoint, work state, delivery evidence, contracts, validation, runtime evidence, and quality.
5. For absent roles required by the archetype, name the smallest artifact that makes the role discoverable.
6. Write `docs/harness-assessment.md` only if the repository has no equivalent report. Include the mapping, gaps, and no more than three next slices.
7. Link the assessment from the canonical entrypoint or README.

## Validation

- Run an existing docs or structure check when the user requested verification or the project workflow requires it.
- Otherwise, confirm the assessment points to real files or explicitly marks a role absent.
- Confirm every next slice names a file, command, or directory.
- Confirm mirrors and pointers follow `entrypoint-policy.md`.

## Do not include

- Private URLs, credentials, account names, or machine-specific paths.
- A full platform roadmap before the first small slice is justified.
- Multiple independent instruction files for the same Codex rules.
- Configuration for other agent clients.
