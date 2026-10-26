[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TargetPath
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$targetFullPath = [System.IO.Path]::GetFullPath($TargetPath).TrimEnd('\')

if (-not (Test-Path -LiteralPath $targetFullPath -PathType Container)) {
    throw "Target project directory does not exist: $targetFullPath"
}

$driveRoot = [System.IO.Path]::GetPathRoot($targetFullPath).TrimEnd('\')
if ($targetFullPath.Equals($driveRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Refusing to remove agent profiles from a drive root.'
}

function Test-ReparsePoint([string]$LiteralPath) {
    if (-not (Test-Path -LiteralPath $LiteralPath)) { return $false }
    $item = Get-Item -Force -LiteralPath $LiteralPath
    return (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)
}

if (Test-ReparsePoint $targetFullPath) {
    throw 'Refusing to remove profiles through a project directory symlink or junction.'
}

$targetAgentDirectory = Join-Path $targetFullPath '.codex\agents'
$targetCodexDirectory = Join-Path $targetFullPath '.codex'
$protectedRoots = @()
if ($env:USERPROFILE) {
    $protectedRoots += Join-Path $env:USERPROFILE '.codex'
}
if ($env:CODEX_HOME) {
    $protectedRoots += $env:CODEX_HOME
}
foreach ($protectedRoot in $protectedRoots) {
    $protectedFullPath = [System.IO.Path]::GetFullPath($protectedRoot).TrimEnd('\')
    $protectedPrefix = $protectedFullPath + '\'
    $targetsGlobalProfile = @($targetFullPath, $targetAgentDirectory) | Where-Object {
        $_.Equals($protectedFullPath, [System.StringComparison]::OrdinalIgnoreCase) -or
        $_.StartsWith($protectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)
    }
    if ($targetsGlobalProfile.Count -gt 0) {
        throw 'Refusing to remove project profiles from inside the global Codex profile.'
    }
}
if (Test-ReparsePoint $targetCodexDirectory) {
    throw 'Refusing to remove profiles through a project .codex symlink or junction.'
}
if (Test-ReparsePoint $targetAgentDirectory) {
    throw 'Refusing to remove profiles through a project agent-directory symlink or junction.'
}

$catalog = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'catalog\components.json') | ConvertFrom-Json
$agents = @($catalog.components | Where-Object { $_.kind -eq 'agent' -and $_.status -eq 'included' })

foreach ($agent in $agents) {
    $relativeSource = [string]$agent.destination
    if (-not $relativeSource.StartsWith('.codex/agents/', [System.StringComparison]::Ordinal)) {
        throw "Catalog agent destination is outside .codex/agents/: $relativeSource"
    }

    $sourcePath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot ($relativeSource -replace '/', '\')))
    $repoPrefix = $repoRoot.TrimEnd('\') + '\'
    if (-not $sourcePath.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Catalog agent source resolves outside the repository: $relativeSource"
    }
    if (Test-ReparsePoint $sourcePath) {
        throw "Catalog agent source is a symlink or junction: $relativeSource"
    }
    $targetPath = Join-Path $targetAgentDirectory ([System.IO.Path]::GetFileName($sourcePath))
    if (-not (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
        Write-Output "Not present: $targetPath"
        continue
    }
    if (Test-ReparsePoint $targetPath) {
        Write-Warning "Preserved symlinked project agent: $targetPath"
        continue
    }

    $sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sourcePath).Hash
    $targetHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $targetPath).Hash
    if ($sourceHash -ne $targetHash) {
        Write-Warning "Preserved modified project agent: $targetPath"
        continue
    }

    if ($PSCmdlet.ShouldProcess($targetPath, 'Remove unchanged NexoHarness Codex agent profile')) {
        Remove-Item -LiteralPath $targetPath
        Write-Output "Removed: $targetPath"
    }
}

Write-Output 'Project config and directories were preserved.'
