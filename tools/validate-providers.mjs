import { lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = process.argv[2] ? path.resolve(root, process.argv[2]) : path.join(root, "catalog", "providers.json");
const inputRelative = path.relative(root, inputPath);
const secretKey = /^(token|access_token|refresh_token|client_secret|api[_-]?key|password|authorization|cookie|credential)$/i;
const forbiddenSecretValue = /(?:\bBearer\s+[A-Za-z0-9._~+/-]{12,}|\bsk-[A-Za-z0-9_-]{16,}|\bgh[pousr]_[A-Za-z0-9]{20,})/i;
const unverifiedMetadata = /\bunknown\b|\btbd\b|\bnot\s+(?:yet\s+)?(?:recorded|verified|reviewed|stated)\b|\bno\b.*\b(?:version|license|pricing|cost)\b/i;
const errors = [];

if (process.argv.length > 3 || inputRelative === ".." || inputRelative.startsWith(`..${path.sep}`) || path.isAbsolute(inputRelative)) {
  console.error("Usage: node tools/validate-providers.mjs [repo-relative-provider-file.json]");
  process.exit(2);
}

function checkNoSecrets(value, currentPath = "providers") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkNoSecrets(item, `${currentPath}[${index}]`));
  } else if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (secretKey.test(key)) errors.push(`${currentPath}.${key}: credential fields are forbidden`);
      checkNoSecrets(nested, `${currentPath}.${key}`);
    }
  } else if (typeof value === "string" && forbiddenSecretValue.test(value)) {
    errors.push(`${currentPath}: value resembles a credential and must not be stored`);
  }
}

let registry;
try {
  if (lstatSync(inputPath).isSymbolicLink()) throw new Error("symbolic link inputs are not allowed");
  registry = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (error) {
  console.error(`Provider registry invalid: ${error.message}`);
  process.exit(1);
}

if (registry.schemaVersion !== 1) errors.push("schemaVersion must be 1");
if (registry.policy?.credentialsStored !== false) errors.push("policy.credentialsStored must be false");
if (registry.policy?.unknownCapabilitiesBundled !== false) errors.push("policy.unknownCapabilitiesBundled must be false");
if (!Array.isArray(registry.providers)) errors.push("providers must be an array");
checkNoSecrets(registry);

const ids = new Set();
for (const provider of Array.isArray(registry.providers) ? registry.providers : []) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(provider.id ?? "")) errors.push("provider id must be kebab-case");
  if (ids.has(provider.id)) errors.push(`${provider.id}: duplicate provider id`);
  ids.add(provider.id);
  for (const field of ["namespace", "category", "availability", "integrationOwner", "distribution", "reviewStatus"]) {
    if (typeof provider[field] !== "string" || !provider[field].trim()) errors.push(`${provider.id}: ${field} is required`);
  }
  for (const field of ["capabilities", "permissions"]) {
    if (!Array.isArray(provider[field]) || provider[field].length === 0) errors.push(`${provider.id}: ${field} must be a non-empty array`);
  }
  if (typeof provider.networkAccess !== "boolean" && provider.networkAccess !== "unknown") {
    errors.push(`${provider.id}: networkAccess must be true, false, or unknown`);
  }
  if (typeof provider.source !== "object" || provider.source === null) {
    errors.push(`${provider.id}: source metadata is required`);
  } else {
    for (const field of ["repository", "version", "license", "pricing"]) {
      if (typeof provider.source[field] !== "string" || !provider.source[field].trim()) {
        errors.push(`${provider.id}: source.${field} must be recorded, using unknown when unverified`);
      }
    }
  }
  if (provider.distribution === "included" && provider.reviewStatus !== "approved") {
    errors.push(`${provider.id}: only reviewed providers may be marked included`);
  }
  if (provider.distribution === "included") {
    for (const field of ["version", "license", "pricing"]) {
      if (unverifiedMetadata.test(provider.source?.[field] ?? "")) {
        errors.push(`${provider.id}: cannot be included while source.${field} is unverified`);
      }
    }
    if (provider.source?.pricing !== "free") errors.push(`${provider.id}: included providers must have verified free service pricing`);
    if (provider.networkAccess === "unknown") errors.push(`${provider.id}: network behavior must be reviewed before inclusion`);
    if (typeof provider.accountRequirement !== "boolean") errors.push(`${provider.id}: account requirement must be verified before inclusion`);
    if (!provider.authentication) errors.push(`${provider.id}: authentication mode must be recorded before inclusion`);
    if (!provider.dataSent) errors.push(`${provider.id}: outbound data must be described before inclusion`);
    if (provider.reviewStatus !== "approved") errors.push(`${provider.id}: human review is required before inclusion`);
  }
  if (provider.availability === "observed-in-current-session" && provider.integrationOwner !== "host-managed") {
    errors.push(`${provider.id}: session observations must remain marked host-managed`);
  }
}

if (errors.length) {
  console.error(`Provider registry invalid (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const observed = registry.providers.filter((provider) => provider.availability === "observed-in-current-session").length;
const candidates = registry.providers.filter((provider) => provider.availability !== "observed-in-current-session").length;
const bundled = registry.providers.filter((provider) => provider.distribution === "included").length;
const pending = registry.providers.filter((provider) => provider.reviewStatus !== "approved");
console.log(`Provider registry valid: ${observed} session-observed, ${candidates} candidate(s), ${bundled} included`);
for (const provider of pending) {
  const reasons = provider.decisionBlockers?.join("; ") ?? "review pending";
  console.log(`Pending ${provider.id}: ${reasons}`);
}
