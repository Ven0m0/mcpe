#Requires -Version 5.1
# PreToolUse hook: blocks hand-edits to built .mcaddon/.mcpack artifacts.

try {
  $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
} catch {
  exit 0
}

$filePath = $payload.tool_input.file_path
if ($filePath -match '\.(mcaddon|mcpack)$') {
  [Console]::Error.WriteLine("$filePath is a build artifact zipped by the release workflow. Edit the pack source folder instead.")
  exit 2
}

exit 0
