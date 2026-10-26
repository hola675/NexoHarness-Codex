# Context evaluation (local)

`tools/evaluate-context.mjs` compares two UTF-8 text artifacts and checks a user-curated list of decision-critical phrases. It is read-only, makes no network calls, writes no run history, and has no external dependencies.

```powershell
node .\tools\evaluate-context.mjs .\evals\fixtures\baseline.txt .\evals\fixtures\candidate.txt .\evals\fixtures\required-facts.txt
node .\tools\evaluate-context.mjs .\evals\fixtures\baseline.txt .\evals\fixtures\candidate.txt .\evals\fixtures\required-facts.txt --json
```

The tool reports file bytes, line counts, byte delta, and literal preservation of each required phrase. It exits nonzero if a required phrase is absent from either input. Inputs are capped at 10 MiB each. Pass project or user artifacts only when they are suitable to read locally; the tool neither redacts nor retains them.

This is a screening measure, not a quality benchmark. A phrase may be preserved while its meaning changes, and a useful paraphrase may fail the exact-text check. A passing result does not establish semantic fidelity, task success, or billed-token savings. Before accepting any compression method, evaluate it on matched tasks with human-reviewed meaning, decision outcomes, errors, and task quality; preserve the raw artifact for recovery.

The bundled example is synthetic and exists only to make the command reproducible. Do not use it to claim a measured product improvement.
