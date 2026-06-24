# Test-Connections.ps1
# Tests connectivity to GitHub, SonarQube, and Jira.
# Priority for secrets:
#   1. Project-level .env (overrides user-level)
#   2. User-level ~/.env (default secrets)

$projectEnv = ".env"
$userEnv = "$env:USERPROFILE\.env"

if (-not (Test-Path $userEnv)) {
    Write-Host "[ERROR] Neither project .env nor user-level .env ($userEnv) found."
    exit 1
}

# Load secrets from available .env files
function Load-Env($file) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content -split "`n" | ForEach-Object {
            $line = $_.Trim()
            if ($line -match '^([A-Z_]+)=(.+)$') {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim())
            }
        }
    }
}

# User-level .env (base secrets)
Load-Env $userEnv

# Project-level .env (overrides user-level)
if (Test-Path $projectEnv) {
    Load-Env $projectEnv
}

$hasErrors = $false

# --- GitHub ---
Write-Host "`n=== GitHub ==="
$githubUrl = "https://api.github.com/user"
try {
    $response = Invoke-RestMethod -Uri $githubUrl -Headers @{ Authorization = "Bearer $env:GITHUB_PAT" } -ErrorAction Stop
    Write-Host "[OK] GitHub connected as: $($response.login) ($($response.html_url))"
} catch {
    Write-Host "[FAIL] GitHub connection failed: $_"
    $hasErrors = $true
}

# --- SonarQube ---
Write-Host "`n=== SonarQube ==="
$sonarHostUrl = $env:SONAR_HOST_URL -or "http://localhost:9000"
$sonarUrl = "$sonarHostUrl/api/system/status"
try {
    $response = Invoke-RestMethod -Uri $sonarUrl -Headers @{ Authorization = "Bearer $env:SONAR_TOKEN" } -ErrorAction Stop
    Write-Host "[OK] SonarQube running: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host "[FAIL] SonarQube not reachable at $sonarHostUrl (is Docker Desktop running?)"
    $hasErrors = $true
}

# --- Jira ---
Write-Host "`n=== Jira ==="
if ($env:JIRA_URL) {
    $jiraUrl = "$env:JIRA_URL/rest/api/2/myself"
    try {
        $response = Invoke-RestMethod -Uri $jiraUrl -Headers @{ Authorization = "Bearer $env:JIRA_TOKEN" } -ErrorAction Stop
        Write-Host "[OK] Jira connected as: $($response.displayName) ($($response.key))"
    } catch {
        Write-Host "[FAIL] Jira connection failed: $_"
        $hasErrors = $true
    }
} else {
    Write-Host "[SKIP] JIRA_URL not set in .env"
}

# --- Summary ---
if ($hasErrors) {
    Write-Host "`n[RESULT] Some connections failed. Check above."
    exit 1
} else {
    Write-Host "`n[RESULT] All connections successful."
    exit 0
}