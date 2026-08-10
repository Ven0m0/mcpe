#Requires -Version 5.1
<#
.SYNOPSIS
  Packages ender_chest_drop/ into ender_chest_drop.mcaddon.
.DESCRIPTION
  Zips the ender_chest_drop behavior pack folder with 7-Zip and renames
  the archive extension to .mcaddon so it can be imported by Minecraft.
.EXAMPLE
  .\Build-McAddon.ps1
  Rebuilds ender_chest_drop.mcaddon at the repo root.
#>
[CmdletBinding(SupportsShouldProcess)]
param ()

$ErrorActionPreference = 'Stop'

$packDir = Join-Path -Path $PSScriptRoot -ChildPath 'ender_chest_drop'
$outputPath = Join-Path -Path $PSScriptRoot -ChildPath 'ender_chest_drop.mcaddon'
$sevenZip = 'C:\Program Files\7-Zip\7z.exe'

if (-not (Test-Path -Path $sevenZip)) {
  throw "7-Zip not found at $sevenZip"
}

if (-not (Test-Path -Path $packDir)) {
  throw "Pack folder not found: $packDir"
}

if ((Test-Path -Path $outputPath) -and $PSCmdlet.ShouldProcess($outputPath, 'Remove existing archive')) {
  Remove-Item -Path $outputPath -Force
}

if ($PSCmdlet.ShouldProcess($outputPath, 'Create mcaddon archive')) {
  Push-Location -Path $PSScriptRoot
  try {
    & $sevenZip a -tzip $outputPath 'ender_chest_drop' | Out-Null
  } finally {
    Pop-Location
  }
  if ($LASTEXITCODE -ne 0) {
    throw "7-Zip exited with code $LASTEXITCODE"
  }
}

Write-Verbose -Message "Created $outputPath"
