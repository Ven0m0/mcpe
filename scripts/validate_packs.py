#!/usr/bin/env python3
"""Validate behavior pack manifests and data files across the repo.

Checks, beyond plain JSON syntax (already covered by check-json):
- every manifest.json has the required header/module fields
- every uuid in every manifest is actually a valid UUID
- no uuid is reused, within a manifest or across packs/manifests
- header.version and module versions are 3-int arrays
- every spawn_rules/*.json has the fields the game engine requires
"""

from __future__ import annotations

import json
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fail(errors: list[str], path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(ROOT)}: {message}")


def load_json(path: Path, errors: list[str]) -> dict | None:
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        fail(errors, path, f"invalid JSON: {e}")
        return None


def check_version(value, label: str, path: Path, errors: list[str]) -> None:
    if not (isinstance(value, list) and len(value) == 3 and all(isinstance(v, int) for v in value)):
        fail(errors, path, f"{label} must be a [major, minor, patch] integer array, got {value!r}")


def check_uuid(value, label: str, path: Path, errors: list[str], seen: dict[str, Path]) -> None:
    if not isinstance(value, str):
        fail(errors, path, f"{label} must be a string, got {value!r}")
        return
    try:
        parsed = uuid.UUID(value)
    except ValueError:
        fail(errors, path, f"{label} {value!r} is not a valid UUID")
        return
    if str(parsed) != value.lower():
        fail(errors, path, f"{label} {value!r} is not a canonical lowercase UUID")
    if value in seen:
        fail(errors, path, f"{label} {value!r} is also used in {seen[value].relative_to(ROOT)}")
    else:
        seen[value] = path


def check_manifest(path: Path, errors: list[str], seen_uuids: dict[str, Path]) -> None:
    data = load_json(path, errors)
    if data is None:
        return

    header = data.get("header")
    if not isinstance(header, dict):
        fail(errors, path, "missing 'header' object")
        return

    for field in ("name", "description", "uuid", "version", "min_engine_version"):
        if field not in header:
            fail(errors, path, f"header missing required field '{field}'")

    if "uuid" in header:
        check_uuid(header["uuid"], "header.uuid", path, errors, seen_uuids)
    if "version" in header:
        check_version(header["version"], "header.version", path, errors)
    if "min_engine_version" in header:
        check_version(header["min_engine_version"], "header.min_engine_version", path, errors)

    modules = data.get("modules")
    if not isinstance(modules, list) or not modules:
        fail(errors, path, "missing non-empty 'modules' array")
        return

    for i, module in enumerate(modules):
        label = f"modules[{i}]"
        if not isinstance(module, dict):
            fail(errors, path, f"{label} must be an object")
            continue
        for field in ("type", "uuid", "version"):
            if field not in module:
                fail(errors, path, f"{label} missing required field '{field}'")
        if "uuid" in module:
            check_uuid(module["uuid"], f"{label}.uuid", path, errors, seen_uuids)
            if module["uuid"] == header.get("uuid"):
                fail(errors, path, f"{label}.uuid must differ from header.uuid")
        if "version" in module:
            check_version(module["version"], f"{label}.version", path, errors)
        if module.get("type") == "script" and "entry" not in module:
            fail(errors, path, f"{label} has type 'script' but no 'entry'")


def check_spawn_rules(path: Path, errors: list[str]) -> None:
    data = load_json(path, errors)
    if data is None:
        return

    if "format_version" not in data:
        fail(errors, path, "missing 'format_version'")

    rules = data.get("minecraft:spawn_rules")
    if not isinstance(rules, dict):
        fail(errors, path, "missing 'minecraft:spawn_rules' object")
        return

    description = rules.get("description")
    if not isinstance(description, dict) or "identifier" not in description:
        fail(errors, path, "minecraft:spawn_rules.description.identifier is required")

    if not isinstance(rules.get("conditions"), list):
        fail(errors, path, "minecraft:spawn_rules.conditions must be an array")


def main() -> int:
    errors: list[str] = []
    seen_uuids: dict[str, Path] = {}

    for path in sorted(ROOT.glob("*/manifest.json")):
        check_manifest(path, errors, seen_uuids)

    for path in sorted(ROOT.glob("*/spawn_rules/*.json")):
        check_spawn_rules(path, errors)

    if errors:
        print("Pack validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"OK: validated {len(seen_uuids)} uuids across all manifests")
    return 0


if __name__ == "__main__":
    sys.exit(main())
