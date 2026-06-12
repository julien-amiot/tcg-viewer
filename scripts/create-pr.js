const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Read .env file
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse GITHUB_PAT from .env
const patMatch = envContent.match(/^GITHUB_PAT=(.+)$/m);
if (!patMatch) {
  console.error('ERROR: GITHUB_PAT not found in .env file');
  process.exit(1);
}
const GITHUB_PAT = patMatch[1].trim();

// Git config for repo URL
const repoUrl = execSync('git config --get remote.origin.url').toString().trim();

// Extract owner and repo from URL
const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)\.git$/);
if (!match) {
  console.error('ERROR: Could not extract owner/repo from remote URL:', repoUrl);
  process.exit(1);
}
const [_, owner, repo] = match;

// Branches
const HEAD_BRANCH = 'feat/github-actions-workflows';
const BASE_BRANCH = 'trunk';

// Get the latest commit message for the PR title
const commitMsg = execSync(`git log -1 --pretty=%B ${HEAD_BRANCH}`).toString().trim();
const prTitle = `feat: ${commitMsg}`;

// Get the diff stats for the PR body
const diffStats = execSync(`git diff --stat ${BASE_BRANCH}...${HEAD_BRANCH}`).toString().trim();

// Build PR description
const prBody = [
  '## Description',
  commitMsg,
  '',
  '## Changes Summary',
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

// PR payload
const prData = {
  title: prTitle,
  body: prBody,
  head: HEAD_BRANCH,
  base: BASE_BRANCH
};

console.log(`Creating PR: ${HEAD_BRANCH} -> ${BASE_BRANCH}`);
console.log(`Title: ${prTitle}`);

// Use Node.js https module to avoid shell escaping issues
const postData = JSON.stringify(prData);

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${owner}/${repo}/pulls`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_PAT}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Node.js'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const pr = JSON.parse(data);

      if (pr.errors) {
        console.error('ERROR creating PR:', JSON.stringify(pr.errors, null, 2));
        process.exit(1);
      }

      console.log('\n✅ PR created successfully!');
      console.log(`Number: #${pr.number}`);
      console.log(`URL: ${pr.html_url}`);
      console.log(`State: ${pr.state}`);
    } catch (e) {
      console.error('ERROR parsing response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR creating PR:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();