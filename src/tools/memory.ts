import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

const MEMORY_FILE_PATH = path.join(os.homedir(), '.omni_mcp_memory.json');

// Helper to read the memory file
async function readMemory(): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw new Error(`Failed to read memory file: ${error.message}`);
  }
}

// Helper to write the memory file
async function writeMemory(memory: Record<string, string>): Promise<void> {
  await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify(memory, null, 2), 'utf-8');
}

export const getMemoryTools = () => [
  {
    name: 'memory_store',
    description: 'Save a note, preference, or piece of context to persistent memory so it can be recalled in future conversations.',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'A unique, descriptive identifier for this memory (e.g., "user_project_goals", "react_preferences"). Keep it snake_case.',
        },
        content: {
          type: 'string',
          description: 'The detailed content you want to remember.',
        },
      },
      required: ['key', 'content'],
    },
  },
  {
    name: 'memory_retrieve',
    description: 'Retrieve a previously saved memory by its key.',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The unique key of the memory to retrieve.',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'memory_list',
    description: 'List all the memory keys currently saved in persistent storage.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export const handleMemoryToolCall = async (
  request: CallToolRequest
) => {
  try {
    if (request.params.name === 'memory_store') {
      const { key, content } = request.params.arguments as { key: string; content: string };
      const memory = await readMemory();
      memory[key] = content;
      await writeMemory(memory);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully saved memory under key: '${key}'`,
          },
        ],
      };
    }

    if (request.params.name === 'memory_retrieve') {
      const { key } = request.params.arguments as { key: string };
      const memory = await readMemory();
      
      if (key in memory) {
        return {
          content: [
            {
              type: 'text',
              text: memory[key],
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `No memory found for key: '${key}'`,
            },
          ],
        };
      }
    }

    if (request.params.name === 'memory_list') {
      const memory = await readMemory();
      const keys = Object.keys(memory);
      
      return {
        content: [
          {
            type: 'text',
            text: keys.length > 0 
              ? `Saved memory keys:\n- ${keys.join('\n- ')}`
              : 'Memory is currently empty.',
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Memory Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
};
