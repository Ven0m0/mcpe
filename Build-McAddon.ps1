#Requires -Version 5.1
<#
.SYNOPSIS
  Packages each behavior pack folder into its own .mcaddon.
.DESCRIPTION
  Zips ender_chest_drop/ and silk_touch_drop/ with 7-Zip and renames the
  archive extension to .mcaddon so each can be imported by Minecraft.
.EXAMPLE
  .\Build-McAddon.ps1
  Rebuilds ender_chest_drop.mcaddon and silk_touch_drop.mcaddon at the repo root.
#>
[CmdletBinding(SupportsShouldProcess)]
param ()

$ErrorActionPreference = 'Stop'

$sevenZip = 'C:\Program Files\7-Zip\7z.exe'
$packNames = 'ender_chest_drop', 'silk_touch_drop'

if (-not (Test-Path -Path $sevenZip)) {
  throw "7-Zip not found at $sevenZip"
}

foreach ($packName in $packNames) {
  $packDir = Join-Path -Path $PSScriptRoot -ChildPath $packName
  $outputPath = Join-Path -Path $PSScriptRoot -ChildPath "$packName.mcaddon"

  if (-not (Test-Path -Path $packDir)) {
    throw "Pack folder not found: $packDir"
  }

  if ((Test-Path -Path $outputPath) -and $PSCmdlet.ShouldProcess($outputPath, 'Remove existing archive')) {
    Remove-Item -Path $outputPath -Force
  }

  if ($PSCmdlet.ShouldProcess($outputPath, 'Create mcaddon archive')) {
    Push-Location -Path $PSScriptRoot
    try {
      & $sevenZip a -tzip $outputPath $packName | Out-Null
    } finally {
      Pop-Location
    }
    if ($LASTEXITCODE -ne 0) {
      throw "7-Zip exited with code $LASTEXITCODE"
    }
  }

  Write-Verbose -Message "Created $outputPath"
}
