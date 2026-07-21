# One-click "push & publish" for Udaan24.
#   Usage:  ./publish.ps1 "your commit message"
#   - commits any local changes, pushes to GitHub (main)
#   - GitHub Actions then auto-deploys to the VPS (udaan24.com)
#
# If there are no local changes, it still triggers a fresh deploy of the
# current code.
param([string]$m = "update")

$ErrorActionPreference = "Stop"

git add -A
$staged = git diff --cached --name-only
if ($staged) {
  git commit -m $m
  git push origin main
  Write-Host "`nPushed changes. Deploying to udaan24.com ..." -ForegroundColor Green
} else {
  git push origin main 2>$null
  Write-Host "`nNo new changes - triggering a redeploy of current code ..." -ForegroundColor Yellow
  gh workflow run deploy.yml
}

Write-Host "Watch progress: https://github.com/2026Pacewalk/udaan24/actions" -ForegroundColor Cyan
