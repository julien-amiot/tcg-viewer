const fs = require('fs');
const path = require('path');
const https = require('https');

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
const { execSync } = require('child_process');
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

// Parse arguments
const args = process.argv.slice(2);
const prNumber = args.find(a => a.startsWith('--pr='))?.split('=')[1];
const body = args.filter(a => !a.startsWith('--pr='))
  .map(a => a.replace(/^-+/, '').replace(/=/g, ' '))
  .join(' ') || process.argv.slice(2).join(' ');

if (!prNumber) {
  console.error('Usage: node scripts/github-log.js --pr=<number> <message>');
  process.exit(1);
}

const prData = JSON.stringify({ body });

const options = {
  hostname: GITHUB_API_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
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
      const result = JSON.parse(data);
      if (result.errors) {
        console.error('ERROR posting comment:', JSON.stringify(result.errors, null, 2));
        process.exit(1);
      }
      console.log('Comment posted successfully.');
      console.log(`URL: ${result.html_url}`);
    } catch (e) {
      console.error('ERROR parsing response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR posting comment:', error.message);
  process.exit(1);
});

req.write(prData);
req.end();