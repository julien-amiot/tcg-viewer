import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_HOST_URL = process.env.SONAR_HOST_URL || 'http://localhost:9000';
const SONAR_PROJECT_KEY = process.env.SONAR_PROJECT_KEY;
const DOCKER_COMPOSE_FILE = path.resolve('docker-compose.sonar.yml');
const SONAR_CONTAINER_NAME = process.env.SONAR_CONTAINER_NAME || 'sc-tcg-sonarqube';

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set. Please configure it in your .env file.`);
  }
  return value;
}

function runCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

async function main() {
  console.log('Checking Docker status...');
  try {
    execSync('docker info', { stdio: 'ignore' });
    console.log('Docker is running.');
  } catch {
    console.log('Docker daemon is not running. Attempting to start Docker Desktop...');
    try {
      // Common path for Docker Desktop on Windows
      execSync('start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"', { stdio: 'ignore' });
      console.log('Attempted to start Docker Desktop. Please wait a moment for it to initialize.');
      await new Promise(resolve => setTimeout(resolve, 15000));
    } catch (e) {
      console.log('Could not start Docker Desktop automatically. Please ensure it is running.');
      console.log('Please ensure Docker Desktop is launched. If it is, the script will continue.');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('Checking SonarQube containers...');
  try {
    execSync(`docker ps --filter "name=${SONAR_CONTAINER_NAME}" -q`, { stdio: 'ignore' });
    console.log('SonarQube containers are already running.');
  } catch {
    console.log('Starting SonarQube containers...');
    // Use 'docker compose' as it is a plugin in this environment
    runCommand(`docker compose -f ${DOCKER_COMPOSE_FILE} up -d`);
    
    console.log('Waiting for SonarQube to be fully initialized (this can take 2-5 minutes)...');
    let ready = false;
    // SonarQube takes a long time to start. We'll poll for a much longer period.
    for (let i = 0; i < 120; i++) {
      try {
        const status = execSync(`curl -s ${SONAR_HOST_URL}/api/system/status`, { stdio: 'ignore' });
        if (status.toString().includes('OK')) {
          console.log('SonarQube is ready!');
          ready = true;
          break;
        }
      } catch {
        // If we get a connection refused, it's still booting.
        // If we get something else, it might be partially up but not ready.
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }
    if (!ready) {
      console.error('SonarQube failed to start in time or is not responding.');
      console.log('Current status check:');
      try {
        execSync(`curl -s ${SONAR_HOST_URL}/api/system/status`, { stdio: 'inherit' });
      } catch {
        console.log('SonarQube is still unreachable.');
      }
      console.log(`Please check the logs: docker logs ${SONAR_CONTAINER_NAME}`);
      process.exit(1);
    }
  }

  const token = SONAR_TOKEN || getRequiredEnvVar('SONAR_TOKEN');
  
  // Determine project key
  let projectKey = SONAR_PROJECT_KEY;
  if (!projectKey) {
    try {
      const props = fs.readFileSync('sonar-project.properties', 'utf8');
      const match = props.match(/sonar\.projectKey=([^ \n\r]+)/);
      if (match) {
        projectKey = match[1];
      }
    } catch (e) {
      // Ignore if file doesn't exist
    }
  }

  if (!projectKey) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, (answer) => {
          resolve(answer);
        });
      });
    };

    console.log('Could not determine SonarQube project key from environment or sonar-project.properties.');
    projectKey = await askQuestion('Please enter the SonarQube project key: ');
    
    if (!projectKey || projectKey.trim() === '') {
      console.error('Project key is required.');
      process.exit(1);
    }
    projectKey = projectKey.trim();
    rl.close();
  }

  console.log(`Running SonarQube analysis for project: ${projectKey}`);
  
  // We use npx to ensure sonar-scanner is available
  // We pass the token and project key via environment variables
  process.env.SONAR_TOKEN = token;
  process.env.SONAR_PROJECT_KEY = projectKey;
  
  // Added a small delay just in case the port is bound but the service isn't fully ready to accept scanner connections
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  runCommand('npx sonar-scanner');

  console.log('Analysis complete. Fetching issues...');
  
  try {
    // Fetch issues from SonarQube API
    // We need to use the SONAR_TOKEN for authentication
    const issuesUrl = `${SONAR_HOST_URL}/api/issues/search?project=${projectKey}&sources=src`;
    const response = execSync(`curl -s -H "Authorization: Bearer ${token}" ${issuesUrl}`, { encoding: 'utf8' });
    
    const issues = JSON.parse(response);
    if (issues.issues && issues.issues.length > 0) {
      console.log(`Found ${issues.issues.length} issues:`);
      issues.issues.forEach((issue: any, index: number) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.message} (File: ${issue.component.path})`);
      });
    } else {
      console.log('No issues found.');
    }
  } catch (e) {
    console.error('Failed to fetch issues from SonarQube API. You might need to check the dashboard manually.');
    console.error(e);
  }

  console.log('Analysis complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});