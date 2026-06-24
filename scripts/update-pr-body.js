const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// GitHub credentials from environment variables
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API_URL = process.env.GITHUB_API_URL;

if (!GITHUB_PAT) {
  console.error('ERROR: GITHUB_PAT environment variable is required');
  process.exit(1);
}

if (!GITHUB_OWNER) {
  console.error('ERROR: GITHUB_OWNER environment variable is required');
  process.exit(1);
}

if (!GITHUB_REPO) {
  console.error('ERROR: GITHUB_REPO environment variable is required');
  process.exit(1);
}

if (!GITHUB_API_URL) {
  console.error('ERROR: GITHUB_API_URL environment variable is required');
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

// Parse arguments
const args = process.argv.slice(2);
const prNumber = args.find(a => a.startsWith('--pr='))?.split('=')[1];

if (!prNumber) {
  console.error('Usage: node scripts/update-pr-body.js --pr=<number> <body>');
  process.exit(1);
}

const body = args.filter(a => !a.startsWith('--pr='))
  .map(a => a.replace(/^-+/, '').replace(/=/g, ' '))
  .join(' ') || process.argv.slice(2).join(' ');

const prData = JSON.stringify({ body });

const options = {
  hostname: GITHUB_API_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: `/repos/${owner}/${repo}/pulls/${prNumber}`,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_PAT}`,
    'X-GitHub-Api-Version': '2022-11-28',
  },
};

console.log(`Updating PR #${prNumber} body...`);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.errors) {
        console.error('ERROR updating PR:', JSON.stringify(result.errors, null, 2));
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

req.write(prData);
req.end();