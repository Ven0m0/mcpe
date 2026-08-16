---
name: bump-version
description: Bump silk_touch_drop manifest.json (header + module version) and package.json together, and report the tag for release.yml
disable-model-invocation: true
---

# Bump Version

Keeps `silk_touch_drop/manifest.json` (`header.version`, `modules[0].version`) and `package.json`
(`version`) in sync. The release workflow's `workflow_dispatch` bump input computes the next git tag
from existing tags on its own — it does NOT read either file — so this skill exists only to stop the
two files drifting from each other and from what gets tagged.

Steps:
1. Read the current `header.version` from `silk_touch_drop/manifest.json`.
2. Ask which part to bump (patch/minor/major) if not stated — matches release.yml's `bump` choices.
3. Compute the new `[major, minor, patch]` triple.
4. Update both `header.version` and `modules[0].version` in `silk_touch_drop/manifest.json` to the
   new triple (they must match).
5. Update `version` in `package.json` to the matching `"major.minor.patch"` string.
6. Report the tag name (`vMAJOR.MINOR.PATCH`) to push, or to pick in the release workflow's
   `workflow_dispatch` bump input.

Do not create a git tag or commit here — that's release.yml's job.
