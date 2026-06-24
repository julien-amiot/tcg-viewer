// Jira credentials from environment variables
const https = require('https');
const JIRA_URL = process.env.JIRA_URL || 'https://cairnworks.atlassian.net';
const JIRA_TOKEN = process.env.JIRA_TOKEN;

if (!JIRA_TOKEN) {
  console.error('ERROR: JIRA_TOKEN environment variable is required');
  process.exit(1);
}

const options = {
  hostname: JIRA_URL.replace('https://', ''),
  path: '/rest/api/3/project/search?maxResults=100',
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
    try {
      const projects = JSON.parse(data);
      console.log(`Found ${projects.length} projects:\n`);
      projects.forEach(p => {
        console.log(`  ${p.key} - ${p.name} (${p.id}) [${p.projectTypeKey}]`);
      });
    } catch (e) {
      console.error('Error:', data);
    }
  });
});
req.on('error', console.error);
req.end();