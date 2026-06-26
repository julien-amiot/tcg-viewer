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

const SONAR_HOST_URL = process.env.SONAR_HOST_URL;
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const projectKey = 'sc-tcg-card-view';

if (!SONAR_TOKEN || !SONAR_HOST_URL) {
  console.error('ERROR: SONAR_TOKEN and SONAR_HOST_URL required');
  process.exit(1);
}

// Fetch quality gate status and issues
try {
  const url = `${SONAR_HOST_URL}/api/issues/search?projectKey=${projectKey}&newSinceLeakDate=now&ps=500`;
  const response = execSync(`curl -s -H "Authorization: Bearer ${SONAR_TOKEN}" "${url}"`, { encoding: 'utf8' });
  const data = JSON.parse(response);

  if (data.issues && data.issues.length > 0) {
    console.log(`Found ${data.issues.length} issues:`);
    data.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity}] ${issue.message}`);
      console.log(`   File: ${issue.component.path}:${issue.line || 'N/A'}`);
      console.log(`   Type: ${issue.type} | Status: ${issue.status}`);
      console.log('');
    });
  } else {
    console.log('No issues found.');
  }

  // Also fetch quality gate status
  const qgUrl = `${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=${projectKey}`;
  try {
    const qgResponse = execSync(`curl -s -H "Authorization: Bearer ${SONAR_TOKEN}" "${qgUrl}"`, { encoding: 'utf8' });
    const qgData = JSON.parse(qgResponse);
    console.log('\nQuality Gate Status:', qgData.projectStatus?.status || 'Unknown');
  } catch (e) {
    // Ignore quality gate fetch errors
  }
} catch (e) {
  console.error('Failed to fetch issues from SonarQube API.');
  console.error(e.message);
}