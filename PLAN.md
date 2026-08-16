# Plan: `no_bat_spawn` behavior pack

Handoff document. Nothing in this plan has been implemented yet — no `no_bat_spawn/` folder
exists. Read this, verify the assumptions marked **VERIFY**, then build.

## Goal

A second, standalone behavior pack that stops bats spawning naturally. Bats have no drops, no
trades, and no mechanic depends on them; they only consume the ambient mob cap and tick budget on
a server. Nothing else about the game changes.

Independent of `silk_touch_drop/` — separate folder, separate manifest, separate UUIDs. Either
pack can be applied to a world without the other.

## Approach: data-driven spawn rules override, no script

Unlike the block-drop problem that forced `silk_touch_drop` into scripting, mob spawning **is**
exposed to data-driven overrides. A behavior pack that ships `spawn_rules/bat.json` with the
identifier `minecraft:bat` fully replaces vanilla's bat spawn rules. Give it an empty `conditions`
array and there is no context in which the game will naturally spawn a bat.

No `@minecraft/server` dependency, no script module, no per-tick cost — this is the whole
implementation.

```
no_bat_spawn/
├── manifest.json
└── spawn_rules/
    └── bat.json
```

`spawn_rules/bat.json`, starting point:

```json
{
  "format_version": "1.8.0",
  "minecraft:spawn_rules": {
    "description": {
      "identifier": "minecraft:bat",
      "population_control": "ambient"
    },
    "conditions": []
  }
}
```

`manifest.json`: mirror `silk_touch_drop/manifest.json`, but

- **generate fresh UUIDs** (`uuidgen`) for both the header and the module — reusing
  `silk_touch_drop`'s makes the two packs collide and the second one silently fails to load
- one module only, `"type": "data"` — no `"script"` module, no `dependencies` block
- `min_engine_version` can be much lower than `[1, 26, 40]` since there is no script API in play;
  pick whichever you actually intend to support and say so in the README

## VERIFY before writing the files

1. **`population_control` value.** Vanilla bats use the `ambient` pool, but some docs enumerate
   only `animal` / `water_animal` / `monster` / `cat`. Read the real value out of vanilla's own
   `spawn_rules/bat.json` in <https://github.com/Mojang/bedrock-samples> (`behavior_pack/`
   directory, tag matching your target version) and copy it verbatim. A wrong pool name is a load
   error.
2. **`format_version`.** Copy whatever the vanilla bat file uses at your target version rather
   than assuming `1.8.0`. Condition components are version-sensitive.
3. **Empty `conditions` actually loads.** It should parse and simply never match, but confirm the
   content log is clean (below) rather than trusting that an empty array is legal.

If empty `conditions` turns out to be rejected, the fallback is to keep vanilla's conditions but
set `"minecraft:weight": { "default": 0 }`. Prefer empty conditions if it works — weight 0 is a
probability, not a prohibition.

## Scope boundaries — state these in the README

Spawn rules govern **natural** spawning only. All of the following still produce bats, by design:

- bat spawn egg
- `/summon minecraft:bat`
- monster spawners set to bats

That is the right behavior — a player who explicitly asks for a bat should get one. Do not add a
script to kill those; it would break command blocks and map-maker use for no resource win.

**Already-spawned bats are not removed.** Existing bats in generated chunks survive until they
despawn naturally. Document the one-time cleanup, don't automate it:

```
/kill @e[type=minecraft:bat]
```

Only affects loaded chunks, so it needs re-running as the world loads, or just let natural
despawn handle it.

## Testing

No build or test tooling exists in this repo; validate by hand, same as the other pack.

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
4. Confirm the escape hatches still work: bat spawn egg places a bat, `/summon minecraft:bat`
   works.
5. Confirm no collateral: other ambient-pool mobs still spawn normally, and the `silk_touch_drop`
   pack still works when both are enabled on the same world.

## Repo housekeeping

`AGENTS.md` (symlinked as `CLAUDE.md`) and `README.md` both currently describe this repo as a
single pack. Both need rewording to a two-pack repo once `no_bat_spawn/` exists — mention that the
packs are independent, and that this one is data-only, which makes it the counterexample to the
"vanilla behavior isn't data-driven, so we script it" note in the architecture section.
