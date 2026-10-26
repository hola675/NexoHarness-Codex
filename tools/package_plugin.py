#!/usr/bin/env python3
"""Build and verify a deterministic, local ZIP of the Codex plugin."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PLUGIN_ROOT = ROOT / "plugins" / "nexo-harness"
CATALOG_PATH = ROOT / "catalog" / "components.json"
FIXED_ZIP_TIME = (1980, 1, 1, 0, 0, 0)


def fail(message: str) -> None:
    raise ValueError(message)


def load_sources() -> dict[str, Path]:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    components = catalog.get("components")
    if not isinstance(components, list):
        fail("catalog components must be a list")

    sources: dict[str, Path] = {}
    for component in components:
        if component.get("kind") != "skill":
            continue
        destination = component.get("destination")
        if not isinstance(destination, str) or not destination.startswith("plugins/nexo-harness/skills/"):
            fail(f"{component.get('id', 'skill')}: destination is outside the plugin skill directory")
        source_path = resolve_repo_file(destination)
        if not source_path.is_file():
            fail(f"{component.get('id', 'skill')}: skill file does not exist: {destination}")
        if source_path.name != "SKILL.md":
            fail(f"{component.get('id', 'skill')}: skill destination must be SKILL.md")
        sources[destination.removeprefix("plugins/nexo-harness/")] = source_path

    expected_skills = {
        path.relative_to(PLUGIN_ROOT).as_posix()
        for path in PLUGIN_ROOT.glob("skills/*/SKILL.md")
    }
    if not expected_skills:
        fail("no plugin skills were found")
    if expected_skills != {name for name in sources if name.startswith("skills/")}:
        fail("plugin skill files and included skill catalog records do not match")

    for path in walk_plugin_files():
        relative = path.relative_to(PLUGIN_ROOT).as_posix()
        sources[relative] = path

    if "plugin.json" not in sources:
        fail("plugin.json is missing")
    for component in components:
        if component.get("kind") != "skill":
            continue
        for support_file in component.get("supportFiles", []):
            if not support_file.startswith("plugins/nexo-harness/"):
                fail(f"{component.get('id')}: support file is outside the plugin: {support_file}")
            relative = support_file.removeprefix("plugins/nexo-harness/")
            if relative not in sources:
                fail(f"{component.get('id')}: support file is not in the package: {support_file}")

    return dict(sorted(sources.items()))


def resolve_repo_file(relative: str) -> Path:
    pure = PurePosixPath(relative)
    if pure.is_absolute() or ".." in pure.parts:
        fail(f"repository path must be relative and cannot traverse: {relative}")
    resolved = (ROOT / Path(*pure.parts)).resolve(strict=False)
    if not resolved.is_relative_to(ROOT):
        fail(f"repository path resolves outside the project: {relative}")
    cursor = ROOT
    for part in pure.parts:
        cursor = cursor / part
        if cursor.exists() and cursor.is_symlink():
            fail(f"symbolic links are not allowed in package sources: {relative}")
    return resolved


def walk_plugin_files() -> list[Path]:
    if PLUGIN_ROOT.is_symlink() or not PLUGIN_ROOT.is_dir():
        fail("plugin root must be a local directory, not a symlink")
    files: list[Path] = []
    for current, directories, filenames in os.walk(PLUGIN_ROOT, followlinks=False):
        base = Path(current)
        for name in list(directories):
            item = base / name
            if item.is_symlink():
                fail(f"symbolic link directory is not allowed: {item.relative_to(ROOT)}")
        for name in filenames:
            item = base / name
            if item.is_symlink() or not item.is_file():
                fail(f"non-regular package file is not allowed: {item.relative_to(ROOT)}")
            files.append(item)
    if not files:
        fail("plugin directory is empty")
    return files


def zip_info(name: str) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, date_time=FIXED_ZIP_TIME)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.compress_level = 9
    info.create_system = 3
    info.external_attr = (stat.S_IFREG | 0o644) << 16
    info.flag_bits |= 0x800  # UTF-8 names
    return info


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def verify_archive(archive_path: Path, sources: dict[str, Path]) -> dict[str, str]:
    expected_names = set(sources)
    with zipfile.ZipFile(archive_path, "r") as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if len(names) != len(set(names)):
            fail("archive contains duplicate paths")
        for name in names:
            pure = PurePosixPath(name)
            if pure.is_absolute() or ".." in pure.parts or "\\" in name:
                fail(f"archive contains an unsafe path: {name}")
        if set(names) != expected_names:
            missing = sorted(expected_names - set(names))
            extra = sorted(set(names) - expected_names)
            fail(f"archive file list mismatch; missing={missing}, extra={extra}")

        hashes: dict[str, str] = {}
        for name, source in sources.items():
            packaged = archive.read(name)  # also verifies ZIP CRC
            source_bytes = source.read_bytes()
            if packaged != source_bytes:
                fail(f"packaged file differs from source: {name}")
            hashes[name] = digest(packaged)
        return hashes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="ZIP output path (default: dist/nexo-harness-<version>.zip)")
    parser.add_argument("--force", action="store_true", help="replace an existing output archive")
    parser.add_argument("--json", action="store_true", help="print a machine-readable result")
    args = parser.parse_args()

    manifest = json.loads((PLUGIN_ROOT / "plugin.json").read_text(encoding="utf-8"))
    version = manifest.get("version")
    if not isinstance(version, str) or not version:
        fail("plugin manifest needs a version")

    output = (args.output or (ROOT / "dist" / f"nexo-harness-{version}.zip")).resolve()
    if output.is_relative_to(PLUGIN_ROOT):
        fail("output archive must be outside the plugin source directory")
    sources = load_sources()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists() and not args.force:
        fail(f"output already exists (pass --force to replace): {output}")

    temporary = None
    created_output = False
    try:
        handle, temporary_name = tempfile.mkstemp(prefix=f".{output.name}.", suffix=".tmp", dir=output.parent)
        os.close(handle)
        temporary = Path(temporary_name)
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for name, source in sources.items():
                archive.writestr(zip_info(name), source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        hashes = verify_archive(temporary, sources)
        if args.force:
            os.replace(temporary, output)
        else:
            with temporary.open("rb") as source_stream, output.open("xb") as output_stream:
                created_output = True
                while chunk := source_stream.read(1024 * 1024):
                    output_stream.write(chunk)
    except BaseException:
        if created_output:
            output.unlink(missing_ok=True)
        raise
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)

    result = {
        "status": "PASS",
        "archive": str(output),
        "sha256": digest(output.read_bytes()),
        "files": len(hashes),
        "fileHashes": hashes,
        "deterministicInputs": "sorted paths, fixed timestamps, normalized permissions, and source hash verification",
        "limitation": "Deflate output may vary across Python/zlib versions; compare file hashes rather than archive hash across toolchains.",
    }
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"PASS packaged and verified {result['files']} files")
        print(f"Archive: {output}")
        print(f"SHA-256: {result['sha256']}")
        print(result["limitation"])
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, zipfile.BadZipFile, json.JSONDecodeError) as error:
        print(f"Package failed: {error}", file=sys.stderr)
        raise SystemExit(1)
