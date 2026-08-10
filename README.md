# Ender Chest Always Drops Itself

Behavior pack that changes vanilla Ender Chest drop behavior: breaking an Ender Chest with any
tool, including bare hand, always drops exactly 1 `minecraft:ender_chest`. Silk Touch makes no
difference (previously: no Silk Touch dropped 8 obsidian, Silk Touch dropped the chest). No other
block, item, recipe, or vanilla behavior is changed. Ender Chest interaction and per-player stored
contents are untouched - the pack only affects the block-break moment.

## Supported Bedrock version

`1.26.40.05` and newer (`min_engine_version` `[1, 26, 40]`). Uses the stable `@minecraft/server`
`2.9.0` script module - no experimental toggles or Beta APIs required.

## Installation

Copy the `ender_chest_drop` folder into your Bedrock `development_behavior_packs` directory (or
import it as a `.mcpack`):

```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\ender_chest_drop
```

## Enabling in a world

1. Create or open a world's settings.
2. Under **Behavior Packs**, find **Ender Chest Always Drops Itself** in the available list and
   activate it.
3. No resource pack or experimental toggles are required. Works in existing survival worlds; no
   world conversion needed.

## Testing

In a world with the pack active, break an Ender Chest and confirm exactly 1 Ender Chest item
appears each time:

- Bare hand
- Wooden pickaxe
- Diamond pickaxe
- Diamond pickaxe with Silk Touch
- Any pickaxe without Silk Touch
- Creative mode: block breaks instantly, drops nothing (matches vanilla creative behavior)
- Place a few items in the Ender Chest, break it, place a new one, confirm the same items are
  still there (contents are stored per-player, not on the block, and are unaffected)

## Known limitations

- Breaking is implemented by cancelling the vanilla break and re-creating it in script, so the
  tool used takes **no durability damage** from breaking an Ender Chest.
- Only covers player breaks. Explosions, pistons, and `/setblock ... destroy` do not fire the
  event this pack hooks, so they still use vanilla drop behavior. Ender Chests have very high
  blast resistance, so normal explosions (TNT, creepers) cannot break them regardless.
