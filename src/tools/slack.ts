import axios from 'axios';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

const SLACK_API_URL = 'https://slack.com/api';

export const getSlackTools = () => [
  {
    name: 'slack_send_message',
    description: 'Send a message to a Slack channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel ID or name (e.g., "#general")',
        },
        text: {
          type: 'string',
          description: 'The message text to send',
        },
      },
      required: ['channel', 'text'],
    },
  },
];

export const handleSlackToolCall = async (
  request: CallToolRequest,
  token: string | undefined
) => {
  if (!token) {
    return {
      content: [{ type: 'text', text: 'SLACK_BOT_TOKEN environment variable is required for Slack tools.' }],
      isError: true,
    };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    if (request.params.name === 'slack_send_message') {
      const { channel, text } = request.params.arguments as any;
      const response = await axios.post(
        `${SLACK_API_URL}/chat.postMessage`,
        { channel, text },
        { headers }
      );
      
      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully sent message to ${channel}. Message ID: ${response.data.ts}`,
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Slack API Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
};
