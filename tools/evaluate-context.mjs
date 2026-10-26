import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const positional = args.filter((arg) => arg !== "--json");

function usage() {
  console.error("Usage: node tools/evaluate-context.mjs <baseline.txt> <candidate.txt> <required-facts.txt> [--json]");
  console.error("Required facts: one exact, decision-critical text fragment per non-empty line.");
}

function readInput(filePath, label) {
  const resolved = path.resolve(filePath);
  let stat;
  try {
    stat = statSync(resolved);
  } catch (error) {
    throw new Error(`${label}: cannot access ${resolved} (${error.message})`);
  }
  if (!stat.isFile()) throw new Error(`${label}: expected a regular file (${resolved})`);
  if (stat.size > MAX_INPUT_BYTES) throw new Error(`${label}: input exceeds ${MAX_INPUT_BYTES} bytes`);
  return { path: resolved, text: readFileSync(resolved, "utf8"), bytes: stat.size };
}

if (positional.length !== 3) {
  usage();
  process.exit(2);
}

try {
  const [baselinePath, candidatePath, factsPath] = positional;
  const baseline = readInput(baselinePath, "baseline");
  const candidate = readInput(candidatePath, "candidate");
  const requiredFacts = readInput(factsPath, "required facts").text
    .split(/\r?\n/)
    .map((fact) => fact.trim())
    .filter(Boolean);

  if (requiredFacts.length === 0) throw new Error("required facts file must contain at least one non-empty line");

  const missingFromBaseline = requiredFacts.filter((fact) => !baseline.text.includes(fact));
  const missingFromCandidate = requiredFacts.filter((fact) => !candidate.text.includes(fact));
  const byteDelta = baseline.bytes - candidate.bytes;
  const byteReductionPercent = baseline.bytes === 0 ? null : (byteDelta / baseline.bytes) * 100;
  const result = {
    status: missingFromCandidate.length === 0 ? "PASS" : "FAIL",
    metric: "literal-evidence-preservation",
    baseline: { path: baseline.path, bytes: baseline.bytes, lines: baseline.text.split(/\r?\n/).length },
    candidate: { path: candidate.path, bytes: candidate.bytes, lines: candidate.text.split(/\r?\n/).length },
    byteDelta,
    byteReductionPercent: byteReductionPercent === null ? null : Number(byteReductionPercent.toFixed(2)),
    requiredFactCount: requiredFacts.length,
    missingFromBaseline,
    missingFromCandidate,
    limitation: "Literal check only: a passing result does not prove semantic fidelity, task quality, or billed-token savings.",
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${result.status} ${result.metric}`);
    console.log(`Bytes: ${baseline.bytes} -> ${candidate.bytes} (${byteDelta >= 0 ? "-" : "+"}${Math.abs(byteDelta)}; ${result.byteReductionPercent ?? "n/a"}% change)`);
    console.log(`Lines: ${result.baseline.lines} -> ${result.candidate.lines}`);
    console.log(`Required facts: ${requiredFacts.length - missingFromCandidate.length}/${requiredFacts.length} preserved literally`);
    if (missingFromBaseline.length) console.log(`Invalid baseline: ${missingFromBaseline.length} required fact(s) absent`);
    if (missingFromCandidate.length) console.log(`Candidate omissions:\n- ${missingFromCandidate.join("\n- ")}`);
    console.log(result.limitation);
  }

  if (missingFromBaseline.length > 0 || missingFromCandidate.length > 0) process.exitCode = 1;
} catch (error) {
  console.error(`Context evaluation failed: ${error.message}`);
  process.exitCode = 1;
}
