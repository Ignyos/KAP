[CmdletBinding()]
param(
  [switch]$WhatIfMode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $PSCommandPath
$docsDir = Join-Path $scriptDir 'docs'

if (-not (Test-Path -LiteralPath $docsDir)) {
  Write-Host "docs/ directory does not exist. Nothing to clean." -ForegroundColor Yellow
  return
}

$children = Get-ChildItem -LiteralPath $docsDir -Force
if ($children.Count -eq 0) {
  Write-Host "docs/ directory is already empty." -ForegroundColor Yellow
  return
}

foreach ($child in $children) {
  if ($WhatIfMode) {
    Write-Host "[WhatIf] Would remove $($child.FullName)" -ForegroundColor Yellow
  }
  else {
    Remove-Item -LiteralPath $child.FullName -Recurse -Force
  }
}

if ($WhatIfMode) {
  Write-Host '[WhatIf] Clean completed.' -ForegroundColor Yellow
}
else {
  Write-Host 'Clean completed. docs/ directory is now empty.' -ForegroundColor Green
}
