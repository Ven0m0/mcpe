# No Bat Spawn

Behavior pack that stops bats spawning naturally. Bats have no drops, no trades, and no mechanic
depends on them; they only consume the ambient mob cap and tick budget on a server. Nothing else
about the game changes.

Data-driven only: ships a single `spawn_rules/bat.json` that fully replaces vanilla's bat spawn
rules with an empty `conditions` array, so there is no context in which the game will naturally
spawn a bat. No script module, no `@minecraft/server` dependency, no per-tick cost.

Independent of [`silk_touch_drop`](../silk_touch_drop) — separate folder, separate manifest,
separate UUIDs. Either pack can be applied to a world without the other, and both can be enabled
together.

## Scope boundaries

Spawn rules govern **natural** spawning only. All of the following still produce bats, by design:

- Bat spawn egg
- `/summon minecraft:bat`
- Monster spawners set to bats

A player who explicitly asks for a bat should get one; this pack does not touch any of those paths.

**Already-spawned bats are not removed.** Existing bats in generated chunks survive until they
despawn naturally. One-time cleanup, not automated by this pack:

```
/kill @e[type=minecraft:bat]
```

Only affects loaded chunks, so it needs re-running as the world loads, or just let natural despawn
handle it.

## Supported Bedrock version

`1.17.0` and newer (`min_engine_version` `[1, 17, 0]`), matching the `spawn_rules` `format_version`
this pack uses. No script API is involved.

## Installation

Copy the `no_bat_spawn` folder into your Bedrock `development_behavior_packs` directory (or import
it as a `.mcpack`):

```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\no_bat_spawn
```

## Enabling in a world

1. Create or open a world's settings.
2. Under **Behavior Packs**, find **No Bat Spawn** in the available list and activate it.
3. No resource pack or experimental toggles are required.

## Testing

```bash
python -c "import json; json.load(open('no_bat_spawn/manifest.json'))"
python -c "import json; json.load(open('no_bat_spawn/spawn_rules/bat.json'))"
```

Then in-game:

1. Enable **Creator > Content Log GUI** and **Content Log File** in Minecraft settings before
   loading the world. A malformed spawn rules file fails quietly otherwise — the pack loads, the
   override is skipped, and bats keep spawning as if nothing happened. A clean content log is the
   real pass condition here.
2. Activate the pack on a fresh world (fresh matters — an existing world already has bats in it).
3. Go underground, below y=63, dark, and wait out several spawn cycles. No bats.
4. Confirm the escape hatches still work: bat spawn egg places a bat, `/summon minecraft:bat` works.
5. Confirm no collateral: other ambient-pool mobs still spawn normally, and the `silk_touch_drop`
   pack still works when both are enabled on the same world.
