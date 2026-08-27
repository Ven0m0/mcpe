import { world, system } from '@minecraft/server';

const playerState = new Map();

function hasElytra(player) {
  const equippable = player.getComponent('minecraft:equippable');
  if (!equippable) return false;
  const chestItem = equippable.getEquipment(1);
  return chestItem?.typeId === 'minecraft:elytra';
}

function isInLava(player) {
  const loc = player.location;
  const dim = player.dimension;
  const feet = { x: loc.x, y: loc.y, z: loc.z };
  const eyes = { x: loc.x, y: loc.y + 1.62, z: loc.z };
  const feetBlock = dim.getBlock(feet);
  const eyesBlock = dim.getBlock(eyes);
  return (feetBlock?.typeId?.includes('lava') ?? false) || (eyesBlock?.typeId?.includes('lava') ?? false);
}

function isGliding(player) {
  return player.isGliding;
}

function getForwardVelocity(player) {
  const rot = player.getRotation();
  const pitch = rot.x * (Math.PI / 180);
  const yaw = rot.y * (Math.PI / 180);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  let speed = 0.25;
  if (pitch < -0.2) speed = 0.15;
  else if (pitch > 0.2) speed = 0.35;
  const vx = -sinYaw * cosPitch * speed;
  const vy = sinPitch * speed;
  const vz = cosYaw * cosPitch * speed;
  return { x: vx, y: vy, z: vz };
}

function getState(player) {
  const id = player.id;
  if (!playerState.has(id)) {
    playerState.set(id, {
      wasGliding: false,
      inLava: false,
      flyingInLava: false,
      boostTicks: 0,
      rocketCooldown: 0,
    });
  }
  return playerState.get(id);
}

function clearState(player) {
  playerState.delete(player.id);
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (!hasElytra(player)) {
      clearState(player);
      continue;
    }
    const state = getState(player);
    const gliding = isGliding(player);
    const inLava = isInLava(player);
    if (state.wasGliding && !gliding && inLava && !state.flyingInLava) {
      state.flyingInLava = true;
      state.inLava = true;
      const vel = getForwardVelocity(player);
      player.applyImpulse(vel);
    } else if (state.flyingInLava) {
      if (inLava) {
        state.inLava = true;
        const vel = getForwardVelocity(player);
        const boostMult = state.boostTicks > 0 ? 3.0 : 1.0;
        player.applyImpulse({
          x: vel.x * boostMult,
          y: vel.y * boostMult,
          z: vel.z * boostMult,
        });
        if (state.boostTicks > 0) state.boostTicks--;
        if (state.rocketCooldown > 0) state.rocketCooldown--;
      } else {
        state.flyingInLava = false;
        state.inLava = false;
        player.clearVelocity();
      }
    } else if (gliding && !inLava) {
      state.wasGliding = true;
      state.inLava = false;
    } else if (!gliding) {
      state.wasGliding = false;
    }
  }
}, 1);

world.afterEvents.itemUse.subscribe((ev) => {
  if (ev.itemStack?.typeId !== 'minecraft:firework_rocket') return;
  const player = ev.source;
  if (!player || !hasElytra(player)) return;
  const state = getState(player);
  if (state.rocketCooldown > 0) return;
  state.rocketCooldown = 5;
  const vel = getForwardVelocity(player);
  player.applyImpulse({
    x: vel.x * 3.0,
    y: vel.y * 3.0,
    z: vel.z * 3.0,
  });
  if (state.flyingInLava) {
    state.boostTicks = 6;
  }
});

world.afterEvents.playerSpawn.subscribe((ev) => {
  clearState(ev.player);
});

world.afterEvents.entityDie.subscribe((ev) => {
  if (ev.deadEntity.typeId === 'minecraft:player') {
    clearState(ev.deadEntity);
  }
});

world.afterEvents.playerDimensionChange.subscribe((ev) => {
  clearState(ev.player);
});
