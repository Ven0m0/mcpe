#Requires -Version 5.1
<#
.SYNOPSIS
  Packages each pack folder into its .mcaddon or .mcpack archive.
.DESCRIPTION
  Zips each pack folder with 7-Zip. Behavior packs (silk_touch_drop,
  no_bat_spawn) are zipped as .mcaddon, with the pack folder itself as the
  zip root - Minecraft's multi-pack addon format. quiet_ravager is zipped as
  .mcpack, with the folder's contents (not the folder) at the zip root -
  Minecraft's single-pack format.
.EXAMPLE
  .\Build-McAddon.ps1
  Rebuilds silk_touch_drop.mcaddon, no_bat_spawn.mcaddon, and
  quiet_ravager.mcpack at the repo root.
#>
[CmdletBinding(SupportsShouldProcess)]
param ()

$ErrorActionPreference = 'Stop'

$sevenZip = 'C:\Program Files\7-Zip\7z.exe'
$packs = @(
  @{ Name = 'silk_touch_drop'; Extension = 'mcaddon' }
  @{ Name = 'no_bat_spawn'; Extension = 'mcaddon' }
  @{ Name = 'quiet_ravager'; Extension = 'mcpack' }
)

if (-not (Test-Path -Path $sevenZip)) {
  throw "7-Zip not found at $sevenZip"
}

foreach ($pack in $packs) {
  $packDir = Join-Path -Path $PSScriptRoot -ChildPath $pack.Name
  $outputPath = Join-Path -Path $PSScriptRoot -ChildPath "$($pack.Name).$($pack.Extension)"

  if (-not (Test-Path -Path $packDir)) {
    throw "Pack folder not found: $packDir"
  }

  if ((Test-Path -Path $outputPath) -and $PSCmdlet.ShouldProcess($outputPath, 'Remove existing archive')) {
    Remove-Item -Path $outputPath -Force
  }

  if ($PSCmdlet.ShouldProcess($outputPath, 'Create archive')) {
    if ($pack.Extension -eq 'mcpack') {
      # zip contents at the root - no wrapping pack folder inside the archive
      & $sevenZip a -tzip $outputPath (Join-Path -Path $packDir -ChildPath '*') | Out-Null
    } else {
      Push-Location -Path $PSScriptRoot
      try {
        & $sevenZip a -tzip $outputPath $pack.Name | Out-Null
      } finally {
        Pop-Location
      }
    }
    if ($LASTEXITCODE -ne 0) {
      throw "7-Zip exited with code $LASTEXITCODE"
    }
  }

  Write-Verbose -Message "Created $outputPath"
}
