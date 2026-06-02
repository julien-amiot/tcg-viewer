#!/usr/bin/env bash
# Pre-push hook: enforces lines-of-change limit + SonarQube quality gate
# Install: copy to .git/hooks/pre-push and chmod +x

MAX_LINES=300

# --- 1. Lines-of-change gate ---
echo "[pre-push] Checking lines of change..."

# Determine the remote tracking branch
remote="$1"

# Get the upstream ref for comparison
upstream=$(git rev-parse --verify @{push} 2>/dev/null || git rev-parse --verify "$remote/HEAD" 2>/dev/null || echo "")

if [ -z "$upstream" ]; then
  # No upstream to compare against (first push), allow
  echo "[pre-push] No upstream branch found, skipping lines check."
else
  diff_lines=$(git diff --shortstat "${upstream}..HEAD" | grep -oP '\d+(?= insertion)' || echo "0")
  deletions=$(git diff --shortstat "${upstream}..HEAD" | grep -oP '\d+(?= deletion)' || echo "0")

  # Handle missing values (no changes)
  diff_lines=${diff_lines:-0}
  deletions=${deletions:-0}

  total=$((diff_lines + deletions))

  if [ "$total" -gt "$MAX_LINES" ]; then
    echo "[pre-push] FAILED: ${total} lines changed exceeds the ${MAX_LINES}-line limit."
    echo "[pre-push] Please split your changes into smaller commits."
    exit 1
  fi

  echo "[pre-push] OK: ${total} lines changed (limit: ${MAX_LINES})."
fi

# --- 2. SonarQube quality gate ---
echo "[pre-push] Checking SonarQube availability..."

# Load SONAR_TOKEN from .env if present
SONAR_TOKEN=""
if [ -f .env ]; then
  SONAR_TOKEN=$(grep '^SONAR_TOKEN=' .env | cut -d'=' -f2-)
fi

if curl -s --max-time 5 http://localhost:9000 > /dev/null 2>&1; then
  echo "[pre-push] Running SonarQube analysis..."

  if [ -z "$SONAR_TOKEN" ]; then
    echo "[pre-push] FAILED: SONAR_TOKEN not found in .env file."
    exit 1
  fi

  if ! command -v npx &> /dev/null; then
    echo "[pre-push] WARNING: npx not found, skipping SonarQube check."
  else
    # Run the scan (uses sonarqube-scanner via npx)
    if npx sonarqube-scanner --define "sonar.token=$SONAR_TOKEN" 2>&1; then
      echo "[pre-push] SonarQube analysis completed successfully."
    else
      echo "[pre-push] FAILED: SonarQube quality gate did not pass."
      exit 1
    fi
  fi
else
  echo "[pre-push] WARNING: SonarQube not reachable at localhost:9000, skipping quality gate."
fi

echo "[pre-push] All checks passed. Push allowed."
exit 0
