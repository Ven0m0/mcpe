---
name: deploy-dev-pack
description: Mirror ender_chest_drop/ into the Minecraft Bedrock development_behavior_packs folder for manual in-game testing
disable-model-invocation: true
---

# Deploy Dev Pack

Mirrors the behavior pack into Minecraft's development folder so it shows up under a world's Behavior Packs settings.

Run:

```powershell
robocopy "ender_chest_drop" "$env:LOCALAPPDATA\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\ender_chest_drop" /MIR /XD .git
```

Robocopy exit codes 0-7 are success (bitflags for copied/skipped/mismatched files); 8+ means failure.

After deploying, activate the pack in the target world's Behavior Packs settings, then run the manual test matrix in README.md ("Testing" section) — hand/wooden/diamond pickaxe, with/without Silk Touch, creative mode, contents-preserved check.
