# Elytra in Lava

Behavior pack that ports Java Edition's Elytra-through-lava behavior to Bedrock Edition.

## What it does

- **Glide through lava**: When wearing Elytra and gliding into lava, forward momentum is preserved instead of the engine cancelling flight.
- **Firework propulsion**: Firework rockets work in lava to boost forward.
- **Directional control**: Look direction controls flight path (pitch affects speed, yaw steers).
- **Seamless transition**: Flying out of lava restores normal Elytra gliding.

## How it works

Bedrock's engine forcibly cancels Elytra gliding when entering lava (hardcoded, no API to prevent). This pack detects that cancellation and re-applies forward impulse each tick using the Script API, simulating continued flight.

**Key implementation details:**
- Tick-based simulation via `system.runInterval`
- Per-player state tracking (was gliding, in lava, flying in lava, boost timer)
- View-direction velocity calculated from player rotation
- Pitch-based speed: looking up = slower, level = normal, looking down = faster
- Firework rockets apply 3x impulse + 6-tick boost period
- 5-tick (0.25s) rocket cooldown prevents spam

## What you lose

- **Gliding animation**: Engine cancels it; player sees swimming animation in lava
- **Vanilla drag model**: Momentum decay differs from real Elytra flight
- **Fall damage protection**: High falls into lava still burn (fire damage applies normally)

## Installation

1. Copy `elytra_in_lava/` folder to:
   ```
   %LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\
   ```
2. Activate under world's **Behavior Packs** settings.

## Testing

**Syntax validation:**
```bash
python -c "import json; json.load(open('elytra_in_lava/manifest.json'))"
node --check elytra_in_lava/scripts/main.js
```

**In-game test matrix:**
1. Equip Elytra + firework rockets
2. Glide into lava from above -> maintains momentum
3. Use rocket while in lava -> boosts forward
4. Fly out of lava -> resumes normal gliding
5. Enter lava without gliding -> normal lava swimming (no auto-flight)
6. Multiplayer: only Elytra-wearers affected
7. Death/respawn in lava -> clean state reset
8. Nether portal transition -> clean state reset

## Requirements

- Minecraft Bedrock 1.20.40+ (min_engine_version [1, 26, 40])
- `@minecraft/server` 2.9.0
- No experimental toggles, no beta APIs, no cheats required

## Known issues

- Velocity equilibrium depends on lava drag; may feel slightly different from Java
- Very steep dives in lava can exceed intended speed (pitch multiplier caps at 0.35)
- Rocket boost stacks with per-tick impulse for 6 ticks; can be tuned if needed

## License

MIT
