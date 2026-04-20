import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const entry = path.resolve(__dirname, '..', 'index.js');
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [entry],
    env: { ...process.env, MCP_TRANSPORT: 'stdio' },
  });
  const client = new Client({ name: 'nero-docs-mcp-conformance', version: '1.0.0' }, {});
  await client.connect(transport);

  const tools = await client.listTools();
  const expected = [
    'search_docs',
    'get_page',
    'list_sections',
    'get_api_method',
    'get_code_example',
    'get_faq',
    'get_integration_config',
  ];
  const names = tools.tools.map((t) => t.name).sort();
  if (names.length !== expected.length || !expected.every((n) => names.includes(n))) {
    throw new Error(`expected tools ${expected.join(',')} but got ${names.join(',')}`);
  }
  console.log(`✅ ${names.length} tools: ${names.join(', ')}`);

  const search = await client.callTool({
    name: 'search_docs',
    arguments: { query: 'paymaster', limit: 3 },
  });
  if (!search.structuredContent || (search.structuredContent as { total: number }).total < 1) {
    throw new Error('search_docs returned zero hits for "paymaster"');
  }
  console.log(`✅ search_docs(paymaster) → ${(search.structuredContent as { total: number }).total} hits`);

  const page = await client.callTool({
    name: 'get_page',
    arguments: { path: '/en/developer-tools/paymaster-api/core-methods' },
  });
  if (page.isError) {
    throw new Error('get_page failed for core-methods');
  }
  console.log('✅ get_page(core-methods) → ok');

  const api = await client.callTool({
    name: 'get_api_method',
    arguments: { method: 'pm_sponsor_userop' },
  });
  if (api.isError) {
    throw new Error('get_api_method failed');
  }
  console.log('✅ get_api_method(pm_sponsor_userop) → ok');

  const integrationConfig = await client.callTool({
    name: 'get_integration_config',
    arguments: { topic: 'testnet' },
  });
  if (integrationConfig.isError) {
    throw new Error('get_integration_config failed');
  }
  const structured = integrationConfig.structuredContent as { chainIdHex?: string };
  if (structured?.chainIdHex !== '0x2B1') {
    throw new Error(`expected testnet chainIdHex 0x2B1, got ${structured?.chainIdHex}`);
  }
  console.log('✅ get_integration_config(testnet) → chainIdHex=0x2B1');

  const quickstart = await client.callTool({
    name: 'get_code_example',
    arguments: { topic: 'quickstart' },
  });
  if (quickstart.isError) {
    throw new Error('get_code_example(quickstart) failed');
  }
  console.log('✅ get_code_example(quickstart) → ok');

  const resources = await client.listResources();
  if (resources.resources.length < 50) {
    throw new Error(`expected ≥ 50 resources, got ${resources.resources.length}`);
  }
  console.log(`✅ ${resources.resources.length} resources`);

  await client.close();
  console.log('✨ conformance passed');
}

main().catch((err) => {
  console.error('❌ conformance failed:', err);
  process.exit(1);
});
