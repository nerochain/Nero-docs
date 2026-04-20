#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const __filename = fileURLToPath(import.meta.url);
const PACKAGE_ROOT = path.resolve(path.dirname(__filename), '..');
const REPO_ROOT = path.resolve(PACKAGE_ROOT, '..');

const MODE = process.argv[2] ?? 'node';
const PORT = Number(process.env.PORT ?? (MODE === 'docker' ? 8081 : 8080));
const ORIGIN = `http://127.0.0.1:${PORT}`;
const MCP_URL = `${ORIGIN}/mcp`;
const HEALTH_URL = `${ORIGIN}/health`;

function header(label) {
  console.log('\n' + '='.repeat(70));
  console.log(label);
  console.log('='.repeat(70));
}

async function waitUntilReady(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch {}
    await sleep(400);
  }
  return false;
}

const results = [];
function record(name, ok, detail, data) {
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ''}`);
  results.push({ name, ok, detail, data });
}

async function probe(label) {
  header(label);

  const healthRes = await fetch(HEALTH_URL);
  const health = await healthRes.json();
  record(
    'GET /health',
    health?.status === 'ok',
    `server=${health?.server?.name} version=${health?.server?.version}`,
    health,
  );

  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  const client = new Client({ name: 'verify-deployment', version: '1.0.0' }, {});
  await client.connect(transport);
  record('MCP initialize handshake', true, `connected to ${MCP_URL}`, {});

  const toolsRes = await client.listTools();
  const tools = toolsRes.tools ?? [];
  const toolNames = tools.map((t) => t.name).sort();
  const expectedTools = [
    'get_api_method',
    'get_code_example',
    'get_faq',
    'get_page',
    'list_sections',
    'search_docs',
  ];
  record(
    'tools/list (6 tools registered)',
    toolNames.length === 6 && expectedTools.every((n) => toolNames.includes(n)),
    toolNames.join(', '),
    toolNames,
  );

  const withUiMeta = tools.filter((t) => t._meta?.ui?.resourceUri);
  record(
    'tools have MCP Apps _meta.ui.resourceUri',
    withUiMeta.length === 6,
    `${withUiMeta.length}/6 tools carry UI metadata`,
    withUiMeta.map((t) => ({ name: t.name, uri: t._meta.ui.resourceUri })),
  );

  const search = await client.callTool({
    name: 'search_docs',
    arguments: { query: 'paymaster sponsorship', limit: 5 },
  });
  const hits = search.structuredContent?.total ?? 0;
  record(
    'tools/call search_docs("paymaster sponsorship")',
    hits > 0,
    `${hits} hits`,
    search.structuredContent,
  );

  const method = await client.callTool({
    name: 'get_api_method',
    arguments: { method: 'pm_sponsor_userop' },
  });
  const methodText = method.content?.[0]?.text ?? '';
  record(
    'tools/call get_api_method(pm_sponsor_userop)',
    methodText.includes('pm_sponsor_userop') && methodText.includes('type'),
    `${methodText.length} chars; includes method name + type context`,
    { preview: methodText.slice(0, 150) },
  );

  const page = await client.callTool({
    name: 'get_page',
    arguments: { path: '/en/developer-tools/paymaster-api/core-methods' },
  });
  const pageMd = page.structuredContent?.markdown ?? '';
  record(
    'tools/call get_page(core-methods)',
    pageMd.includes('pm_supported_tokens') && pageMd.includes('EntryPoint'),
    `${pageMd.length} chars of markdown`,
    { url: page.structuredContent?.url, tokens: page.structuredContent?.tokens },
  );

  const resources = await client.listResources();
  const allResources = resources.resources ?? [];
  const uiResources = allResources.filter((r) => r.uri?.startsWith('ui://'));
  const docsResources = allResources.filter((r) => r.uri?.startsWith('docs://'));
  record(
    'resources/list returns docs:// + ui:// resources',
    uiResources.length >= 4 && docsResources.length >= 100,
    `${docsResources.length} docs:// + ${uiResources.length} ui://`,
    { ui: uiResources.map((r) => r.uri), docsSample: docsResources.slice(0, 3).map((r) => r.uri) },
  );

  const uiRead = await client.readResource({ uri: 'ui://nero-docs/search-results' });
  const uiText = uiRead.contents?.[0]?.text ?? '';
  record(
    'resources/read ui://nero-docs/search-results (MCP Apps UI)',
    uiText.includes('nero-search-results') && uiText.includes('data-for'),
    `${uiText.length} chars; mimeType=${uiRead.contents?.[0]?.mimeType}`,
    { mimeType: uiRead.contents?.[0]?.mimeType, preview: uiText.slice(0, 140) },
  );

  const docRead = await client.readResource({
    uri: 'docs:///en/getting-started/introduction',
  });
  const docText = docRead.contents?.[0]?.text ?? '';
  record(
    'resources/read docs:///en/getting-started/introduction',
    docText.length > 500 && docText.toLowerCase().includes('nero'),
    `${docText.length} chars; mimeType=${docRead.contents?.[0]?.mimeType}`,
    { mimeType: docRead.contents?.[0]?.mimeType },
  );

  const bad = await client.callTool({
    name: 'get_page',
    arguments: { path: '/en/does-not-exist' },
  });
  record(
    'error shape for missing page (isError:true JSON)',
    bad.isError === true,
    bad.content?.[0]?.text,
    { isError: bad.isError, message: bad.content?.[0]?.text },
  );

  // --- Japanese locale probes ---
  const searchJaEn = await client.callTool({
    name: 'search_docs',
    arguments: { query: 'ペイマスター', locale: 'ja', limit: 5 },
  });
  const jaHits = searchJaEn.structuredContent?.total ?? 0;
  const jaHitsAllJa = (searchJaEn.structuredContent?.results ?? []).every(
    (r) => r.locale === 'ja',
  );
  record(
    'search_docs("ペイマスター", locale=ja) returns JA hits',
    jaHits > 0 && jaHitsAllJa,
    `${jaHits} hits, all locale=ja: ${jaHitsAllJa}`,
    searchJaEn.structuredContent?.results?.slice(0, 3),
  );

  const searchJaTokenQuery = await client.callTool({
    name: 'search_docs',
    arguments: { query: 'トークン 支払い', locale: 'ja', limit: 5 },
  });
  const jaTokenHits = searchJaTokenQuery.structuredContent?.total ?? 0;
  record(
    'search_docs("トークン 支払い", locale=ja) returns JA hits',
    jaTokenHits > 0,
    `${jaTokenHits} hits`,
    searchJaTokenQuery.structuredContent?.results?.slice(0, 2),
  );

  const jaPage = await client.callTool({
    name: 'get_page',
    arguments: { path: '/ja/developer-tools/paymaster-api/core-methods' },
  });
  const jaMarkdown = jaPage.structuredContent?.markdown ?? '';
  const hasJaChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(jaMarkdown);
  record(
    'get_page(/ja/developer-tools/paymaster-api/core-methods)',
    jaMarkdown.length > 500 && hasJaChars,
    `${jaMarkdown.length} chars, contains Japanese characters: ${hasJaChars}`,
    { url: jaPage.structuredContent?.url, locale: jaPage.structuredContent?.locale },
  );

  const sectionsJa = await client.callTool({
    name: 'list_sections',
    arguments: { locale: 'ja' },
  });
  const jaTree = sectionsJa.structuredContent?.tree ?? [];
  const jaHasJapaneseLabels = jaTree.some(
    (s) => s.label && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(s.label),
  );
  const jaPageCount = jaTree.reduce((n, s) => n + (s.pages?.length ?? 0), 0);
  record(
    'list_sections(locale=ja) returns JA-labeled tree',
    jaTree.length >= 5 && jaHasJapaneseLabels && jaPageCount >= 50,
    `${jaTree.length} sections, ${jaPageCount} pages, JA labels: ${jaHasJapaneseLabels}`,
    jaTree.map((s) => ({ section: s.section, label: s.label, pages: s.pages?.length })),
  );

  const jaDocResource = await client.readResource({
    uri: 'docs:///ja/getting-started/introduction',
  });
  const jaResourceText = jaDocResource.contents?.[0]?.text ?? '';
  const jaResourceHasJa = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(jaResourceText);
  record(
    'resources/read docs:///ja/getting-started/introduction',
    jaResourceText.length > 500 && jaResourceHasJa,
    `${jaResourceText.length} chars; Japanese: ${jaResourceHasJa}`,
    { mimeType: jaDocResource.contents?.[0]?.mimeType },
  );

  const faqJa = await client.callTool({
    name: 'get_faq',
    arguments: { locale: 'ja' },
  });
  const faqJaText = faqJa.content?.[0]?.text ?? '';
  const faqHasJa = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(faqJaText);
  record(
    'get_faq(locale=ja) returns Japanese FAQ',
    faqJaText.length > 500 && faqHasJa,
    `${faqJaText.length} chars; Japanese: ${faqHasJa}`,
    { url: faqJa.structuredContent?.url, locale: faqJa.structuredContent?.locale },
  );

  await client.close();
}

async function startNode() {
  const entry = path.join(PACKAGE_ROOT, 'dist', 'index.js');
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, MCP_TRANSPORT: 'http', PORT: String(PORT), HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => process.stderr.write(`[server] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));
  return { child };
}

async function startDocker() {
  const image = 'nero-docs-mcp:verify';
  const container = `nero-docs-mcp-verify-${Date.now()}`;
  const build = spawn('docker', ['build', '-t', image, '.'], {
    cwd: PACKAGE_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let buildErr = '';
  build.stderr.on('data', (d) => (buildErr += d.toString()));
  build.stdout.on('data', (d) => process.stderr.write(`[docker build] ${d}`));
  await new Promise((resolve, reject) => {
    build.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`docker build exited ${code}: ${buildErr.slice(-500)}`)),
    );
  });
  console.log(`[docker] built image ${image}`);
  const child = spawn(
    'docker',
    ['run', '--rm', '--name', container, '-p', `${PORT}:8080`, image],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  child.stdout.on('data', (d) => process.stderr.write(`[container] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[container] ${d}`));
  return { child, container };
}

async function main() {
  let child;
  let containerName;
  try {
    if (MODE === 'docker') {
      const started = await startDocker();
      child = started.child;
      containerName = started.container;
    } else {
      const started = await startNode();
      child = started.child;
    }

    const ready = await waitUntilReady(HEALTH_URL, 90000);
    if (!ready) throw new Error('server never became ready');

    await probe(MODE === 'docker' ? 'Docker container probes' : 'Node HTTP server probes');

    const pass = results.filter((r) => r.ok).length;
    const fail = results.length - pass;
    console.log(`\n📊 ${pass} passed, ${fail} failed (${MODE})`);

    const report = {
      mode: MODE,
      timestamp: new Date().toISOString(),
      origin: ORIGIN,
      pass,
      fail,
      results,
    };
    const reportPath = path.join(REPO_ROOT, 'reports', `mcp-verify-${MODE}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
    console.log(`📝 wrote ${path.relative(REPO_ROOT, reportPath)}`);
    if (fail > 0) process.exitCode = 1;
  } finally {
    if (child) {
      try {
        child.kill('SIGTERM');
      } catch {}
    }
    if (containerName) {
      spawn('docker', ['stop', containerName], { stdio: 'ignore' });
    }
  }
}

main().catch((err) => {
  console.error('❌ verify-deployment crashed:', err);
  process.exitCode = 2;
});
