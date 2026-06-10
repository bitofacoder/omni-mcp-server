import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

const execAsync = util.promisify(exec);

// Agent Mode (shell execution + file writes) is opt-in: set OMNI_AGENT_MODE=true
const isAgentMode = () => process.env.OMNI_AGENT_MODE === 'true';

const AGENT_MODE_DISABLED_MSG =
  'Agent Mode is disabled. This tool can modify your system, so it is opt-in: set OMNI_AGENT_MODE=true in the server env config to enable it.';

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
    name: 'system_write_file',
    description: 'Write entirely new content to a local file on the system. Overwrites existing content. Use with extreme caution.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Absolute path to the file',
        },
        content: {
          type: 'string',
          description: 'The exact string content to write to the file',
        },
      },
      required: ['path', 'content'],
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
].filter(
  (tool) =>
    isAgentMode() ||
    !['system_execute_command', 'system_write_file'].includes(tool.name)
);

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

    if (
      ['system_write_file', 'system_execute_command'].includes(
        request.params.name
      ) &&
      !isAgentMode()
    ) {
      return {
        content: [{ type: 'text', text: AGENT_MODE_DISABLED_MSG }],
        isError: true,
      };
    }

    if (request.params.name === 'system_write_file') {
      const { path: filePath, content } = request.params.arguments as any;
      await fs.writeFile(filePath, content, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote to file: ${filePath}`,
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
