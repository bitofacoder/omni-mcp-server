import axios from 'axios';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

const GITHUB_API_URL = 'https://api.github.com';

export const getGithubTools = () => [
  {
    name: 'github_search_repos',
    description: 'Search for GitHub repositories',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query (e.g., "language:typescript stars:>1000")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'github_get_issue',
    description: 'Get details of a specific GitHub issue',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        issue_number: { type: 'number' },
      },
      required: ['owner', 'repo', 'issue_number'],
    },
  },
];

export const handleGithubToolCall = async (
  request: CallToolRequest,
  token: string | undefined
) => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(token && { Authorization: `Bearer ${token}` }),
    'User-Agent': 'Omni-MCP-Server',
  };

  try {
    if (request.params.name === 'github_search_repos') {
      const { query } = request.params.arguments as { query: string };
      const response = await axios.get(`${GITHUB_API_URL}/search/repositories`, {
        headers,
        params: { q: query, per_page: 5 },
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data.items.map((i: any) => ({
              full_name: i.full_name,
              html_url: i.html_url,
              description: i.description,
              stargazers_count: i.stargazers_count,
            })), null, 2),
          },
        ],
      };
    }

    if (request.params.name === 'github_get_issue') {
      const { owner, repo, issue_number } = request.params.arguments as any;
      const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${issue_number}`, {
        headers,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: response.data.title,
              state: response.data.state,
              body: response.data.body,
              html_url: response.data.html_url,
            }, null, 2),
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `GitHub API Error: ${error.response?.data?.message || error.message}`,
        },
      ],
      isError: true,
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
};
