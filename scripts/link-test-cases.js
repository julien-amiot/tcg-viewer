const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Buffer } = require('buffer');

// Read Jira credentials from MCP settings
const mcpSettings = JSON.parse(fs.readFileSync('C:/Users/amiot/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json', 'utf8'));
const jiraMcp = mcpSettings.mcpServers.jira;

const jira = axios.create({
  baseURL: jiraMcp.env.JIRA_URL,
  headers: { 
    Accept: 'application/json', 
    'Content-Type': 'application/json', 
    'X-Atlassian-Token': 'no-check',
    'Authorization': 'Basic ' + Buffer.from(jiraMcp.env.JIRA_EMAIL + ':' + jiraMcp.env.JIRA_TOKEN).toString('base64'),
  },
});

async function link(tc, parent) {
  try {
    const res = await jira.patch('/rest/api/3/issue/' + tc, { fields: { parent: { key: parent } } });
    console.log('Linked ' + tc + ' -> ' + parent);
  } catch (e) {
    const msg = e.response?.data?.errorMessages ? e.response.data.errorMessages.join(', ') : e.message;
    console.error('Failed to link ' + tc + ': ' + msg);
  }
}

async function main() {
  // card-grid feature -> TCGV-5
  await link('TCGV-8', 'TCGV-5');
  await link('TCGV-9', 'TCGV-5');
  await link('TCGV-10', 'TCGV-5');
  await link('TCGV-11', 'TCGV-5');
  await link('TCGV-12', 'TCGV-5');

  // set-selector feature -> TCGV-6
  await link('TCGV-13', 'TCGV-6');
  await link('TCGV-14', 'TCGV-6');

  // custom-card-sets feature -> TCGV-7
  await link('TCGV-15', 'TCGV-7');
  await link('TCGV-16', 'TCGV-7');
  await link('TCGV-17', 'TCGV-7');
  await link('TCGV-18', 'TCGV-7');
  await link('TCGV-19', 'TCGV-7');

  console.log('Done');
}

main();