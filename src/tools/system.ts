import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

const execAsync = util.promisify(exec);

export const getSystemTools = () => [
  {
    name: 'system_read_file',
    description: 'Read a local file from the system',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Absolute path to the file',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'system_list_dir',
    description: 'List contents of a local directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Absolute path to the directory',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'system_execute_command',
    description: 'Execute a terminal command (e.g. npm install, npm test, python script.py). WARNING: Runs directly on the users machine, use with extreme caution.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute',
        },
        cwd: {
          type: 'string',
          description: 'Optional: The current working directory to run the command in',
        },
      },
      required: ['command'],
    },
  },
];

export const handleSystemToolCall = async (
  request: CallToolRequest
) => {
  try {
    if (request.params.name === 'system_read_file') {
      const { path: filePath } = request.params.arguments as any;
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    }

    if (request.params.name === 'system_list_dir') {
      const { path: dirPath } = request.params.arguments as any;
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const formattedItems = items.map((item: any) => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.join(dirPath, item.name)
      }));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formattedItems, null, 2),
          },
        ],
      };
    }

    if (request.params.name === 'system_execute_command') {
      const args = request.params.arguments as any;
      const options = args.cwd ? { cwd: args.cwd, timeout: 30000 } : { timeout: 30000 };
      
      const { stdout, stderr } = await execAsync(args.command, options);
      
      const combinedOutput = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
      
      return {
        content: [
          {
            type: 'text',
            text: combinedOutput.trim() || 'Command executed successfully with no output.',
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `System Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
};
