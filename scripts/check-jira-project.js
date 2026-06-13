const https = require('https');
const JIRA_TOKEN = 'ATATT3xFfGF0AdsBmtsUOCE1cYYNAhHeL9vhcf7hKAJmNBS02ocPx2FJpD39sj9Gi0eU7JZJM2ZYvkNBwb9MSNNh4ssAW1K4KQizNbDhlLkqWCjno9k_nQlVbrP-UvVuuqxb6bGpOuPzzhMxXrOKCUinkVws5048di6BWzr2qHuo8JRmT3pWrY4=25265C3E';

const options = {
  hostname: 'cairnworks.atlassian.net',
  path: '/rest/api/3/project/TCGV',
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