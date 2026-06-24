const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env file
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const patMatch = envContent.match(/^GITHUB_PAT=(.+)$/m);
if (!patMatch) {
  console.error('ERROR: GITHUB_PAT not found in .env file');
  process.exit(1);
}
const GITHUB_PAT = patMatch[1].trim();

const { execSync } = require('child_process');

const repoUrl = execSync('git config --get remote.origin.url').toString().trim();
const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)\.git$/);
if (!match) {
  console.error('ERROR: Could not extract owner/repo from remote URL:', repoUrl);
  process.exit(1);
}
const [_, owner, repo] = match;

const HEAD_BRANCH = execSync('git branch --show-current').toString().trim();
const HEAD_COMMIT = execSync('git rev-parse HEAD').toString().trim();
const PARENT_COMMIT = execSync('git rev-parse HEAD^').toString().trim();

// Get diff stats for the current commit only
const diffStats = execSync(`git diff --stat ${PARENT_COMMIT}..${HEAD_COMMIT}`).toString().trim();
const commitMsg = execSync('git log -1 --pretty=%B').toString().trim();

// Build PR description with current commit diff
const prBody = [
  '## Description',
  commitMsg,
  '',
  '## Changes Summary (current commit)',
  '```',
  diffStats,
  '```',
  '',
  '## Checklist',
  '- [ ] SonarQube quality gate passes',
  '- [ ] Unit tests pass',
  '- [ ] E2E tests pass',
  '- [ ] Code reviewed',
  ''
].join('\n');

// PR number (hardcoded for current PR)
const prNumber = 13;

console.log(`Updating PR #${prNumber} body...`);

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${owner}/${repo}/pulls/${prNumber}`,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_PAT}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Node.js'
  }
};

const patchData = { body: prBody };
const postData = JSON.stringify(patchData);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.message === 'Unprocessable Entity' || result.message) {
        console.error('ERROR updating PR:', JSON.stringify(result, null, 2));
        process.exit(1);
      }
      console.log('✅ PR body updated successfully!');
      console.log(`URL: ${result.html_url}`);
    } catch (e) {
      console.error('ERROR parsing response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR updating PR:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();