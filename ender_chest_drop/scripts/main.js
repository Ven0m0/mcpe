import { world, system, ItemStack, GameMode } from "@minecraft/server";

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  if (!ev.block.matches("minecraft:ender_chest")) return;

  ev.cancel = true;

  const { block, dimension } = ev;
  const shouldDrop = ev.player.getGameMode() !== GameMode.Creative;
  const at = block.center();

  system.run(() => {
    if (!block.isValid) return;
    block.setType("minecraft:air");
    if (shouldDrop) {
      dimension.spawnItem(new ItemStack("minecraft:ender_chest", 1), at);
    }
  });
});
