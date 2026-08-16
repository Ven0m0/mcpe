#Requires -Version 5.1
# PreToolUse hook: blocks hand-edits to the built .mcaddon artifact.

try {
  $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
} catch {
  exit 0
}

$filePath = $payload.tool_input.file_path
if ($filePath -match '\.mcaddon$') {
  [Console]::Error.WriteLine("$filePath is a build artifact zipped by the release workflow. Edit source under silk_touch_drop/ instead.")
  exit 2
}

exit 0
