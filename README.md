# @useconduit/mcp

MCP server for [Conduit](https://usecondu.it) — connect any AI agent to your data streams.

📖 **[API Docs](https://api.usecondu.it/docs)** · 🌐 **[Website](https://usecondu.it)** · 📦 **[npm](https://www.npmjs.com/package/@useconduit/mcp)**

## Quick Start

Get an API key from [platform.usecondu.it/tokens](https://platform.usecondu.it/tokens), then add to your AI editor config:

### Claude Code / Claude Desktop

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "conduit": {
      "command": "npx",
      "args": ["-y", "conduit-mcp"],
      "env": {
        "CONDUIT_API_KEY": "conduit_sk_..."
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "conduit": {
      "command": "npx",
      "args": ["-y", "conduit-mcp"],
      "env": {
        "CONDUIT_API_KEY": "conduit_sk_..."
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "conduit": {
      "command": "npx",
      "args": ["-y", "conduit-mcp"],
      "env": {
        "CONDUIT_API_KEY": "conduit_sk_..."
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CONDUIT_API_KEY` | ✅ | — | Your Conduit API key |
| `CONDUIT_API_URL` | — | `https://api.usecondu.it` | Custom API endpoint |

## Tools

| Tool | Description |
|---|---|
| `conduit_list_streams` | List all data streams |
| `conduit_get_schema` | Get schema for a stream (columns, types, codecs) |
| `conduit_create_stream` | Create a new stream |
| `conduit_ingest` | Send events to a stream |
| `conduit_list_events` | Query events with pagination & time range |
| `conduit_add_forward` | Add a webhook forwarding destination |
| `conduit_stream_stats` | Get ingestion statistics |
| `conduit_analyze_schema` | Analyze a JSON payload for optimal schema |
| `conduit_feedback` | Submit feedback to the Conduit team |

## Resources

| URI | Description |
|---|---|
| `conduit://streams` | All streams |
| `conduit://streams/{name}` | Stream details + schema |
| `conduit://stats` | Platform-wide statistics |

## What is Conduit?

Conduit is the lightweight data layer between your services. Send any JSON — structure is inferred, not defined. Schema evolves automatically. Forward to any destination.

- **One endpoint, any protocol** — HTTP, WebSocket, MQTT
- **AI-powered schema detection** — zero configuration
- **Real-time forwarding** — webhooks, MQTT, more coming
- **Built for agents** — MCP-native from day one

Learn more at [usecondu.it](https://usecondu.it)

## License

MIT
