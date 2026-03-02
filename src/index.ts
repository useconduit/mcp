#!/usr/bin/env node

/**
 * Conduit MCP Server
 *
 * Connect any AI agent to your Conduit data streams via
 * the Model Context Protocol.
 *
 * Environment variables:
 *   CONDUIT_API_URL  — Conduit API base URL (default: https://api.usecondu.it)
 *   CONDUIT_API_KEY  — Your Conduit API key (required)
 *
 * Tools:
 *   conduit_list_streams   — List all streams
 *   conduit_get_schema     — Get schema for a stream
 *   conduit_create_stream  — Create a new stream
 *   conduit_ingest         — Send events to a stream
 *   conduit_list_events    — Query events with pagination & time range
 *   conduit_add_forward    — Add a forwarding destination
 *   conduit_stream_stats   — Get ingestion statistics
 *   conduit_analyze_schema — Analyze a JSON payload for optimal schema
 *   conduit_feedback       — Submit feedback to the Conduit team
 *
 * Resources:
 *   conduit://streams          — All streams
 *   conduit://streams/{name}   — Stream details + schema
 *   conduit://stats            — Platform-wide statistics
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API = process.env.CONDUIT_API_URL || 'https://api.usecondu.it';
const KEY = process.env.CONDUIT_API_KEY || '';

if (!KEY) {
  console.error('[conduit-mcp] CONDUIT_API_KEY is required. Get one at https://platform.usecondu.it/tokens');
  process.exit(1);
}

async function api(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${KEY}`,
    ...(options?.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// Extract tenant prefix from first API call
let tenantPrefix = '';

async function getTenantPrefix(): Promise<string> {
  if (tenantPrefix) return tenantPrefix;
  // Get it from listing streams (the API key scopes to a tenant)
  const streams = await api('/api/v1/streams');
  if (Array.isArray(streams) && streams.length > 0) {
    tenantPrefix = (streams[0] as any).tenant_id?.slice(0, 8) || 'unknown';
  } else {
    tenantPrefix = 'unknown';
  }
  return tenantPrefix;
}

const server = new Server(
  { name: 'conduit', version: '0.1.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// === TOOLS ===

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'conduit_list_streams',
      description: 'List all data streams in your Conduit account',
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'conduit_get_schema',
      description: 'Get the current schema (columns, types, codecs) for a stream',
      inputSchema: {
        type: 'object' as const,
        properties: { stream: { type: 'string', description: 'Stream name' } },
        required: ['stream'],
      },
    },
    {
      name: 'conduit_create_stream',
      description: 'Create a new data stream. Just send a name — schema is auto-detected from the first event.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Stream name (alphanumeric, underscores, hyphens)' },
          description: { type: 'string', description: 'Optional description' },
        },
        required: ['name'],
      },
    },
    {
      name: 'conduit_ingest',
      description: 'Send one or more events (JSON objects) to a stream. Schema is auto-detected and evolves.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          stream: { type: 'string', description: 'Stream name' },
          events: {
            oneOf: [
              { type: 'object', description: 'Single event' },
              { type: 'array', items: { type: 'object' }, description: 'Batch of events' },
            ],
            description: 'Event(s) to ingest',
          },
        },
        required: ['stream', 'events'],
      },
    },
    {
      name: 'conduit_list_events',
      description: 'Query events from a stream with optional pagination and time range filters',
      inputSchema: {
        type: 'object' as const,
        properties: {
          stream: { type: 'string', description: 'Stream name' },
          limit: { type: 'number', description: 'Max events to return (default: 50, max: 1000)' },
          offset: { type: 'number', description: 'Offset for pagination' },
          from: { type: 'string', description: 'Start time (ISO 8601)' },
          to: { type: 'string', description: 'End time (ISO 8601)' },
        },
        required: ['stream'],
      },
    },
    {
      name: 'conduit_add_forward',
      description: 'Add a webhook forwarding destination to a stream. Events are forwarded in real-time.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          stream: { type: 'string', description: 'Stream name' },
          url: { type: 'string', description: 'Webhook URL to forward events to' },
          method: { type: 'string', enum: ['POST', 'PUT'], description: 'HTTP method (default: POST)' },
          headers: { type: 'object', description: 'Optional headers to include' },
        },
        required: ['stream', 'url'],
      },
    },
    {
      name: 'conduit_stream_stats',
      description: 'Get ingestion statistics for a stream (event count, rate, schema version)',
      inputSchema: {
        type: 'object' as const,
        properties: { stream: { type: 'string', description: 'Stream name' } },
        required: ['stream'],
      },
    },
    {
      name: 'conduit_analyze_schema',
      description: 'Analyze a JSON payload and get the optimal ClickHouse schema with compression codecs',
      inputSchema: {
        type: 'object' as const,
        properties: {
          payload: { type: 'object', description: 'Sample JSON payload to analyze' },
        },
        required: ['payload'],
      },
    },
    {
      name: 'conduit_feedback',
      description: 'Submit feedback to the Conduit team — bugs, feature requests, improvements, or praise',
      inputSchema: {
        type: 'object' as const,
        properties: {
          category: {
            type: 'string',
            enum: ['bug', 'feature', 'improvement', 'general', 'praise'],
            description: 'Feedback category',
          },
          message: { type: 'string', description: 'Your feedback (max 5000 chars)' },
          context: { type: 'object', description: 'Optional context (stream name, error details, etc.)' },
        },
        required: ['category', 'message'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'conduit_list_streams': {
        const streams = await api('/api/v1/streams');
        return { content: [{ type: 'text', text: JSON.stringify(streams, null, 2) }] };
      }

      case 'conduit_get_schema': {
        const data = await api(`/api/v1/streams/${args!.stream}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_create_stream': {
        const data = await api('/api/v1/streams', {
          method: 'POST',
          body: JSON.stringify({ name: args!.name, description: args!.description || '' }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_ingest': {
        const prefix = await getTenantPrefix();
        const events = Array.isArray(args!.events) ? args!.events : [args!.events];
        const data = await api(`/v1/${prefix}/${args!.stream}`, {
          method: 'POST',
          body: JSON.stringify(events.length === 1 ? events[0] : events),
        });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_list_events': {
        const params = new URLSearchParams();
        if (args!.limit) params.set('limit', String(args!.limit));
        if (args!.offset) params.set('offset', String(args!.offset));
        if (args!.from) params.set('from', args!.from as string);
        if (args!.to) params.set('to', args!.to as string);
        const qs = params.toString();
        const data = await api(`/api/v1/streams/${args!.stream}/events${qs ? `?${qs}` : ''}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_add_forward': {
        const data = await api(`/api/v1/streams/${args!.stream}/forwards`, {
          method: 'POST',
          body: JSON.stringify({
            url: args!.url,
            method: args!.method || 'POST',
            headers: args!.headers || {},
          }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_stream_stats': {
        const data = await api(`/api/v1/streams/${args!.stream}/stats`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_analyze_schema': {
        const data = await api('/api/v1/analyze', {
          method: 'POST',
          body: JSON.stringify(args!.payload),
        });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'conduit_feedback': {
        const data = await api('/api/v1/feedback', {
          method: 'POST',
          body: JSON.stringify({
            category: args!.category,
            message: args!.message,
            source: 'mcp',
            context: args!.context || {},
          }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

// === RESOURCES ===

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: 'conduit://streams', name: 'All Streams', description: 'List of all data streams', mimeType: 'application/json' },
    { uri: 'conduit://stats', name: 'Platform Stats', description: 'Platform-wide statistics', mimeType: 'application/json' },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'conduit://streams') {
    const streams = await api('/api/v1/streams');
    return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(streams, null, 2) }] };
  }

  const streamMatch = uri.match(/^conduit:\/\/streams\/(.+)$/);
  if (streamMatch) {
    const data = await api(`/api/v1/streams/${streamMatch[1]}`);
    return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }] };
  }

  if (uri === 'conduit://stats') {
    const streams = await api('/api/v1/streams');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ totalStreams: Array.isArray(streams) ? streams.length : 0, streams }, null, 2),
      }],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// === START ===

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[conduit-mcp] Connected — ready for requests');
}

main().catch((err) => {
  console.error('[conduit-mcp] Fatal:', err);
  process.exit(1);
});
