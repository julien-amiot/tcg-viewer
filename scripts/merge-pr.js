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

// Parse arguments
const args = process.argv.slice(2);
const prNumber = args.find(a => a.startsWith('--pr='))?.split('=')[1];

if (!prNumber) {
  console.error('Usage: node scripts/merge-pr.js --pr=<number> [--delete-branch]');
  process.exit(1);
}

const deleteBranch = args.includes('--delete-branch');

const options = {
  hostname: GITHUB_API_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: `/repos/${owner}/${repo}/pulls/${prNumber}/merge`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_PAT}`,
    'X-GitHub-Api-Version': '2022-11-28',
  },
};

const mergeData = JSON.stringify({
  merge_method: 'squash',
  commit_title: `Merge pull request #${prNumber}`,
  commit_message: `Merged in ${repo}: #${prNumber} from ${owner}`,
  ...(deleteBranch && { delete_branch_after_merge: true }),
});

console.log(`Merging PR #${prNumber}...`);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ PR merged successfully!');
        console.log(`URL: https://github.com/${owner}/${repo}/pull/${prNumber}`);
      } else {
        console.error(`ERROR merging PR (HTTP ${res.statusCode}):`, data);
        process.exit(1);
      }
    } catch (e) {
      console.error('ERROR parsing response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR merging PR:', error.message);
  process.exit(1);
});

req.write(mergeData);
req.end();