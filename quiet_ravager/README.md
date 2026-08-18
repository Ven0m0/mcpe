# Quiet Ravager

Resource pack that lowers every vanilla Ravager sound (ambient, hurt, death, step, bite, roar,
stun, raid ambient, celebrate) to 20% volume. Overrides `entity_sounds.entities.ravager` in
`sounds.json` - no models, textures, or behavior are touched.

Independent of [`silk_touch_drop`](../silk_touch_drop) and [`no_bat_spawn`](../no_bat_spawn) -
separate folder, separate manifest, separate UUIDs. Any of the three packs can be applied to a
world without the others, and all can be enabled together.

## Supported Bedrock version

`1.26.44` and newer (`min_engine_version` `[1, 26, 44]`).

## Installation

Copy the `quiet_ravager` folder into your Bedrock `development_resource_packs` directory (or
import it as a `.mcpack`):

```
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\quiet_ravager
```

## Enabling in a world

1. Create or open a world's settings.
2. Under **Resource Packs**, find **Ravager 20% Volume** in the available list and activate it.
3. No behavior pack or experimental toggles are required.

## Testing

```bash
python -c "import json; json.load(open('quiet_ravager/manifest.json'))"
python -c "import json; json.load(open('quiet_ravager/sounds.json'))"
```

Then in-game: spawn or find a Ravager (raid or `/summon minecraft:ravager`) and confirm its
ambient, hurt, step, and roar sounds are noticeably quieter than vanilla.
