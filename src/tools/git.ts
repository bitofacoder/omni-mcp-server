import { exec } from 'child_process';
import util from 'util';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

const execAsync = util.promisify(exec);

export const getGitTools = () => [
  {
    name: 'git_status',
    description: 'Run git status to see the state of the working directory and staging area.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'git_diff',
    description: 'Run git diff to see exact line-by-line code changes. Shows unstaged changes by default.',
    inputSchema: {
      type: 'object',
      properties: {
        staged: {
          type: 'boolean',
          description: 'If true, runs git diff --staged to see staged changes.',
        },
      },
    },
  },
  {
    name: 'git_log',
    description: 'Run git log to see recent commit history.',
    inputSchema: {
      type: 'object',
      properties: {
        maxCount: {
          type: 'number',
          description: 'Maximum number of commits to show (defaults to 10).',
        },
      },
    },
  },
  {
    name: 'git_commit',
    description: 'Commit currently staged changes with a specific message.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The commit message.',
        },
      },
      required: ['message'],
    },
  },
];

export const handleGitToolCall = async (
  request: CallToolRequest
) => {
  try {
    if (request.params.name === 'git_status') {
      const { stdout, stderr } = await execAsync('git status');
      return {
        content: [{ type: 'text', text: stdout || stderr }],
      };
    }

    if (request.params.name === 'git_diff') {
      const args = request.params.arguments as { staged?: boolean };
      const cmd = args?.staged ? 'git diff --staged' : 'git diff';
      const { stdout, stderr } = await execAsync(cmd);
      
      return {
        content: [{ type: 'text', text: stdout || stderr || 'No changes.' }],
      };
    }

    if (request.params.name === 'git_log') {
      const args = request.params.arguments as { maxCount?: number };
      const maxCount = args?.maxCount || 10;
      const { stdout, stderr } = await execAsync(`git log -n ${maxCount}`);
      
      return {
        content: [{ type: 'text', text: stdout || stderr }],
      };
    }

    if (request.params.name === 'git_commit') {
      const { message } = request.params.arguments as { message: string };
      // Escape quotes securely
      const safeMessage = message.replace(/"/g, '\\"');
      const { stdout, stderr } = await execAsync(`git commit -m "${safeMessage}"`);
      
      return {
        content: [{ type: 'text', text: stdout || stderr }],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Git Command Error: ${error.stdout || error.stderr || error.message}`,
        },
      ],
      isError: true,
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
};
