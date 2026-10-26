import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const MAX_INPUT_BYTES = 1024 * 1024;
const jsonOutput = process.argv.includes("--json");
const inputArgs = process.argv.slice(2).filter((arg) => arg !== "--json");

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasUnknown(value) {
  if (typeof value === "string") return /^(unknown|tbd|pending|n\/a\?)$/i.test(value.trim());
  if (Array.isArray(value)) return value.some(hasUnknown);
  if (value && typeof value === "object") return Object.values(value).some(hasUnknown);
  return false;
}

function run() {
  if (inputArgs.length !== 1) {
    console.error("Usage: node tools/check-candidate.mjs <candidate.json> [--json]");
    process.exitCode = 2;
    return;
  }

  const inputPath = path.resolve(inputArgs[0]);
  let candidate;
  try {
    const stat = statSync(inputPath);
    if (!stat.isFile()) throw new Error("expected a regular file");
    if (stat.size > MAX_INPUT_BYTES) throw new Error(`input exceeds ${MAX_INPUT_BYTES} bytes`);
    candidate = JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (error) {
    console.error(`Candidate check failed: ${inputPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const errors = [];
  const blockers = [];
  const requiredText = [
    ["id", candidate.id],
    ["name", candidate.name],
    ["source.repository", candidate.source?.repository],
    ["source.version", candidate.source?.version],
    ["source.license", candidate.source?.license],
    ["source.licenseUrlOrFile", candidate.source?.licenseUrlOrFile],
    ["platform.codexWindows", candidate.platform?.codexWindows],
    ["overlap.existingCapabilities", candidate.overlap?.existingCapabilities],
    ["overlap.assessment", candidate.overlap?.assessment],
    ["decision.state", candidate.decision?.state],
    ["decision.rationale", candidate.decision?.rationale],
  ];
  for (const [field, value] of requiredText) {
    if (!isText(value)) errors.push(`${field} must be a non-empty string`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.id ?? "")) errors.push("id must be kebab-case");
  if (candidate.source?.commit !== null && !isText(candidate.source?.commit)) {
    errors.push("source.commit must be a commit string or null");
  }
  if (typeof candidate.source?.licenseReviewed !== "boolean") errors.push("source.licenseReviewed must be boolean");
  if (candidate.source?.licenseReviewed === false) blockers.push("license has not been reviewed");
  if (!Array.isArray(candidate.runtime?.dependencies)) errors.push("runtime.dependencies must be an array");
  if (!Array.isArray(candidate.runtime?.permissions) || candidate.runtime.permissions.length === 0) {
    errors.push("runtime.permissions must be a non-empty array; use ['none'] when no permissions are needed");
  }
  if (typeof candidate.runtime?.networkAccess !== "boolean") errors.push("runtime.networkAccess must be boolean");
  if (typeof candidate.runtime?.requiresAccount !== "boolean") errors.push("runtime.requiresAccount must be boolean");
  if (typeof candidate.platform?.windowsTested !== "boolean") errors.push("platform.windowsTested must be boolean");
  if (!Array.isArray(candidate.evidence?.filesInspected)) errors.push("evidence.filesInspected must be an array");
  if (candidate.evidence?.installersExecuted !== false) {
    blockers.push("candidate intake requires installersExecuted: false; do not execute an unreviewed installer");
  }

  if (candidate.decision?.state !== "pending_review") {
    errors.push("candidate intake decision.state must remain pending_review; record final decisions in the reviewed catalog");
  }

  if (hasUnknown(candidate)) blockers.push("one or more fields still contain an unknown/TBD marker");
  if (candidate.runtime?.requiresAccount === true) blockers.push("requires an account; keep it optional and verify free-tier/service terms");
  if (candidate.runtime?.networkAccess === true && !isText(candidate.runtime?.networkPurpose)) {
    blockers.push("network access is declared without a documented purpose");
  }
  if (candidate.platform?.windowsTested === false) blockers.push("Windows compatibility has not been verified");
  if (Array.isArray(candidate.evidence?.filesInspected) && candidate.evidence.filesInspected.length === 0) {
    blockers.push("no source files or authoritative documentation have been inspected");
  }

  const readyForReview = errors.length === 0 && blockers.length === 0;
  const result = {
    status: errors.length ? "INVALID" : readyForReview ? "READY_FOR_HUMAN_REVIEW" : "BLOCKED",
    id: candidate.id ?? null,
    errors,
    blockers,
    approval: "This tool never approves, installs, or executes a component. A human must review the evidence and record the decision.",
  };

  if (jsonOutput) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`${result.status}${result.id ? ` ${result.id}` : ""}`);
    for (const error of errors) console.log(`ERROR: ${error}`);
    for (const blocker of blockers) console.log(`BLOCKER: ${blocker}`);
    console.log(result.approval);
  }

  if (errors.length > 0 || blockers.length > 0) process.exitCode = 1;
}

run();
