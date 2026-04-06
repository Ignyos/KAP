[CmdletBinding()]
param(
  [switch]$WhatIfMode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Clear-Directory {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [switch]$WhatIfMode
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  $children = Get-ChildItem -LiteralPath $Path -Force
  foreach ($child in $children) {
    if ($WhatIfMode) {
      Write-Host "[WhatIf] Would remove $($child.FullName)" -ForegroundColor Yellow
      continue
    }

    Remove-Item -LiteralPath $child.FullName -Recurse -Force
  }
}

function Copy-DirectoryContents {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Source,
    [Parameter(Mandatory = $true)]
    [string]$Destination,
    [switch]$WhatIfMode
  )

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Source path not found: $Source"
  }

  if (-not (Test-Path -LiteralPath $Destination)) {
    if ($WhatIfMode) {
      Write-Host "[WhatIf] Would create directory $Destination" -ForegroundColor Yellow
    }
    else {
      New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
  }

  $items = Get-ChildItem -LiteralPath $Source -Force
  foreach ($item in $items) {
    $targetPath = Join-Path $Destination $item.Name
    if ($WhatIfMode) {
      Write-Host "[WhatIf] Would copy $($item.FullName) to $targetPath" -ForegroundColor Yellow
      continue
    }

    Copy-Item -LiteralPath $item.FullName -Destination $targetPath -Recurse -Force
  }
}

$scriptDir = Split-Path -Parent $PSCommandPath
$sourceDir = Join-Path $scriptDir 'src'
$docsDir = Join-Path $scriptDir 'docs'
$cnameSource = Join-Path $scriptDir 'CNAME'

if (-not (Test-Path -LiteralPath $sourceDir)) {
  throw "Required source directory not found: $sourceDir"
}

if (-not (Test-Path -LiteralPath $docsDir)) {
  if ($WhatIfMode) {
    Write-Host "[WhatIf] Would create directory $docsDir" -ForegroundColor Yellow
  }
  else {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
  }
}

Clear-Directory -Path $docsDir -WhatIfMode:$WhatIfMode
Copy-DirectoryContents -Source $sourceDir -Destination $docsDir -WhatIfMode:$WhatIfMode

if (Test-Path -LiteralPath $cnameSource) {
  $cnameDestination = Join-Path $docsDir 'CNAME'
  if ($WhatIfMode) {
    Write-Host "[WhatIf] Would copy $cnameSource to $cnameDestination" -ForegroundColor Yellow
  }
  else {
    Copy-Item -LiteralPath $cnameSource -Destination $cnameDestination -Force
  }
}

# Future build hook: add minification or asset processing here before deployment.

if ($WhatIfMode) {
  Write-Host '[WhatIf] Build completed.' -ForegroundColor Yellow
}
else {
  Write-Host 'Build completed. Static assets copied to docs.' -ForegroundColor Green
}