import { world, system, ItemStack, GameMode } from '@minecraft/server';

const TARGET_BLOCKS = new Set([
  'minecraft:oak_leaves',
  'minecraft:spruce_leaves',
  'minecraft:birch_leaves',
  'minecraft:jungle_leaves',
  'minecraft:acacia_leaves',
  'minecraft:dark_oak_leaves',
  'minecraft:mangrove_leaves',
  'minecraft:cherry_leaves',
  'minecraft:azalea_leaves',
  'minecraft:azalea_leaves_flowered',
  'minecraft:vine',
  'minecraft:weeping_vines',
  'minecraft:twisting_vines',
  'minecraft:sculk',
  'minecraft:sculk_vein',
  'minecraft:sculk_catalyst',
  'minecraft:sculk_shrieker',
  'minecraft:sculk_sensor',
  'minecraft:calibrated_sculk_sensor',
  'minecraft:ice',
  'minecraft:packed_ice',
  'minecraft:blue_ice',
  'minecraft:bee_nest',
  'minecraft:turtle_egg',
  'minecraft:ender_chest',
  'minecraft:glass',
  'minecraft:tinted_glass',
  'minecraft:white_stained_glass',
  'minecraft:orange_stained_glass',
  'minecraft:magenta_stained_glass',
  'minecraft:light_blue_stained_glass',
  'minecraft:yellow_stained_glass',
  'minecraft:lime_stained_glass',
  'minecraft:pink_stained_glass',
  'minecraft:gray_stained_glass',
  'minecraft:light_gray_stained_glass',
  'minecraft:cyan_stained_glass',
  'minecraft:purple_stained_glass',
  'minecraft:blue_stained_glass',
  'minecraft:brown_stained_glass',
  'minecraft:green_stained_glass',
  'minecraft:red_stained_glass',
  'minecraft:black_stained_glass',
  'minecraft:glass_pane',
  'minecraft:white_stained_glass_pane',
  'minecraft:orange_stained_glass_pane',
  'minecraft:magenta_stained_glass_pane',
  'minecraft:light_blue_stained_glass_pane',
  'minecraft:yellow_stained_glass_pane',
  'minecraft:lime_stained_glass_pane',
  'minecraft:pink_stained_glass_pane',
  'minecraft:gray_stained_glass_pane',
  'minecraft:light_gray_stained_glass_pane',
  'minecraft:cyan_stained_glass_pane',
  'minecraft:purple_stained_glass_pane',
  'minecraft:blue_stained_glass_pane',
  'minecraft:brown_stained_glass_pane',
  'minecraft:green_stained_glass_pane',
  'minecraft:red_stained_glass_pane',
  'minecraft:black_stained_glass_pane',
]);

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  const typeId = ev.block.typeId;
  if (!TARGET_BLOCKS.has(typeId)) return;

  ev.cancel = true;

  const { block, dimension } = ev;
  const shouldDrop = ev.player.getGameMode() !== GameMode.Creative;
  const at = block.center();

  system.run(() => {
    if (!block.isValid) return;
    block.setType('minecraft:air');
    if (shouldDrop) {
      dimension.spawnItem(new ItemStack(typeId, 1), at);
    }
  });
});
