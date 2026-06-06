import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

export const getWebTools = () => [
  {
    name: 'web_fetch',
    description: 'Fetch a public web page and read its content as clean Markdown',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The full URL of the web page to fetch (e.g., https://example.com)',
        },
      },
      required: ['url'],
    },
  },
];

export const handleWebToolCall = async (
  request: CallToolRequest
) => {
  try {
    if (request.params.name === 'web_fetch') {
      const { url } = request.params.arguments as { url: string };
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Omni-MCP-Server-Fetcher (Mozilla/5.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unnecessary junk
      $('script, style, noscript, iframe, img, svg, nav, footer, header, aside').remove();

      // We focus on the body or main content
      let content = $('main').html() || $('article').html() || $('body').html() || html;

      // Initialize Turndown to convert HTML to Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });
      
      const markdown = turndownService.turndown(content);

      // Truncate to avoid exploding context windows (limit to ~40k chars)
      const truncatedMarkdown = markdown.length > 40000 
        ? markdown.slice(0, 40000) + '\n\n...[Content Truncated]...' 
        : markdown;

      return {
        content: [
          {
            type: 'text',
            text: truncatedMarkdown,
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Web Fetch Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
};
