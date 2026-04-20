#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const REPORT_DIR = path.join(REPO_ROOT, 'reports');
const ORIGIN = process.env.DOCS_ORIGIN ?? 'https://docs.nerochain.io';
const MCP_ORIGIN = process.env.DOCS_MCP_ORIGIN ?? 'https://docs-mcp.nerochain.io';

const checks = [];
function record(name, ok, detail) {
  const result = { name, ok, detail };
  checks.push(result);
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function headCheck(url, { expectType, minStatus = 200, maxStatus = 299 } = {}) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const status = res.status;
    const ct = res.headers.get('content-type') ?? '';
    const ok = status >= minStatus && status <= maxStatus;
    if (!ok) return record(`HEAD ${url}`, false, `status=${status}`);
    if (expectType && !ct.includes(expectType)) {
      return record(`HEAD ${url}`, false, `content-type=${ct} expected ${expectType}`);
    }
    record(`HEAD ${url}`, true, `status=${status} ct=${ct}`);
  } catch (err) {
    record(`HEAD ${url}`, false, err.message);
  }
}

async function jsonCheck(url, predicate) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return record(`GET ${url}`, false, `status=${res.status}`);
    const text = await res.text();
    const data = JSON.parse(text);
    const ok = predicate ? !!predicate(data) : true;
    record(`GET ${url}`, ok, ok ? 'json parsed' : 'predicate failed');
  } catch (err) {
    record(`GET ${url}`, false, err.message);
  }
}

async function textLengthCheck(url, minLen, { userAgent } = {}) {
  try {
    const headers = userAgent ? { 'User-Agent': userAgent } : undefined;
    const res = await fetch(url, { redirect: 'follow', headers });
    if (!res.ok) return record(`GET ${url} (len)`, false, `status=${res.status}`);
    const text = await res.text();
    record(
      `GET ${url} (len≥${minLen}${userAgent ? ` UA=${userAgent}` : ''})`,
      text.length >= minLen,
      `got ${text.length} chars`,
    );
  } catch (err) {
    record(`GET ${url} (len)`, false, err.message);
  }
}

async function mcpInitialize(endpoint) {
  try {
    const res = await fetch(`${endpoint}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          clientInfo: { name: 'nero-docs-external-check', version: '1.0.0' },
          capabilities: {},
        },
      }),
    });
    if (!res.ok) return record(`MCP initialize ${endpoint}`, false, `status=${res.status}`);
    const text = await res.text();
    const hasResult = text.includes('"result"');
    record(`MCP initialize ${endpoint}`, hasResult, hasResult ? 'result present' : text.slice(0, 120));
  } catch (err) {
    record(`MCP initialize ${endpoint}`, false, err.message);
  }
}

async function main() {
  console.log(`🌐 external validation against ${ORIGIN}\n`);

  await headCheck(`${ORIGIN}/llms.txt`, { expectType: 'text/plain' });
  await headCheck(`${ORIGIN}/llms-full.txt`, { expectType: 'text/plain' });
  await headCheck(`${ORIGIN}/llms-full.jsonl`, { expectType: 'application/jsonl' });
  await headCheck(`${ORIGIN}/site-index.json`, { expectType: 'application/json' });
  await headCheck(`${ORIGIN}/sitemap.xml`, { expectType: 'application/xml' });
  await headCheck(`${ORIGIN}/robots.txt`, { expectType: 'text/plain' });
  await headCheck(`${ORIGIN}/index.md`, { expectType: 'text/markdown' });
  await headCheck(`${ORIGIN}/pricing.md`, { expectType: 'text/markdown' });
  await headCheck(`${ORIGIN}/specs/paymaster-openapi.yaml`, { expectType: 'application/yaml' });
  await headCheck(`${ORIGIN}/specs/paymaster-openapi.json`, { expectType: 'application/json' });

  await jsonCheck(`${ORIGIN}/.well-known/ai-plugin.json`, (d) => d.schema_version);
  await jsonCheck(`${ORIGIN}/.well-known/agent-card.json`, (d) => Array.isArray(d.skills));
  await jsonCheck(
    `${ORIGIN}/.well-known/agent-skills/index.json`,
    (d) => Array.isArray(d.skills) && d.skills.length >= 4,
  );
  await jsonCheck(`${ORIGIN}/.well-known/api-catalog`, (d) => Array.isArray(d.linkset));
  await jsonCheck(`${ORIGIN}/.well-known/oauth-protected-resource`, (d) => d.resource);
  await jsonCheck(`${ORIGIN}/.well-known/nero-docs.json`, (d) => Array.isArray(d.sections));

  await textLengthCheck(`${ORIGIN}/llms.txt`, 500);
  await textLengthCheck(`${ORIGIN}/llms-full.txt`, 20000);
  await textLengthCheck(`${ORIGIN}/`, 500, { userAgent: 'ClaudeBot/1.0' });
  await textLengthCheck(`${ORIGIN}/`, 500, { userAgent: 'GPTBot/1.0' });

  await mcpInitialize(MCP_ORIGIN);

  await fs.mkdir(REPORT_DIR, { recursive: true });
  const report = {
    timestamp: new Date().toISOString(),
    origin: ORIGIN,
    mcpOrigin: MCP_ORIGIN,
    pass: checks.filter((c) => c.ok).length,
    fail: checks.filter((c) => !c.ok).length,
    checks,
  };
  await fs.writeFile(
    path.join(REPORT_DIR, 'external-latest.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(`\n📊 ${report.pass} passed, ${report.fail} failed`);
  console.log(`📝 report: reports/external-latest.json`);
  if (report.fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error('❌ external-validation crashed:', err);
  process.exit(2);
});
