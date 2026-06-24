const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// GitHub credentials from environment variables
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'julien-amiot';
const GITHUB_REPO = process.env.GITHUB_REPO || 'tcg-viewer';
const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

if (!GITHUB_PAT) {
  console.error('ERROR: GITHUB_PAT environment variable is required');
  process.exit(1);
}

// Git config for repo URL (fallback if owner/repo not in env)
let owner = GITHUB_OWNER;
let repo = GITHUB_REPO;

try {
  const repoUrl = execSync('git config --get remote.origin.url').toString().trim();
  const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)\.git$/);
  if (match) {
    owner = match[1];
    repo = match[2];
  }
} catch (e) {
  // Use env values if git config fails
}

// Branches
const HEAD_BRANCH = execSync('git branch --show-current').toString().trim();
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
  hostname: GITHUB_API_URL.replace('https://', '').replace('http://', ''),
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