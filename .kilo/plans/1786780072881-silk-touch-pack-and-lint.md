# Plan

## Context

- Package manager: Bun 1.3.14 (`package.json` has `"packageManager": "bun@1.3.14"`)
- Pre-commit: `prek` is configured in `.pre-commit-config.yaml` (trailing-whitespace, end-of-file-fixer, check-json, check-yaml, check-added-large-files, and a local `node --check` hook)
- CI: `.github/workflows/ci.yml` runs `bun install`, `node --check ender_chest_drop/scripts/main.js`, `python3 -c "import json; json.load(open('ender_chest_drop/manifest.json'))"`, and `prek run --all-files`
- Release: `.github/workflows/release.yml` zips `ender_chest_drop/` into `ender_chest_drop.mcaddon`; uses `git-cliff` for changelog
- Codebase: single JS file (`ender_chest_drop/scripts/main.js`), single manifest (`ender_chest_drop/manifest.json`)

## Task 1: Add linting/formatting via oxlint/oxfmt

1. `bun add -d oxlint oxfmt`
2. Create `oxlint.config.json`:
   - Disable `@typescript-eslint` rules (no TS)
   - Configure `reportUnusedImports` and `reportUnusedVariables` as warnings
   - Add `@minecraft/server` to `ignores` for import resolution (it's a Bedrock runtime module, not a Node package)
   - Enable recommended rules
3. Create `oxfmt.json` with 2-space indent, trailing commas, single quotes (matching existing JS style)
4. Add scripts to `package.json`:
   - `lint`: `oxlint`
   - `format`: `oxfmt --write`
   - `typecheck`: `node --check ender_chest_drop/scripts/main.js` (placeholder for any future TS)
5. Run `oxfmt --write` on `ender_chest_drop/scripts/main.js`
6. Add `oxlint` and `oxfmt` to `.pre-commit-config.yaml` as local hooks or run via `bun` in CI
7. Update `.github/workflows/ci.yml` to run `bun run lint` and `bun run format --check` in the `test` job
8. Validate existing checks still pass:
   - `node --check ender_chest_drop/scripts/main.js`
   - `python3 -c "import json; json.load(open('ender_chest_drop/manifest.json'))"`

## Task 2: Create silk-touch behavior pack for grass/leaves/vines/sculk

1. Create `silk_touch_drop/` directory
2. Create `silk_touch_drop/manifest.json`:
   - Same `format_version: 2`, `min_engine_version [1, 26, 40]`
   - New UUIDs for header and module
   - Depends on `@minecraft/server` `2.9.0`
3. Create `silk_touch_drop/scripts/main.js` using the same pattern as `ender_chest_drop/scripts/main.js`:
   - Hook `world.beforeEvents.playerBreakBlock`
   - Define `TARGET_BLOCKS` as a `Set` of block identifiers
   - For matched blocks: `ev.cancel = true`, then in `system.run()` set block to air and spawn exactly 1 silk-touch drop item (skip in creative)
4. Define exact `TARGET_BLOCKS` and corresponding drop items
5. Document known limitation: tool takes no durability damage
6. Validate: `node --check silk_touch_drop/scripts/main.js`, JSON validation, and in-game testing matrix

## Release considerations

- The new pack must be added to `.github/workflows/release.yml` so it is included in the `.mcaddon` artifact
- The `Build-McAddon.ps1` script at repo root may also need updating if it is used for local packaging

## Open decisions
