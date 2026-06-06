import fs from 'fs/promises';
import path from 'path';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

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
