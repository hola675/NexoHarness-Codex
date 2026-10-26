import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const jsonOutput = process.argv.includes("--json");
const results = [];

function add(status, check, detail) {
  results.push({ status, check, detail });
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

const validation = spawnSync(process.execPath, [path.join(scriptDirectory, "validate-catalog.mjs")], {
  cwd: repositoryRoot,
  encoding: "utf8",
  timeout: 10_000,
  windowsHide: true,
});
if (validation.status === 0) {
  add("PASS", "catalog", validation.stdout.trim());
} else {
  add("FAIL", "catalog", (validation.stderr || validation.stdout || validation.error?.message || "validation failed").trim());
}

const providerValidation = spawnSync(process.execPath, [path.join(scriptDirectory, "validate-providers.mjs")], {
  cwd: repositoryRoot,
  encoding: "utf8",
  timeout: 10_000,
  windowsHide: true,
});
if (providerValidation.status === 0) {
  add("PASS", "provider-registry", providerValidation.stdout.trim());
} else {
  add("FAIL", "provider-registry", (providerValidation.stderr || providerValidation.stdout || providerValidation.error?.message || "provider validation failed").trim());
}

try {
  const marketplace = readJson(".agents/plugins/marketplace.json");
  const plugin = readJson("plugins/nexo-harness/plugin.json");
  const entry = marketplace.plugins?.find((candidate) => candidate.name === plugin.name);
  if (entry) {
    add("PASS", "local-marketplace", `${marketplace.name} exposes ${plugin.name}`);
  } else {
    add("FAIL", "local-marketplace", "plugin manifest is not listed in the repository marketplace");
  }
} catch (error) {
  add("FAIL", "local-marketplace", error.message);
}

try {
  const catalog = readJson("catalog/components.json");
  const skills = catalog.components.filter((component) => component.kind === "skill");
  const agents = catalog.components.filter((component) => component.kind === "agent");
  add("PASS", "packaged-capabilities", `${skills.length} skills and ${agents.length} project agents cataloged`);

  const agentConfigPath = path.join(repositoryRoot, ".codex", "config.toml");
  if (!existsSync(agentConfigPath)) {
    add("FAIL", "project-agent-settings", ".codex/config.toml is missing");
  } else {
    const agentConfig = readFileSync(agentConfigPath, "utf8");
    const concurrency = agentConfig.match(/^max_concurrent_threads_per_session\s*=\s*(\d+)\s*$/m)?.[1];
    if (concurrency) {
      add("PASS", "project-agent-settings", `project concurrency cap is ${concurrency}`);
    } else {
      add("WARN", "project-agent-settings", "no concurrency cap was found");
    }
  }
} catch (error) {
  add("FAIL", "packaged-capabilities", error.message);
}

const codexVersion = spawnSync("codex", ["--version"], {
  cwd: repositoryRoot,
  encoding: "utf8",
  timeout: 5_000,
  windowsHide: true,
});
if (!codexVersion.error && codexVersion.status === 0) {
  add("PASS", "codex-cli", codexVersion.stdout.trim());
} else {
  add("WARN", "codex-cli", "Codex CLI was not found; the desktop app may still be available");
}

add("PENDING", "desktop-runtime", "plugin and agent discovery must be confirmed in a Codex Desktop session");

const failed = results.some((result) => result.status === "FAIL");
if (jsonOutput) {
  console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", results }, null, 2));
} else {
  for (const result of results) {
    console.log(`${result.status.padEnd(7)} ${result.check}: ${result.detail}`);
  }
}

if (failed) process.exitCode = 1;
