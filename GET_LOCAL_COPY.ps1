# Save/run this in PowerShell to put the full CueClose repo on your PC.
# Target: C:\local\CueClose

$ErrorActionPreference = "Stop"
$target = "C:\local\CueClose"
$repo = "https://github.com/aurelius-in/CueClose.git"

New-Item -ItemType Directory -Force -Path "C:\local" | Out-Null

if (Test-Path (Join-Path $target ".git")) {
  Write-Host "Repo exists. Pulling latest main..."
  Set-Location $target
  git fetch origin
  git checkout main
  git pull origin main
} elseif ((Test-Path $target) -and (Get-ChildItem $target -Force | Where-Object { $_.Name -ne '.' -and $_.Name -ne '..' })) {
  Write-Host "Folder exists with files but is not a git repo. Cloning into temp then merging..."
  $temp = Join-Path $env:TEMP ("CueClose-" + [guid]::NewGuid().ToString("N"))
  git clone --branch main $repo $temp
  # Keep any existing local-only files (e.g. logos), overwrite tracked project files from clone
  Copy-Item -Path (Join-Path $temp "*") -Destination $target -Recurse -Force
  if (Test-Path (Join-Path $temp ".git")) {
    Copy-Item -Path (Join-Path $temp ".git") -Destination $target -Recurse -Force
  }
  Remove-Item -Recurse -Force $temp
  Set-Location $target
} else {
  Write-Host "Cloning fresh into $target ..."
  git clone --branch main $repo $target
  Set-Location $target
}

Write-Host ""
Write-Host "Done. Key paths:"
Write-Host "  $target"
Write-Host "  $target\email-to-patrick\"
Write-Host "  $target\docs\interview\architecture-proposal.pdf"
Write-Host "  $target\docs\interview\walkthrough-script.md"
Write-Host "  $target\web\   (run: cd web; npm install; npm run build; npm run start -- --port 3847)"
explorer $target
