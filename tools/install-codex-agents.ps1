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
    throw 'Refusing to install agent profiles into a drive root.'
}

function Test-ReparsePoint([string]$LiteralPath) {
    if (-not (Test-Path -LiteralPath $LiteralPath)) { return $false }
    $item = Get-Item -Force -LiteralPath $LiteralPath
    return (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)
}

if (Test-ReparsePoint $targetFullPath) {
    throw 'Refusing to install through a project directory symlink or junction.'
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
        throw 'Refusing to install project roles inside the global Codex profile.'
    }
}
if (Test-ReparsePoint $targetCodexDirectory) {
    throw 'Refusing to install through a project .codex symlink or junction.'
}
if (Test-ReparsePoint $targetAgentDirectory) {
    throw 'Refusing to install through a project agent-directory symlink or junction.'
}

$catalog = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'catalog\components.json') | ConvertFrom-Json
$agents = @($catalog.components | Where-Object { $_.kind -eq 'agent' -and $_.status -eq 'included' })
if ($agents.Count -eq 0) {
    throw 'No included Codex agent profiles are recorded in the component catalog.'
}

$copyPlan = foreach ($agent in $agents) {
    $relativeSource = [string]$agent.destination
    if (-not $relativeSource.StartsWith('.codex/agents/', [System.StringComparison]::Ordinal)) {
        throw "Catalog agent destination is outside .codex/agents/: $relativeSource"
    }

    $sourcePath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot ($relativeSource -replace '/', '\')))
    $repoPrefix = $repoRoot.TrimEnd('\') + '\'
    if (-not $sourcePath.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Catalog agent source resolves outside the repository: $relativeSource"
    }
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        throw "Catalog agent source file does not exist: $relativeSource"
    }
    if (Test-ReparsePoint $sourcePath) {
        throw "Catalog agent source is a symlink or junction: $relativeSource"
    }

    $destinationPath = Join-Path $targetAgentDirectory ([System.IO.Path]::GetFileName($sourcePath))
    if (Test-Path -LiteralPath $destinationPath -PathType Leaf) {
        if (Test-ReparsePoint $destinationPath) {
            throw "Existing project agent is a symlink or junction; refusing to follow it: $destinationPath"
        }
        $sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sourcePath).Hash
        $targetHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $destinationPath).Hash
        if ($sourceHash -ne $targetHash) {
            throw "Existing project agent differs from the packaged profile; refusing to overwrite: $destinationPath"
        }
    }

    [pscustomobject]@{
        Source = $sourcePath
        Destination = $destinationPath
        AlreadyInstalled = (Test-Path -LiteralPath $destinationPath -PathType Leaf)
    }
}

$destinationNames = @($copyPlan | ForEach-Object { [System.IO.Path]::GetFileName($_.Destination) })
if (@($destinationNames | Select-Object -Unique).Count -ne $destinationNames.Count) {
    throw 'Catalog agent profiles contain duplicate filenames.'
}

$targetConfigPath = Join-Path $targetFullPath '.codex\config.toml'
$newConfigContent = "[agents]`r`nmax_concurrent_threads_per_session = 2`r`n"
if ((Test-Path -LiteralPath $targetConfigPath) -and -not (Test-Path -LiteralPath $targetConfigPath -PathType Leaf)) {
    throw "Target Codex config path exists and is not a file: $targetConfigPath"
}

if (-not (Test-Path -LiteralPath $targetAgentDirectory -PathType Container)) {
    if ($PSCmdlet.ShouldProcess($targetAgentDirectory, 'Create project-scoped Codex agent directory')) {
        New-Item -ItemType Directory -Path $targetAgentDirectory -Force | Out-Null
    }
}

foreach ($item in $copyPlan) {
    if ($item.AlreadyInstalled) {
        Write-Output "Already installed: $($item.Destination)"
        continue
    }
    if ($PSCmdlet.ShouldProcess($item.Destination, 'Copy reviewed Codex agent profile')) {
        Copy-Item -LiteralPath $item.Source -Destination $item.Destination
        Write-Output "Installed: $($item.Destination)"
    }
}

if (-not (Test-Path -LiteralPath $targetConfigPath -PathType Leaf)) {
    if ($PSCmdlet.ShouldProcess($targetConfigPath, 'Create project concurrency cap for Codex agents')) {
        $encoding = [System.Text.UTF8Encoding]::new($false)
        [System.IO.File]::WriteAllText($targetConfigPath, $newConfigContent, $encoding)
        Write-Output "Created concurrency cap: $targetConfigPath"
    }
} else {
    Write-Output "Preserved existing project config: $targetConfigPath"
    if (-not (Select-String -LiteralPath $targetConfigPath -Pattern '^max_concurrent_threads_per_session\s*=\s*\d+\s*$' -Quiet)) {
        Write-Warning 'Review [agents].max_concurrent_threads_per_session in the existing target config; it was not changed.'
    }
}
