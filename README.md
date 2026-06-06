# Omni MCP Server 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-green.svg)](https://github.com/modelcontextprotocol)

**Omni MCP Server** is the ultimate, all-in-one Model Context Protocol (MCP) server. Instead of configuring a dozen different servers for your local AI (like Claude Desktop or Cursor), Omni bundles the most requested developer tools into a single, cohesive server.

Give your local AI access to your entire workflow in seconds.

## ✨ Features

- 🐙 **GitHub Integration**: Read repositories, list issues, search code.
- 🌳 **Local Git**: Read local git status, diffs, and commit logs directly.
- 🤖 **Agent Mode (Terminal Execution)**: Claude can run shell commands, install npm packages, and run tests for you.
- 💬 **Slack Integration**: Read messages, send alerts, check channels.
- 🌐 **Web Integration**: Read any public URL and parse it as Markdown instantly. (No API key needed!)
- 🧠 **Persistent Memory**: Claude can remember preferences and notes across all your chats.
- 💻 **System Dev Tools**: Read local files, list directories, run basic scripts.
- 🔒 **Privacy First**: Everything runs locally. You bring your own tokens.

## 🚀 Quick Start (Zero Install)

The easiest way to install and configure Omni is using our interactive setup wizard. You don't even need to clone the repository!

Run this single command in your terminal:

```bash
npx -y @bitofacoder/omni-mcp-server@latest setup
```

The wizard will ask for your optional API tokens (GitHub, Slack) and automatically update your Claude Desktop configuration file.

**That's it! Restart Claude Desktop and you're ready to go.**

---

*(Advanced/Manual Setup)*
If you prefer to configure it manually without the wizard, add this to your `claude_desktop_config.json`:

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

## 🛠️ Tools Provided

Once connected, your AI assistant will have access to the following tools:

*   `github_search_repos`: Search GitHub repositories.
*   `github_get_issue`: Get details of a specific issue.
*   `git_status`: Read local git status and staging area.
*   `git_diff`: View local code changes.
*   `git_log`: View local commit history.
*   `git_commit`: Commit local changes with a message.
*   `system_execute_command`: **(Agent Mode)** Execute a terminal command (e.g. `npm test`, `python script.py`).
*   `slack_send_message`: Send a message to a Slack channel.
*   `web_fetch`: Fetch a URL and read its content as clean Markdown.
*   `memory_store`: Save a note or context to persistent memory.
*   `memory_retrieve`: Retrieve a saved memory.
*   `system_read_file`: Read a local file.
*   `system_list_dir`: List contents of a local directory.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request if you'd like to add another integration (e.g., Jira, Linear, Notion).

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
