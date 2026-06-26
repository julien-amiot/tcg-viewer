const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env file
const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const eqIndex = line.indexOf('=');
  if (eqIndex === -1) return;
  const key = line.substring(0, eqIndex).trim();
  const value = line.substring(eqIndex + 1).trim();
  process.env[key] = value;
});

// Run sonar-analyze.ts with tsx
execSync(`npx tsx scripts/sonar-analyze.ts`, { stdio: 'inherit' });