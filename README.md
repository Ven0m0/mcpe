# Silk Touch Drops

Behavior pack that changes vanilla break-drop behavior for a set of blocks: breaking any of them
with any tool, including bare hand, always drops exactly 1 of the block itself. Silk Touch makes no
difference. No other block, item, recipe, or vanilla behavior is changed.

Covered blocks:

- Grass, all vanilla leaves (oak, spruce, birch, jungle, acacia, dark oak, mangrove, cherry,
  azalea, flowering azalea), vines, weeping vines, twisting vines, sculk, sculk vein
- Glass: plain glass, tinted glass, all 16 stained glass colors, plain glass pane, and all 16
  stained glass pane colors. Normally these shatter without Silk Touch; this pack always drops
  exactly 1 of the block broken.
- Ender Chest: normally drops 8 obsidian without Silk Touch, or the chest itself with Silk Touch;
  this pack always drops exactly 1 `minecraft:ender_chest` regardless. Ender Chest interaction and
  per-player stored contents are untouched — the pack only affects the block-break moment.

## Supported Bedrock version

`1.26.40.05` and newer (`min_engine_version` `[1, 26, 40]`). Uses the stable `@minecraft/server`
`2.9.0` script module - no experimental toggles or Beta APIs required.

## Installation

Copy the `silk_touch_drop` folder into your Bedrock `development_behavior_packs` directory (or
import it as a `.mcpack`):

```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\silk_touch_drop
```

## Enabling in a world

1. Create or open a world's settings.
2. Under **Behavior Packs**, find **Silk Touch Drops** in the available list and activate it.
3. No resource pack or experimental toggles are required. Works in existing survival worlds; no
   world conversion needed.

## Testing

In a world with the pack active, break each covered block and confirm exactly 1 of itself drops
each time:

- Bare hand
- Wooden pickaxe / shears (whichever is the vanilla tool for that block)
- Diamond tool with Silk Touch
- Diamond tool without Silk Touch
- Creative mode: block breaks instantly, drops nothing (matches vanilla creative behavior)
- Ender Chest specifically: place a few items in it, break it, place a new one, confirm the same
  items are still there (contents are stored per-player, not on the block, and are unaffected)

## Known limitations

- Breaking is implemented by cancelling the vanilla break and re-creating it in script, so the
  tool used takes **no durability damage** from breaking a covered block.
- Only covers player breaks. Explosions, pistons, and `/setblock ... destroy` do not fire the
  event this pack hooks, so they still use vanilla drop behavior. Ender Chests have very high
  blast resistance, so normal explosions (TNT, creepers) cannot break them regardless.
