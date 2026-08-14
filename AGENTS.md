# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Minecraft Bedrock Edition behavior pack (`ender_chest_drop/`). No build system, no package manager,
no tests — it's a static JSON manifest plus one script file, loaded directly by the game engine.

## Commands

No build/lint/test commands exist. Validate by hand:

```bash
python -c "import json; json.load(open('ender_chest_drop/manifest.json'))"  # JSON syntax
node --check ender_chest_drop/scripts/main.js                                # JS syntax
```

Runtime verification requires launching Minecraft Bedrock and manually breaking an Ender Chest in
a test world (see README.md "Testing" for the exact case matrix — hand/wooden/diamond pickaxe,
with/without Silk Touch, creative mode, contents-preserved check).

## Deploying for manual testing

Copy `ender_chest_drop/` into:
```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\
```
then activate it under a world's Behavior Packs settings.

## Architecture

Single responsibility: override vanilla Ender Chest break drops (normally 8 obsidian without Silk
Touch, the chest itself with Silk Touch) to always drop exactly 1 `minecraft:ender_chest`.

This can't be done with a data-driven loot-table override — vanilla block drops are hardcoded in
the Bedrock engine and are not exposed through any `loot_tables/blocks/` path or block-identifier
override. `ender_chest_drop/scripts/main.js` is therefore the only logic file: it hooks
`world.beforeEvents.playerBreakBlock`, cancels the vanilla break when the block matches
`minecraft:ender_chest`, then in `system.run` (required to leave the event's restricted-execution
mode — direct world mutation isn't allowed inside `beforeEvents` handlers) sets the block to air
and spawns exactly one Ender Chest item, skipping the drop in creative mode to match vanilla.

Ender Chest contents live in per-player NBT, not on the block, so this script never touches them.

Known tradeoff: cancelling the break means the breaking tool takes no durability damage (see
README.md "Known limitations").

Manifest (`ender_chest_drop/manifest.json`) targets Bedrock `min_engine_version [1, 26, 40]` and
depends on the stable `@minecraft/server` `2.9.0` module — no experimental toggles or Beta APIs.
