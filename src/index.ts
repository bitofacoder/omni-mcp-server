#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getGithubTools, handleGithubToolCall } from './tools/github.js';
import { getSlackTools, handleSlackToolCall } from './tools/slack.js';
import { getSystemTools, handleSystemToolCall } from './tools/system.js';
import { getWebTools, handleWebToolCall } from './tools/web.js';
import { getMemoryTools, handleMemoryToolCall } from './tools/memory.js';
import { getGitTools, handleGitToolCall } from './tools/git.js';

const server = new Server(
  {
    name: 'omni-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...getGithubTools(),
      ...getSlackTools(),
      ...getSystemTools(),
      ...getWebTools(),
      ...getMemoryTools(),
      ...getGitTools(),
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;

  if (toolName.startsWith('github_')) {
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    return await handleGithubToolCall(request, token);
  }

  if (toolName.startsWith('slack_')) {
    const token = process.env.SLACK_BOT_TOKEN;
    return await handleSlackToolCall(request, token);
  }

  if (toolName.startsWith('system_')) {
    return await handleSystemToolCall(request);
  }

  if (toolName.startsWith('web_')) {
    return await handleWebToolCall(request);
  }

  if (toolName.startsWith('memory_')) {
    return await handleMemoryToolCall(request);
  }

  if (toolName.startsWith('git_')) {
    return await handleGitToolCall(request);
  }

  throw new Error(`Tool not found: ${toolName}`);
});

// Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Omni MCP Server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
