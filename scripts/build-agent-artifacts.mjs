#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkPages, CANONICAL_ORIGIN, REPO_ROOT, SECTIONS } from './lib/pagewalker.mjs';
import { extractPlainMarkdown, extractTitleAndBody } from './lib/extract-mdx.mjs';
import { estimateTokens, formatTokens } from './lib/token-estimator.mjs';
import { sectionLabel } from './lib/section-index.mjs';
import { injectMetadata } from './lib/jsonld-injector.mjs';

const __filename = fileURLToPath(import.meta.url);
const OUT_DIR = path.join(REPO_ROOT, 'out');
const SPEC_DIR = path.join(REPO_ROOT, 'spec');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeFileEnsured(p, content) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, content);
}

const SITE_TITLE = {
  en: 'NERO Chain Documentation',
  ja: 'NERO Chain ドキュメント',
};

const SITE_DESCRIPTION = {
  en: 'Developer documentation for NERO Chain — a Layer-1 blockchain with native account abstraction, paymaster-based gas sponsorship, and Web2-friendly onboarding.',
  ja: 'NERO Chain の開発者向けドキュメント。ネイティブなアカウント抽象化、ペイマスターによるガス代スポンサーシップ、Web2 フレンドリーなオンボーディングを備えたレイヤー 1 ブロックチェーンです。',
};

function buildLlmsTxt(locale, pages) {
  const lines = [];
  lines.push(`# ${SITE_TITLE[locale]}`);
  lines.push('');
  lines.push(`> ${SITE_DESCRIPTION[locale]}`);
  lines.push('');
  lines.push(
    locale === 'en'
      ? 'This llms.txt indexes documentation pages for AI agents. Full markdown is at /llms-full.txt. OpenAPI for the Paymaster JSON-RPC API is at /specs/paymaster-openapi.yaml. The NERO Docs MCP server is at https://docs-mcp.nerochain.io.'
      : 'この llms.txt は AI エージェント向けのドキュメント索引です。完全なマークダウンは /llms-full.txt 、ペイマスター JSON-RPC API の OpenAPI は /specs/paymaster-openapi.yaml にあります。NERO Docs MCP サーバーは https://docs-mcp.nerochain.io です。',
  );
  lines.push('');

  const grouped = new Map();
  for (const section of SECTIONS) grouped.set(section, []);
  grouped.set('', []);
  for (const p of pages) {
    const key = grouped.has(p.section) ? p.section : '';
    grouped.get(key).push(p);
  }

  for (const [section, list] of grouped) {
    if (list.length === 0) continue;
    const displayList = list.slice().sort((a, b) => {
      if (a.isIndex && !b.isIndex) return -1;
      if (!a.isIndex && b.isIndex) return 1;
      return a.url.localeCompare(b.url);
    });
    lines.push(`## ${sectionLabel(locale, section)}`);
    lines.push('');
    for (const p of displayList) {
      const summary = p.summary ? `: ${p.summary}` : '';
      lines.push(`- [${p.title}](${p.canonicalUrl}.md)${summary}`);
    }
    lines.push('');
  }

  lines.push('## Optional');
  lines.push('');
  lines.push(`- [Full documentation corpus](${CANONICAL_ORIGIN}/llms-full${locale === 'ja' ? '-ja' : ''}.txt)`);
  lines.push(`- [JSON site index](${CANONICAL_ORIGIN}/site-index.json)`);
  lines.push(`- [Paymaster OpenAPI (YAML)](${CANONICAL_ORIGIN}/specs/paymaster-openapi.yaml)`);
  lines.push(`- [Paymaster OpenAPI (JSON)](${CANONICAL_ORIGIN}/specs/paymaster-openapi.json)`);
  lines.push(`- [AI resources hub](${CANONICAL_ORIGIN}/${locale}/ai-resources)`);

  return lines.join('\n') + '\n';
}

function buildSectionLlmsTxt(locale, section, pages) {
  const label = sectionLabel(locale, section);
  const lines = [];
  lines.push(`# ${SITE_TITLE[locale]} — ${label}`);
  lines.push('');
  lines.push(
    locale === 'en'
      ? `> Curated index of pages in the "${label}" section. Full markdown at /llms-full.txt.`
      : `> 「${label}」セクションのキュレーション済みインデックス。完全版は /llms-full.txt にあります。`,
  );
  lines.push('');
  lines.push(`## ${label}`);
  lines.push('');
  const ordered = pages.slice().sort((a, b) => {
    if (a.isIndex && !b.isIndex) return -1;
    if (!a.isIndex && b.isIndex) return 1;
    return a.url.localeCompare(b.url);
  });
  for (const p of ordered) {
    const summary = p.summary ? `: ${p.summary}` : '';
    lines.push(`- [${p.title}](${p.canonicalUrl}.md)${summary}`);
  }
  lines.push('');
  return lines.join('\n') + '\n';
}

function buildLlmsFull(locale, pages) {
  const parts = [];
  parts.push(`# ${SITE_TITLE[locale]} — Full Corpus`);
  parts.push('');
  parts.push(`> ${SITE_DESCRIPTION[locale]}`);
  parts.push('');
  parts.push(`Source: ${CANONICAL_ORIGIN}/${locale}`);
  parts.push(`Pages: ${pages.length}`);
  parts.push('');
  for (const p of pages) {
    const md = extractPlainMarkdown(p.raw);
    const { body } = extractTitleAndBody(p.raw);
    parts.push('---');
    parts.push('');
    parts.push(`# ${p.title}`);
    parts.push('');
    parts.push(`Source: ${p.canonicalUrl}`);
    parts.push(`Section: ${sectionLabel(locale, p.section)}`);
    parts.push('');
    parts.push(body.trim() || md.trim());
    parts.push('');
  }
  return parts.join('\n');
}

function buildLlmsFullJsonl(pages) {
  const lines = [];
  for (const p of pages) {
    const md = extractPlainMarkdown(p.raw);
    const { body } = extractTitleAndBody(p.raw);
    const markdown = (body || md).trim();
    lines.push(
      JSON.stringify({
        url: p.canonicalUrl,
        locale: p.locale,
        section: p.section,
        title: p.title,
        summary: p.summary,
        headings: p.headings,
        tokens: estimateTokens(markdown),
        markdown,
      }),
    );
  }
  return lines.join('\n') + '\n';
}

function buildSiteIndex(pages) {
  return (
    JSON.stringify(
      pages.map((p) => ({
        url: p.canonicalUrl,
        locale: p.locale,
        section: p.section,
        title: p.title,
        summary: p.summary,
        headings: p.headings,
        tokens: estimateTokens(extractPlainMarkdown(p.raw)),
      })),
      null,
      2,
    ) + '\n'
  );
}

function buildSitemap(pages) {
  const byUrl = new Map();
  for (const p of pages) byUrl.set(p.url, p);
  const paired = new Map();
  for (const p of pages) {
    const noLocale = p.url.replace(/^\/(en|ja)/, '');
    if (!paired.has(noLocale)) paired.set(noLocale, {});
    paired.get(noLocale)[p.locale] = p;
  }
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  );
  const staticUrls = [
    `${CANONICAL_ORIGIN}/`,
    `${CANONICAL_ORIGIN}/llms.txt`,
    `${CANONICAL_ORIGIN}/llms-full.txt`,
    `${CANONICAL_ORIGIN}/pricing.md`,
    `${CANONICAL_ORIGIN}/specs/paymaster-openapi.yaml`,
  ];
  for (const u of staticUrls) {
    lines.push('  <url>');
    lines.push(`    <loc>${u}</loc>`);
    lines.push('  </url>');
  }
  for (const [, pair] of paired) {
    const primary = pair.en ?? pair.ja;
    if (!primary) continue;
    lines.push('  <url>');
    lines.push(`    <loc>${primary.canonicalUrl}</loc>`);
    for (const loc of ['en', 'ja']) {
      if (pair[loc]) {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${loc}" href="${pair[loc].canonicalUrl}"/>`,
        );
      }
    }
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

function buildIndexMarkdown(locale) {
  if (locale === 'en') {
    return `# NERO Chain Documentation

NERO Chain is a Layer-1 blockchain with native account abstraction, paymaster-based gas sponsorship, and Web2-friendly authentication (social logins, password-based security, MetaMask). These docs cover the protocol architecture, developer tools, and integration tutorials.

## Start here

- [Introduction](${CANONICAL_ORIGIN}/en/getting-started/introduction.md) — what NERO is and why it exists
- [dApp architecture](${CANONICAL_ORIGIN}/en/getting-started/nero-dapp-architecture.md) — how the components fit together
- [Key features](${CANONICAL_ORIGIN}/en/getting-started/key-features.md) — the capabilities you can build on

## Build

- [Developer Tools](${CANONICAL_ORIGIN}/en/developer-tools) — Paymaster API, UserOp SDK, AA Platform, AA Wallet UI
- [Cookbook](${CANONICAL_ORIGIN}/en/tutorials) — deploy your first contract, send gasless transactions, integrate AA wallets
- [Paymaster OpenAPI](${CANONICAL_ORIGIN}/specs/paymaster-openapi.yaml)

## Learn

- [White Paper](${CANONICAL_ORIGIN}/en/core-concepts) — architecture, consensus, data availability, fee sharing, native account abstraction
- [Node Validators](${CANONICAL_ORIGIN}/en/node-validators) — run a NERO validator
- [FAQ](${CANONICAL_ORIGIN}/en/faq.md)

## For AI agents

- [AI resources hub](${CANONICAL_ORIGIN}/en/ai-resources) — MCP endpoint, bundles, install snippets
- [llms.txt](${CANONICAL_ORIGIN}/llms.txt) — curated index
- [llms-full.txt](${CANONICAL_ORIGIN}/llms-full.txt) — full corpus
- [site-index.json](${CANONICAL_ORIGIN}/site-index.json) — metadata for every page
`;
  }
  return `# NERO Chain ドキュメント

NERO Chain は、ネイティブなアカウント抽象化、ペイマスターによるガス代スポンサーシップ、Web2 フレンドリーな認証（ソーシャルログイン、パスワード、MetaMask）を備えたレイヤー 1 ブロックチェーンです。このドキュメントでは、プロトコルアーキテクチャ、開発者ツール、統合チュートリアルを扱います。

## はじめに

- [Introduction](${CANONICAL_ORIGIN}/ja/getting-started/introduction.md)
- [dApp アーキテクチャ](${CANONICAL_ORIGIN}/ja/getting-started/nero-dapp-architecture.md)
- [主な機能](${CANONICAL_ORIGIN}/ja/getting-started/key-features.md)

## 構築

- [開発者ツール](${CANONICAL_ORIGIN}/ja/developer-tools)
- [クックブック](${CANONICAL_ORIGIN}/ja/tutorials)
- [Paymaster OpenAPI](${CANONICAL_ORIGIN}/specs/paymaster-openapi.yaml)

## 学ぶ

- [ホワイトペーパー](${CANONICAL_ORIGIN}/ja/core-concepts)
- [ノードバリデータ](${CANONICAL_ORIGIN}/ja/node-validators)
- [FAQ](${CANONICAL_ORIGIN}/ja/faq.md)

## AI エージェント向け

- [AI リソース ハブ](${CANONICAL_ORIGIN}/ja/ai-resources)
- [llms.txt](${CANONICAL_ORIGIN}/llms.txt)
- [llms-full-ja.txt](${CANONICAL_ORIGIN}/llms-full-ja.txt)
`;
}

function buildPricingMarkdown() {
  return `# NERO Chain — Costs, Gas & Paymaster Sponsorship

NERO Chain is not a SaaS with plan tiers. This page explains the economic model so agents and developers can answer user questions about cost.

## Native gas

- Gas on NERO Chain is paid in **NERO**, the native token.
- The EntryPoint contract (ERC-4337-compatible) is deployed at \`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789\`.
- All transactions are UserOperations routed through bundlers; end users never need to hold NERO when a dApp opts into paymaster sponsorship.

## Paymaster sponsorship types

NERO's Paymaster API (see [Core JSON-RPC Methods](${CANONICAL_ORIGIN}/en/developer-tools/paymaster-api/core-methods.md)) supports three payment models:

| Type | Who pays | When | Use case |
|---|---|---|---|
| **0 — Developer-sponsored (free)** | dApp developer | Up-front, from the AA Platform balance | Onboarding, promos, games, Web2-style UX |
| **1 — Prepay in ERC-20** | End user, in any supported ERC-20 | Before execution, with automatic refund of surplus | Token-centric apps, predictable max-spend |
| **2 — Postpay in ERC-20** | End user, in any supported ERC-20 | After execution, charged exactly for gas used | Variable-cost operations, token-balance-holding users |

## AA Platform

The [AA Platform dashboard](https://aa-platform.nerochain.io) is the developer-facing console where you:

- Generate API keys for the Paymaster API
- Top up a sponsorship balance (for Type 0)
- Configure supported tokens, price margins, and per-user/daily quotas
- Monitor usage and spend

Access is free. Top-ups are self-serve.

## Testnet

Testnet NERO is free via the faucet. Testnet paymaster sponsorship works identically to mainnet; API keys are scoped to the network.

## Price discovery for ERC-20 gas

The Price Service provides current token/NERO exchange rates so Type 1 and Type 2 payments settle at fair value. Supported tokens and current prices are exposed via [\`pm_supported_tokens\`](${CANONICAL_ORIGIN}/en/developer-tools/paymaster-api/core-methods.md#pm_supported_tokens).

## Fee sharing

For dApp developers and node operators, NERO's fee-sharing model lets contracts register for a share of the gas fees generated by their users. See [Fee Sharing](${CANONICAL_ORIGIN}/en/core-concepts/fee-sharing).

## Machine-readable

- [Paymaster OpenAPI spec](${CANONICAL_ORIGIN}/specs/paymaster-openapi.yaml)
- [llms-full.txt](${CANONICAL_ORIGIN}/llms-full.txt) — full docs corpus
- [AI resources hub](${CANONICAL_ORIGIN}/en/ai-resources)
`;
}

async function copyPaymasterOpenApi() {
  const src = path.join(SPEC_DIR, 'paymaster-openapi.yaml');
  try {
    const yaml = await fs.readFile(src, 'utf8');
    const { load } = await import('js-yaml');
    const json = JSON.stringify(load(yaml), null, 2) + '\n';
    await writeFileEnsured(path.join(OUT_DIR, 'specs', 'paymaster-openapi.yaml'), yaml);
    await writeFileEnsured(path.join(OUT_DIR, 'specs', 'paymaster-openapi.json'), json);
    await writeFileEnsured(path.join(OUT_DIR, 'openapi.yaml'), yaml);
    await writeFileEnsured(path.join(OUT_DIR, 'openapi.json'), json);
    await writeFileEnsured(path.join(OUT_DIR, 'api', 'openapi.yaml'), yaml);
    await writeFileEnsured(path.join(OUT_DIR, 'api', 'openapi.json'), json);
    console.log(`✅ published OpenAPI spec at /specs/, /openapi.*, /api/openapi.*`);
  } catch (err) {
    console.warn(`⚠️  could not copy Paymaster OpenAPI: ${err.message}`);
  }
}

async function emitLlmsAliases(byLocale) {
  const enPages = byLocale.en;
  const rootIndex = buildLlmsTxt('en', enPages);
  const aliases = ['docs/llms.txt', 'api/llms.txt', 'developers/llms.txt'];
  for (const rel of aliases) {
    await writeFileEnsured(path.join(OUT_DIR, rel), rootIndex);
  }
  console.log(`✅ published llms.txt aliases at ${aliases.map((a) => '/' + a).join(', ')}`);
}

async function emitPerPageMarkdown(pages) {
  let count = 0;
  for (const p of pages) {
    const { body } = extractTitleAndBody(p.raw);
    const md = extractPlainMarkdown(p.raw);
    const markdown =
      `# ${p.title}\n\n` +
      `Source: ${p.canonicalUrl}\n` +
      `Section: ${sectionLabel(p.locale, p.section)}\n` +
      `Locale: ${p.locale}\n\n` +
      (body?.trim() || md.trim()) +
      '\n';
    const urlPath = p.url.replace(/^\//, '');
    const targetBase = urlPath || `${p.locale}/index`;
    await writeFileEnsured(path.join(OUT_DIR, `${targetBase}.md`), markdown);
    count++;
  }
  console.log(`✅ emitted ${count} per-page markdown siblings for content negotiation`);
}

async function main() {
  console.log('🔍 walking pages…');
  const pages = await walkPages({ locales: ['en', 'ja'] });
  const byLocale = { en: [], ja: [] };
  for (const p of pages) byLocale[p.locale].push(p);
  console.log(`📝 ${byLocale.en.length} EN pages, ${byLocale.ja.length} JA pages`);

  await ensureDir(OUT_DIR);

  for (const locale of ['en', 'ja']) {
    const localePages = byLocale[locale];
    const suffix = locale === 'ja' ? '-ja' : '';

    const llmsTxt = buildLlmsTxt(locale, localePages);
    await writeFileEnsured(path.join(OUT_DIR, `llms${suffix}.txt`), llmsTxt);

    const llmsFull = buildLlmsFull(locale, localePages);
    await writeFileEnsured(path.join(OUT_DIR, `llms-full${suffix}.txt`), llmsFull);

    for (const section of SECTIONS) {
      const sectionPages = localePages.filter((p) => p.section === section);
      if (sectionPages.length === 0) continue;
      const sectionTxt = buildSectionLlmsTxt(locale, section, sectionPages);
      await writeFileEnsured(path.join(OUT_DIR, locale, section, 'llms.txt'), sectionTxt);
    }

    await writeFileEnsured(path.join(OUT_DIR, locale, 'index.md'), buildIndexMarkdown(locale));
  }

  await writeFileEnsured(path.join(OUT_DIR, 'llms-full.jsonl'), buildLlmsFullJsonl(pages));
  await writeFileEnsured(path.join(OUT_DIR, 'site-index.json'), buildSiteIndex(pages));
  await writeFileEnsured(path.join(OUT_DIR, 'sitemap.xml'), buildSitemap(pages));
  await writeFileEnsured(path.join(OUT_DIR, 'index.md'), buildIndexMarkdown('en'));
  await writeFileEnsured(path.join(OUT_DIR, 'pricing.md'), buildPricingMarkdown());

  await copyPaymasterOpenApi();
  await emitLlmsAliases(byLocale);
  await emitPerPageMarkdown(pages);

  console.log('🧬 injecting JSON-LD + per-page metadata…');
  try {
    await injectMetadata({ outDir: OUT_DIR, pages });
  } catch (err) {
    console.warn(`⚠️  metadata injection skipped: ${err.message}`);
  }

  console.log('✨ done');
}

main().catch((err) => {
  console.error('❌ build-agent-artifacts failed:', err);
  process.exit(1);
});
