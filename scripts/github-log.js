const fs = require('fs');
const path = require('path');
const https = require('https');

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
const { execSync } = require('child_process');
const repoUrl = execSync('git config --get remote.origin.url').toString().trim();

// Extract owner and repo from URL
const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)\.git$/);
if (!match) {
  console.error('ERROR: Could not extract owner/repo from remote URL:', repoUrl);
  process.exit(1);
}
const [_, owner, repo] = match;

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
  hostname: 'api.github.com',
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