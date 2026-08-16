import { world, system, ItemStack, GameMode } from '@minecraft/server';

const TARGET_BLOCKS = new Set([
  'minecraft:grass',
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
