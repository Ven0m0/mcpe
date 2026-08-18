# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Three independent Minecraft Bedrock Edition packs: behavior packs `silk_touch_drop/` and
`no_bat_spawn/`, and resource pack `quiet_ravager/`. No build system, no package manager, no
tests — each pack is a static JSON manifest, loaded directly by the game engine, plus one script
file for `silk_touch_drop` only. Any pack can be applied to a world without the others; they ship
separate manifests and UUIDs and don't interact.

## Commands

No build/lint/test commands exist. Validate by hand:

```bash
python -c "import json; json.load(open('silk_touch_drop/manifest.json'))"    # JSON syntax
node --check silk_touch_drop/scripts/main.js                                  # JS syntax
python -c "import json; json.load(open('no_bat_spawn/manifest.json'))"        # JSON syntax
python -c "import json; json.load(open('no_bat_spawn/spawn_rules/bat.json'))" # JSON syntax
python -c "import json; json.load(open('quiet_ravager/manifest.json'))"       # JSON syntax
python -c "import json; json.load(open('quiet_ravager/sounds.json'))"         # JSON syntax
```

Runtime verification requires launching Minecraft Bedrock and manually testing in a test world —
for `silk_touch_drop`, breaking each covered block (see README.md "Testing" for the exact case
matrix — hand/wooden/diamond tool, with/without Silk Touch, creative mode, Ender Chest
contents-preserved check); for `no_bat_spawn`, waiting out spawn cycles underground with the
Content Log enabled (see `no_bat_spawn/README.md` "Testing"); for `quiet_ravager`, spawning a
Ravager and confirming its sounds are quieter (see `quiet_ravager/README.md` "Testing").

## Deploying for manual testing

Copy a behavior pack folder (`silk_touch_drop/` or `no_bat_spawn/`) into:
```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\
```
or the resource pack folder (`quiet_ravager/`) into:
```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\
```
then activate it under a world's Behavior Packs or Resource Packs settings.

## Architecture

### `silk_touch_drop`

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

### `no_bat_spawn`

The counterexample to `silk_touch_drop`'s "vanilla behavior isn't data-driven, so we script it"
note above: mob **spawning** is exposed to data-driven overrides, unlike block drops. This pack
ships `no_bat_spawn/spawn_rules/bat.json` with identifier `minecraft:bat` and an empty `conditions`
array, which fully replaces vanilla's bat spawn rules — there is no context left in which the game
naturally spawns a bat. No script module, no `@minecraft/server` dependency, no per-tick cost;
`no_bat_spawn/manifest.json` declares a single `"type": "data"` module.

Spawn eggs, `/summon minecraft:bat`, and monster spawners are untouched by design — those are
explicit player requests, not natural spawning. Already-spawned bats are not removed by the pack;
see `no_bat_spawn/README.md` for the one-time `/kill` cleanup command.

Manifest targets `min_engine_version [1, 17, 0]`, matching the `spawn_rules` `format_version
1.17.0` copied verbatim from vanilla's own `spawn_rules/bat.json`.

### `quiet_ravager`

Resource pack, not a behavior pack — the only one of the three. Its manifest declares a single
`"type": "resources"` module, and its `sounds.json` overrides `entity_sounds.entities.ravager` to
0.2 volume for every event (ambient, hurt, death, step, bite, roar, stun, raid ambient, celebrate).
No script, no data module, no behavior-pack dependency.

Ships as `.mcpack`, not `.mcaddon` — a single-pack archive with `manifest.json` at the zip root,
rather than the pack folder itself. `Build-McAddon.ps1` and `.github/workflows/release.yml` both
branch on this: `silk_touch_drop`/`no_bat_spawn` zip the pack folder in as the archive root
(`.mcaddon`), `quiet_ravager` zips the folder's *contents* at the archive root (`.mcpack`).

Manifest targets `min_engine_version [1, 26, 44]`.
