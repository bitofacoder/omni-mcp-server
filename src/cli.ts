#!/usr/bin/env node

import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function getClaudeConfigPath() {
  const platform = os.platform();
  const homedir = os.homedir();
  
  if (platform === 'darwin') {
    return path.join(homedir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux or others
    return path.join(homedir, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

async function runSetup() {
  console.log(chalk.bold.blue('\n🚀 Welcome to the Omni MCP Server Setup! 🚀\n'));
  console.log(chalk.gray('This wizard will automatically configure your local Claude Desktop to use Omni.\n'));

  const githubToken = await input({
    message: 'Enter your GitHub Personal Access Token (or leave blank to skip):',
  });

  const slackToken = await input({
    message: 'Enter your Slack Bot Token (or leave blank to skip):',
  });

  const agentMode = await confirm({
    message:
      'Enable Agent Mode? (lets the AI run shell commands and write files on this machine)',
    default: false,
  });

  const configPath = await getClaudeConfigPath();
  const configDir = path.dirname(configPath);

  // Ensure config directory exists
  try {
    await fs.mkdir(configDir, { recursive: true });
  } catch (error) {
    console.error(chalk.red(`Failed to create config directory at ${configDir}`));
    return;
  }

  let config: any = { mcpServers: {} };
  
  try {
    const existingConfig = await fs.readFile(configPath, 'utf-8');
    config = JSON.parse(existingConfig);
    if (!config.mcpServers) config.mcpServers = {};
  } catch (error: any) {
    // If file doesn't exist or is invalid JSON, we'll just write a new one
    if (error.code !== 'ENOENT') {
      console.log(chalk.yellow(`Warning: Could not parse existing config at ${configPath}. Overwriting.`));
    }
  }

  // Use npx so it auto-downloads/runs anywhere without needing a hardcoded path
  config.mcpServers['omni'] = {
    command: 'npx',
    args: ['-y', '@bitofacoder/omni-mcp-server@latest'],
    env: {
      ...(githubToken ? { GITHUB_PERSONAL_ACCESS_TOKEN: githubToken } : {}),
      ...(slackToken ? { SLACK_BOT_TOKEN: slackToken } : {}),
      ...(agentMode ? { OMNI_AGENT_MODE: 'true' } : {}),
    }
  };

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(chalk.green(`\n✅ Successfully configured Claude Desktop at:`));
    console.log(chalk.gray(configPath));
    console.log(chalk.bold.yellow('\nPlease completely RESTART Claude Desktop for the changes to take effect.\n'));
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Failed to write configuration: ${error.message}`));
  }
}

runSetup().catch(err => {
  console.error(chalk.red('\nSetup failed:'), err);
  process.exit(1);
});
