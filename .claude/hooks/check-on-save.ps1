#Requires -Version 5.1
# PostToolUse hook: mirrors CI's node --check / json.load on the file just edited.

try {
  $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
} catch {
  exit 0
}

$filePath = $payload.tool_input.file_path
if (-not $filePath) {
  exit 0
}

if ($filePath -match '\.js$') {
  $output = node --check $filePath 2>&1
  $exitCode = $LASTEXITCODE
} elseif ($filePath -match 'manifest\.json$') {
  $output = python -c "import json,sys; json.load(open(sys.argv[1]))" $filePath 2>&1
  $exitCode = $LASTEXITCODE
} else {
  exit 0
}

if ($exitCode -ne 0) {
  [Console]::Error.WriteLine(($output -join "`n"))
  exit 2
}

exit 0
