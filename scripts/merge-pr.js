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

const args = process.argv.slice(2);
const prNumber = args.find(a => a.startsWith('--pr='))?.split('=')[1];
if (!prNumber) {
  console.error('Usage: node scripts/merge-pr.js --pr=<number> [message]');
  process.exit(1);
}

// Default commit message if not provided
const defaultMsg = `Merge pull request #${prNumber} from feat/github-actions-workflows`;
const msg = args.filter(a => !a.startsWith('--pr='))[0] || defaultMsg;

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${owner}/${repo}/pulls/${prNumber}/merge`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_PAT}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Node.js'
  }
};

const body = JSON.stringify({ merge_method: 'merge', commit_message: msg });

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.message === 'Merge conflict.') {
        console.error('ERROR: Merge conflict. Please resolve manually.');
        process.exit(1);
      }
      console.log(result.message || 'PR merged successfully!');
      console.log(`URL: ${result.url}`);
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

req.write(body);
req.end();