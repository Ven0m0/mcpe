# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Minecraft Bedrock Edition behavior pack (`silk_touch_drop/`). No build system, no package manager,
no tests — it's a static JSON manifest plus one script file, loaded directly by the game engine.

## Commands

No build/lint/test commands exist. Validate by hand:

```bash
python -c "import json; json.load(open('silk_touch_drop/manifest.json'))"  # JSON syntax
node --check silk_touch_drop/scripts/main.js                                 # JS syntax
```

Runtime verification requires launching Minecraft Bedrock and manually breaking each covered block
in a test world (see README.md "Testing" for the exact case matrix — hand/wooden/diamond tool,
with/without Silk Touch, creative mode, Ender Chest contents-preserved check).

## Deploying for manual testing

Copy `silk_touch_drop/` into:
```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\
```
then activate it under a world's Behavior Packs settings.

## Architecture

Single responsibility: override vanilla break drops for a fixed set of blocks (leaves, vines, the
sculk family, ice variants, glass and glass panes, turtle egg, and the Ender Chest) so each always
drops exactly 1 of itself, Silk Touch or not.

Blocks whose value lives in block entity data are deliberately excluded — the cancel-and-respawn
approach can only spawn a bare item, so covering a bee nest would drop an empty nest and lose the
bees that real Silk Touch preserves. See README.md "Deliberately not covered".

This can't be done with a data-driven loot-table override — vanilla block drops are hardcoded in
the Bedrock engine and are not exposed through any `loot_tables/blocks/` path or block-identifier
override. `silk_touch_drop/scripts/main.js` is therefore the only logic file: it hooks
`world.beforeEvents.playerBreakBlock`, checks the broken block's `typeId` against the `TARGET_BLOCKS`
set, cancels the vanilla break on a match, then in `system.run` (required to leave the event's
restricted-execution mode — direct world mutation isn't allowed inside `beforeEvents` handlers) sets
the block to air and spawns exactly one drop item of the same `typeId`, skipping the drop in
creative mode to match vanilla.

Ender Chest contents live in per-player NBT, not on the block, so this script never touches them.

Known tradeoff: cancelling the break means the breaking tool takes no durability damage (see
README.md "Known limitations").

Manifest (`silk_touch_drop/manifest.json`) targets Bedrock `min_engine_version [1, 26, 40]` and
depends on the stable `@minecraft/server` `2.9.0` module — no experimental toggles or Beta APIs.
