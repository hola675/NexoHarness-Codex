import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const catalogPath = path.join(repositoryRoot, "catalog", "components.json");
const marketplacePath = path.join(repositoryRoot, ".agents", "plugins", "marketplace.json");
const pluginManifestPath = path.join(repositoryRoot, "plugins", "nexo-harness", "plugin.json");

function fail(message) {
  console.error(`Catalog invalid: ${message}`);
  process.exitCode = 1;
}

function resolveRepositoryFile(relativePath, componentId) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    fail(`${componentId}: destination must be a non-empty relative path`);
    return null;
  }

  if (path.isAbsolute(relativePath) || path.win32.isAbsolute(relativePath)) {
    fail(`${componentId}: destination must not be absolute`);
    return null;
  }

  const segments = relativePath.split(/[\\/]+/);
  if (segments.includes("..")) {
    fail(`${componentId}: destination must not traverse outside the repository`);
    return null;
  }

  const resolvedPath = path.resolve(repositoryRoot, relativePath);
  const relativeToRoot = path.relative(repositoryRoot, resolvedPath);
  if (relativeToRoot === ".." || relativeToRoot.startsWith(`..${path.sep}`)) {
    fail(`${componentId}: destination resolves outside the repository`);
    return null;
  }

  return resolvedPath;
}

function hasSymbolicLink(relativePath) {
  let currentPath = repositoryRoot;
  for (const segment of path.relative(repositoryRoot, relativePath).split(path.sep)) {
    currentPath = path.join(currentPath, segment);
    if (existsSync(currentPath) && lstatSync(currentPath).isSymbolicLink()) {
      return true;
    }
  }
  return false;
}

function readJsonFile(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON (${error.message})`);
    return null;
  }
}

const marketplace = readJsonFile(marketplacePath, "repo marketplace");
const pluginManifest = readJsonFile(pluginManifestPath, "plugin manifest");
if (marketplace && pluginManifest) {
  const entry = marketplace.plugins?.find((candidate) => candidate.name === pluginManifest.name);
  if (!entry) {
    fail(`repo marketplace does not expose plugin ${pluginManifest.name}`);
  } else {
    for (const field of ["installation", "authentication"]) {
      if (typeof entry.policy?.[field] !== "string") {
        fail(`marketplace plugin ${pluginManifest.name} must define policy.${field}`);
      }
    }
    if (!entry.category || !entry.interface?.displayName) {
      fail(`marketplace plugin ${pluginManifest.name} needs category and interface.displayName`);
    }
    const pluginPath = resolveRepositoryFile(entry.source?.path, pluginManifest.name);
    if (!pluginPath || path.resolve(pluginPath) !== path.resolve(repositoryRoot, "plugins", "nexo-harness")) {
      fail(`marketplace plugin ${pluginManifest.name} must point to the local plugin directory`);
    }
  }
}

let catalog;
try {
  catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
} catch (error) {
  fail(`cannot read catalog JSON (${error.message})`);
}

if (catalog) {
  if (catalog.schemaVersion !== 1) {
    fail("schemaVersion must be 1");
  }
  if (!Array.isArray(catalog.components)) {
    fail("components must be an array");
  } else {
    const ids = new Set();
    for (const component of catalog.components) {
      const id = component?.id;
      if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
        fail("each component must have a kebab-case id");
        continue;
      }
      if (ids.has(id)) {
        fail(`${id}: duplicate component id`);
      }
      ids.add(id);

      for (const field of ["kind", "status", "destination"]) {
        if (typeof component[field] !== "string" || component[field].length === 0) {
          fail(`${id}: ${field} must be a non-empty string`);
        }
      }

      const source = component.source;
      if (!source || typeof source !== "object") {
        fail(`${id}: source metadata is required`);
      } else {
        for (const field of ["type", "repository", "version", "license"]) {
          if (typeof source[field] !== "string" || source[field].length === 0) {
            fail(`${id}: source.${field} must be a non-empty string`);
          }
        }
        if (source.type === "third-party" && !source.commit) {
          fail(`${id}: third-party sources must pin a commit`);
        }
        if (source.type === "third-party" && !source.licenseFile) {
          fail(`${id}: third-party sources must include a local license file`);
        }
        if (source.licenseFile) {
          const licensePath = resolveRepositoryFile(source.licenseFile, id);
          if (licensePath && !existsSync(licensePath)) {
            fail(`${id}: source license file does not exist (${source.licenseFile})`);
          } else if (licensePath && hasSymbolicLink(licensePath)) {
            fail(`${id}: source license path must not contain symbolic links`);
          }
        }
      }

      if (!Array.isArray(component.dependencies)) {
        fail(`${id}: dependencies must be an array`);
      }
      if (!Array.isArray(component.permissions)) {
        fail(`${id}: permissions must be an array`);
      }
      if (typeof component.networkAccess !== "boolean") {
        fail(`${id}: networkAccess must be a boolean`);
      }
      if (!Array.isArray(component.changes) || component.changes.length === 0) {
        fail(`${id}: changes must document origin/adaptation`);
      }

      if (component.supportFiles !== undefined && !Array.isArray(component.supportFiles)) {
        fail(`${id}: supportFiles must be an array when present`);
      }
      for (const supportFile of component.supportFiles ?? []) {
        const supportPath = resolveRepositoryFile(supportFile, id);
        if (supportPath && !existsSync(supportPath)) {
          fail(`${id}: support file does not exist (${supportFile})`);
        } else if (supportPath && hasSymbolicLink(supportPath)) {
          fail(`${id}: support file path must not contain symbolic links (${supportFile})`);
        }
      }

      const destination = resolveRepositoryFile(component.destination, id);
      if (destination) {
        if (!existsSync(destination)) {
          fail(`${id}: destination does not exist (${component.destination})`);
        } else {
          const realDestination = realpathSync(destination);
          const realRoot = realpathSync(repositoryRoot);
          const realRelative = path.relative(realRoot, realDestination);
          if (realRelative === ".." || realRelative.startsWith(`..${path.sep}`)) {
            fail(`${id}: destination resolves outside the repository`);
          }
          if (hasSymbolicLink(destination)) {
            fail(`${id}: destination path must not contain symbolic links`);
          }
        }
      }

      if (component.kind === "skill" && destination && existsSync(destination)) {
        const skillText = readFileSync(destination, "utf8");
        const expectedSkillName = new RegExp(`^name: ${id}\\r?$`, "m");
        if (!/^---\r?\n/.test(skillText) || !expectedSkillName.test(skillText)) {
          fail(`${id}: skill destination must have matching SKILL.md frontmatter`);
        }
        if (!destination.endsWith(`${path.sep}SKILL.md`)) {
          fail(`${id}: skill destination must end in SKILL.md`);
        }
      }

      if (component.kind === "agent" && destination && existsSync(destination)) {
        if (!path.relative(repositoryRoot, destination).startsWith(`.codex${path.sep}agents${path.sep}`)) {
          fail(`${id}: Codex agent profile must live in .codex/agents/`);
        }
        const agentText = readFileSync(destination, "utf8");
        const name = agentText.match(/^name\s*=\s*"([^"]+)"\s*$/m)?.[1];
        const description = agentText.match(/^description\s*=\s*"([^"]+)"\s*$/m)?.[1];
        const instructions = agentText.match(/^developer_instructions\s*=\s*"""[\s\S]*?"""\s*$/m)?.[0];
        if (!name || name !== id) {
          fail(`${id}: agent TOML must declare a matching name`);
        }
        if (!description || !instructions) {
          fail(`${id}: agent TOML needs description and developer_instructions`);
        }
      }
    }

    for (const component of catalog.components) {
      for (const dependency of Array.isArray(component.dependencies) ? component.dependencies : []) {
        if (!ids.has(dependency)) {
          fail(`${component.id}: unknown dependency ${dependency}`);
        }
      }
    }

    const catalogedSkills = new Set(
      catalog.components
        .filter((component) => component.kind === "skill")
        .map((component) => path.resolve(repositoryRoot, component.destination ?? "")),
    );
    const skillRoot = path.join(repositoryRoot, "plugins", "nexo-harness", "skills");
    for (const entry of readdirSync(skillRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(skillRoot, entry.name, "SKILL.md");
      if (existsSync(skillPath) && !catalogedSkills.has(path.resolve(skillPath))) {
        fail(`plugin skill is missing from the catalog (${path.relative(repositoryRoot, skillPath)})`);
      }
    }

    const agentConfigPath = path.join(repositoryRoot, ".codex", "config.toml");
    const agentConfig = readFileSync(agentConfigPath, "utf8");
    const concurrency = agentConfig.match(/^max_concurrent_threads_per_session\s*=\s*(\d+)\s*$/m)?.[1];
    if (!/^\[agents\]\s*$/m.test(agentConfig) || !concurrency || Number(concurrency) < 1 || Number(concurrency) > 2) {
      fail(".codex/config.toml must cap agent concurrency between 1 and 2");
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Catalog valid: ${catalog.components.length} component(s)`);
