import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { HTTP_HOST, HTTP_PORT, SERVER_INFO, TRANSPORT } from './config.js';
import { searchDocsTool } from './tools/search-docs.js';
import { getPageTool } from './tools/get-page.js';
import { listSectionsTool } from './tools/list-sections.js';
import { getApiMethodTool } from './tools/get-api-method.js';
import { getCodeExampleTool } from './tools/get-code-example.js';
import { getFaqTool } from './tools/get-faq.js';
import { listDocsResources, readDocsResource } from './resources/docs-resource.js';
import { isUiUri, listUiResources, readUiResource } from './resources/ui-resource.js';

const TOOLS = [
  searchDocsTool,
  getPageTool,
  listSectionsTool,
  getApiMethodTool,
  getCodeExampleTool,
  getFaqTool,
];

export function createServer(): Server {
  const server = new Server(SERVER_INFO, {
    capabilities: {
      tools: {},
      resources: { listChanged: false },
    },
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      ...((t as { _meta?: unknown })._meta ? { _meta: (t as { _meta: unknown })._meta } : {}),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = TOOLS.find((t) => t.name === request.params.name);
    if (!tool) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `Unknown tool: ${request.params.name}` }],
      };
    }
    try {
      return await tool.handler((request.params.arguments ?? {}) as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `Tool error: ${message}` }],
      };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [...listUiResources(), ...listDocsResources()],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const result = isUiUri(uri) ? readUiResource(uri) : readDocsResource(uri);
    if (!result) {
      throw new Error(`Resource not found: ${uri}`);
    }
    return result;
  });

  return server;
}

async function runStdio() {
  const transport = new StdioServerTransport();
  const server = createServer();
  await server.connect(transport);
  console.error(`[nero-docs-mcp] stdio transport ready`);
}

async function runHttp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: SERVER_INFO });
  });

  app.all('/mcp', async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
      });
      const server = createServer();
      res.on('close', () => {
        transport.close().catch(() => {});
        server.close().catch(() => {});
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('[nero-docs-mcp] request failed:', err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  app.all('/', async (req, res) => {
    if (req.method === 'GET') {
      res.json({
        server: SERVER_INFO,
        endpoints: { mcp: '/mcp', health: '/health' },
        docs: 'https://docs.nerochain.io/en/ai-resources',
      });
      return;
    }
    res.redirect(307, '/mcp');
  });

  app.listen(HTTP_PORT, HTTP_HOST, () => {
    console.error(
      `[nero-docs-mcp] HTTP transport on http://${HTTP_HOST}:${HTTP_PORT}/mcp`,
    );
  });
}

async function main() {
  if (TRANSPORT === 'stdio') {
    await runStdio();
  } else {
    await runHttp();
  }
}

main().catch((err) => {
  console.error('[nero-docs-mcp] fatal:', err);
  process.exit(1);
});
