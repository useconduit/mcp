# @useconduit/mcp

MCP server for [Conduit](https://usecondu.it) — connect any AI agent to your data streams.

📖 **[API Docs](https://api.usecondu.it/docs)** · 🌐 **[Website](https://usecondu.it)** · 📦 **[npm](https://www.npmjs.com/package/@useconduit/mcp)** · 💻 **[GitHub](https://github.com/useconduit/mcp)**

## Quick Start

Get an API key from [platform.usecondu.it/tokens](https://platform.usecondu.it/tokens), then add to your AI editor config:

### Claude Code / Claude Desktop

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "conduit": {
      "command": "npx",
      "args": ["-y", "@useconduit/mcp"],
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
      "args": ["-y", "@useconduit/mcp"],
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
      "args": ["-y", "@useconduit/mcp"],
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
| `conduit_list_events` | Query events with pagination & time range filters |
| `conduit_add_forward` | Add a forwarding destination (HTTP, MQTT, or WebSocket) with auth options |
| `conduit_stream_stats` | Get ingestion statistics (event count, rate, latency) |
| `conduit_analyze_schema` | Analyze a JSON payload for optimal schema |
| `conduit_feedback` | Submit feedback to the Conduit team |
| `conduit_backfill` | Replay historical events to forwarding destinations |
| `conduit_backfill_status` | Check backfill job progress or list all jobs |
| `conduit_time_range` | Get earliest/latest event timestamps for a stream |

## Resources

| URI | Description |
|---|---|
| `conduit://streams` | All streams |
| `conduit://streams/{name}` | Stream details + schema |
| `conduit://stats` | Platform-wide statistics |

## API Documentation

Full interactive API docs are available at **[api.usecondu.it/docs](https://api.usecondu.it/docs)** (powered by Scalar).

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/{tenant}/{stream}` | Ingest events (any protocol: HTTP, WebSocket, MQTT) |
| `GET` | `/api/v1/streams` | List streams |
| `GET` | `/api/v1/streams/{name}` | Stream details + schema |
| `GET` | `/api/v1/streams/{name}/events?from=&to=&limit=` | Query events with time range |
| `GET` | `/api/v1/streams/{name}/stats` | Ingestion statistics |
| `GET` | `/api/v1/streams/{name}/schema-history` | Schema evolution history |
| `POST` | `/api/v1/streams/{name}/forwards` | Add forwarding destination |
| `POST` | `/api/v1/streams/{name}/backfill` | Start backfill job |
| `GET` | `/api/v1/streams/{name}/backfill` | List backfill jobs |
| `GET` | `/api/v1/streams/{name}/time-range` | Event time range |
| `POST` | `/api/v1/tokens` | Create API token |
| `GET` | `/api/v1/account` | Account info + usage |

Machine-readable API specs:
- **OpenAPI 3.1**: [api.usecondu.it/openapi.json](https://api.usecondu.it/openapi.json)
- **LLM-friendly**: [api.usecondu.it/llms.txt](https://api.usecondu.it/llms.txt)
- **LLM full spec**: [api.usecondu.it/llms-full.txt](https://api.usecondu.it/llms-full.txt)

## What is Conduit?

Conduit is the lightweight data layer between your services. Send any JSON — schemas aren't defined, they emerge. And they evolve as your sources do.

- **One endpoint, any protocol** — HTTP, WebSocket, MQTT/S on the same path
- **AI-powered schema detection** — zero configuration, runs locally (your data never leaves)
- **Real-time forwarding** — HTTP webhooks, MQTT brokers, WebSocket endpoints with full auth options
- **Backfill** — replay historical events to new destinations
- **Built for agents** — MCP-native from day one, feedback loop included
- **European infrastructure** 🇪🇺 — all data hosted and processed in the EU, GDPR-compliant by design

### How agents use Conduit

```
Agent: "I see live sensor data flowing in. I'll pipe it to our datawarehouse and add hot storage."

▸ conduit_list_events(stream: "sensors", limit: 1000)
  ↳ 1,000 events · 18.4 MB raw → 1.1 MB stored (94% compressed)

▸ conduit_add_forward(stream: "sensors", type: "http", url: "https://dwh.acme.io/ingest")
  ↳ Destination added · forwarding to datawarehouse

▸ conduit_add_forward(stream: "sensors", type: "mqtt", broker: "mqtt://redis.acme.io", topic: "hot/sensors")
  ↳ Destination added · 2 destinations active

▸ conduit_backfill(stream: "sensors", from: "2026-02-24", to: "2026-03-02")
  ↳ Backfilling 89,929 events from last 7 days
```

Learn more at [usecondu.it](https://usecondu.it)

## License

MIT
