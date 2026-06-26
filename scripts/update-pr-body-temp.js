const fs = require('fs');
const { execSync } = require('child_process');

// Simple .env parser
function parseEnvFile(path) {
  const content = fs.readFileSync(path, 'utf-8');
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const env = parseEnvFile('.env');
const { GITHUB_PAT } = env;

// Get owner/repo from git
const repoUrl = execSync('git config --get remote.origin.url').toString().trim();
const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)\.git$/);
const owner = match[1];
const repo = match[2];

const prNumber = process.argv[2] || '16';

// Generate body from git log
const log = execSync('git log trunk..HEAD --pretty=format:"%h %s"').toString();
const diff = execSync('git diff trunk --stat').toString();

const body = `## Changes

**Commit(s):**
\`\`\`
${log}
\`\`\`

**Diff:**
\`\`\`
${diff}
\`\`\`
`;

const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
const options = {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${GITHUB_PAT}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'tcg-viewer',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ body })
};

fetch(url, options)
  .then(r => r.json().then(data => {
    if (data.errors) {
      console.error('ERROR:', JSON.stringify(data.errors, null, 2));
      process.exit(1);
    }
    console.log('PR body updated!');
    console.log(`URL: ${data.html_url}`);
  }))
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });