const https = require('https');

// Load Jira credentials from environment variables
const JIRA_URL = process.env.JIRA_URL;
const JIRA_TOKEN = process.env.JIRA_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

if (!JIRA_TOKEN) {
  console.error('ERROR: JIRA_TOKEN environment variable is required');
  process.exit(1);
}

if (!JIRA_URL) {
  console.error('ERROR: JIRA_URL environment variable is required');
  process.exit(1);
}

const options = {
  hostname: JIRA_URL.replace('https://', ''),
  path: `/rest/api/3/project/${JIRA_PROJECT_KEY}`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${Buffer.from(`:${JIRA_TOKEN}`).toString('base64')}`,
    'Accept': 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', data);
  });
});
req.on('error', console.error);
req.end();