# Omni MCP Server 🚀

**One MCP server instead of six.** GitHub, local Git, Slack, web fetching, persistent memory, and filesystem tools — 15 tools in a single config entry, with dangerous capabilities off by default.

[![npm version](https://img.shields.io/npm/v/@bitofacoder/omni-mcp-server.svg)](https://www.npmjs.com/package/@bitofacoder/omni-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/@bitofacoder/omni-mcp-server.svg)](https://www.npmjs.com/package/@bitofacoder/omni-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-green.svg)](https://github.com/modelcontextprotocol)

## Why Omni?

Setting up MCP usually means installing and configuring a separate server for every capability — one for GitHub, one for filesystem, one for memory, one for fetch. Each has its own config block, its own runtime, its own startup cost.

Omni bundles the everyday developer tools into **one server, one config entry, one `npx` command**:

| You'd normally install… | With Omni |
| --- | --- |
| `server-github` | ✅ built in |
| `server-filesystem` | ✅ built in |
| `server-memory` | ✅ built in |
| `server-fetch` | ✅ built in |
| a git server | ✅ built in |
| a Slack server | ✅ built in |

- 🔒 **Safe by default** — shell execution and file writes are **disabled** unless you explicitly opt in to Agent Mode.
- 🏠 **Local & private** — runs on your machine over stdio. You bring your own tokens; nothing is proxied through a third party.
- 🪶 **Zero install** — runs straight from npm via `npx`.

## 🚀 Quick Start

### Interactive setup (Claude Desktop)

```bash
npx -y @bitofacoder/omni-mcp-server@latest setup
```

The wizard asks for your optional tokens (GitHub, Slack), asks whether to enable Agent Mode, and updates your Claude Desktop config for you. Restart Claude Desktop and you're done.

### Claude Code

```bash
claude mcp add omni -e GITHUB_PERSONAL_ACCESS_TOKEN=your_gh_token -- npx -y @bitofacoder/omni-mcp-server@latest
```

### Manual config (Claude Desktop, Cursor, Windsurf, Codex CLI…)

Add this to your client's MCP config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "omni": {
      "command": "npx",
      "args": ["-y", "@bitofacoder/omni-mcp-server@latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_gh_token",
        "SLACK_BOT_TOKEN": "your_slack_token"
      }
    }
  }
}
```

All env vars are optional — tools that need a missing token simply tell you so.

## 🛠️ Tools (15)

| Group | Tool | What it does |
| --- | --- | --- |
| 🐙 GitHub | `github_search_repos` | Search GitHub repositories |
| | `github_get_issue` | Get details of a specific issue |
| 🌳 Local Git | `git_status` | Working tree + staging area status |
| | `git_diff` | View local code changes |
| | `git_log` | View commit history |
| | `git_commit` | Commit staged changes with a message |
| 💻 System | `system_read_file` | Read a local file |
| | `system_list_dir` | List a directory |
| | `system_write_file` | ⚠️ Write a file *(Agent Mode only)* |
| | `system_execute_command` | ⚠️ Run a shell command *(Agent Mode only)* |
| 🌐 Web | `web_fetch` | Fetch any public URL as clean Markdown — no API key needed |
| 🧠 Memory | `memory_store` | Save a note/preference across chats |
| | `memory_retrieve` | Retrieve a saved memory |
| | `memory_list` | List everything remembered |
| 💬 Slack | `slack_send_message` | Send a message to a Slack channel |

## 🔒 Agent Mode (opt-in)

`system_execute_command` and `system_write_file` let the AI act on your machine — run tests, install packages, edit files. Because that's real power, **they are disabled by default** and don't even appear in the tool list until you enable them:

```json
"env": {
  "OMNI_AGENT_MODE": "true"
}
```

Everything else (reading files, git status, web fetch, memory) is read-only or sandboxed to its own data file.

## 🤝 Contributing

PRs welcome — especially new integrations (Linear, Notion, Jira, Discord) and Agent Mode hardening (allowlists, working-dir scoping). Open an issue first for bigger changes.

If Omni saved you some config wrangling, a ⭐ helps other people find it.

## 📄 License

MIT — see [LICENSE](LICENSE).
