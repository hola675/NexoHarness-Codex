# Codex Entrypoint Policy

Use this when a repository has multiple Codex instruction surfaces or needs its first `AGENTS.md`.

## Canonical surface

- Choose one root `AGENTS.md` as the primary Codex entrypoint.
- Keep it to scope, source-of-truth links, hard boundaries, minimum validation, and relevant skill routing.
- Put stricter local rules in nested `AGENTS.md` files only where a subtree needs them.
- Treat filename casing as part of the contract; do not create case-only variants.

## Mirrors and pointers

- Prefer a short pointer when a Codex-supported surface can follow the canonical file.
- Avoid symlinks for portability across Windows workspaces.
- Generated mirrors must name their source and generation command.
- Exact-copy mirrors need a byte-for-byte drift check.

## Validation

- List each Codex-facing instruction file and classify it as canonical, subtree override, symlink, generated mirror, or pointer.
- Confirm Codex can find first-read docs, edit boundaries, and minimum validation quickly.
- Run a mirror check when one exists; otherwise compare targets manually.

## Keep out

- Independent copies of the same rules.
- Product secrets, credentials, private hosts, or local machine assumptions.
- Long architecture, release, or operational procedures that belong in linked source-of-truth documents.
