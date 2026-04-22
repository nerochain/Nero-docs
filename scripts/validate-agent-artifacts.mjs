#!/usr/bin/env node
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { parse as parseHtml } from 'node-html-parser';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const OUT_DIR = path.join(REPO_ROOT, 'out');

let pass = 0;
let fail = 0;
const failures = [];

function check(label, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`✅ ${label}`);
  } else {
    fail++;
    failures.push(label + (detail ? ` — ${detail}` : ''));
    console.error(`❌ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function readText(relPath) {
  return fs.readFile(path.join(OUT_DIR, relPath), 'utf8');
}

async function exists(relPath) {
  try {
    await fs.access(path.join(OUT_DIR, relPath));
    return true;
  } catch {
    return false;
  }
}

async function parseJsonFile(relPath) {
  const raw = await readText(relPath);
  return JSON.parse(raw);
}

async function checkLlmsTxt(locale) {
  const suffix = locale === 'ja' ? '-ja' : '';
  const file = `llms${suffix}.txt`;
  if (!(await exists(file))) {
    check(`${file} exists`, false);
    return;
  }
  const text = await readText(file);
  check(`${file} has H1`, /^#\s+.+/m.test(text));
  check(`${file} has section headings`, (text.match(/^##\s+/gm) ?? []).length >= 2);
  check(`${file} has ≥ 10 markdown links`, (text.match(/\[[^\]]+\]\([^)]+\)/g) ?? []).length >= 10);
  check(
    `${file} mentions llms-full${suffix}.txt`,
    text.includes(`llms-full${suffix}.txt`),
  );
}

async function checkLlmsFull(locale) {
  const suffix = locale === 'ja' ? '-ja' : '';
  const file = `llms-full${suffix}.txt`;
  if (!(await exists(file))) {
    check(`${file} exists`, false);
    return;
  }
  const text = await readText(file);
  check(`${file} ≥ 20,000 chars`, text.length >= 20000, `got ${text.length}`);
  const h1s = (text.match(/^#\s+/gm) ?? []).length;
  check(`${file} has ≥ 10 H1s`, h1s >= 10, `got ${h1s}`);
}

async function checkJsonl() {
  const file = 'llms-full.jsonl';
  if (!(await exists(file))) {
    check(`${file} exists`, false);
    return;
  }
  const text = await readText(file);
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  check(`${file} ≥ 100 records`, lines.length >= 100, `got ${lines.length}`);
  try {
    const sample = JSON.parse(lines[0]);
    check(
      `${file} records have required fields`,
      ['url', 'locale', 'section', 'title', 'markdown', 'tokens'].every((k) => k in sample),
    );
  } catch (err) {
    check(`${file} first record parses`, false, err.message);
  }
}

async function checkSiteIndex() {
  if (!(await exists('site-index.json'))) {
    check('site-index.json exists', false);
    return;
  }
  const data = await parseJsonFile('site-index.json');
  check('site-index.json is an array', Array.isArray(data));
  check(
    'site-index.json entries have required fields',
    Array.isArray(data) &&
      data.every((r) => r.url && r.locale && r.title && Array.isArray(r.headings)),
  );
}

async function checkSitemap() {
  if (!(await exists('sitemap.xml'))) {
    check('sitemap.xml exists', false);
    return;
  }
  const text = await readText('sitemap.xml');
  try {
    const parser = new XMLParser({ ignoreAttributes: false });
    const doc = parser.parse(text);
    const urls = doc?.urlset?.url ?? [];
    check('sitemap.xml parses as XML with <urlset>', !!doc?.urlset);
    check('sitemap.xml has ≥ 70 URLs', Array.isArray(urls) ? urls.length >= 70 : false, `got ${Array.isArray(urls) ? urls.length : 0}`);
  } catch (err) {
    check('sitemap.xml parses as XML', false, err.message);
  }
}

async function checkRobotsTxt() {
  const publicRobots = path.join(REPO_ROOT, 'public', 'robots.txt');
  if (!fsSync.existsSync(publicRobots)) {
    check('public/robots.txt exists', false);
    return;
  }
  const text = await fs.readFile(publicRobots, 'utf8');
  check('robots.txt has Sitemap: directive', /^Sitemap:\s/m.test(text));
  check('robots.txt allow-lists GPTBot', /User-agent:\s*GPTBot/i.test(text));
  check('robots.txt allow-lists ClaudeBot', /User-agent:\s*ClaudeBot/i.test(text));
}

async function checkWellKnown() {
  const base = 'public/.well-known';
  const baseAbs = path.join(REPO_ROOT, base);
  const pairs = [
    ['ai-plugin.json', true],
    ['agent-card.json', true],
    ['agent-skills/index.json', true],
    ['api-catalog', true],
    ['oauth-protected-resource', true],
    ['http-message-signatures-directory', true],
    ['llms.txt', false],
    ['nero-docs.json', true],
  ];
  for (const [rel, mustBeJson] of pairs) {
    const abs = path.join(baseAbs, rel);
    if (!fsSync.existsSync(abs)) {
      check(`${base}/${rel} exists`, false);
      continue;
    }
    check(`${base}/${rel} exists`, true);
    if (mustBeJson) {
      try {
        JSON.parse(await fs.readFile(abs, 'utf8'));
        check(`${base}/${rel} is valid JSON`, true);
      } catch (err) {
        check(`${base}/${rel} is valid JSON`, false, err.message);
      }
    }
  }
}

async function checkOpenApi() {
  const abs = path.join(REPO_ROOT, 'spec', 'paymaster-openapi.yaml');
  if (!fsSync.existsSync(abs)) {
    check('spec/paymaster-openapi.yaml exists', false);
    return;
  }
  check('spec/paymaster-openapi.yaml exists', true);
  const text = await fs.readFile(abs, 'utf8');
  check('OpenAPI spec declares 3.1.0', /^openapi:\s*3\.1\.0/m.test(text));
  check('OpenAPI spec defines pm_supported_tokens', text.includes('pm_supported_tokens'));
  check('OpenAPI spec defines pm_sponsor_userop', text.includes('pm_sponsor_userop'));
  check('OpenAPI spec defines pm_entrypoints', text.includes('pm_entrypoints'));
  check('OpenAPI spec declares security scheme', text.includes('securitySchemes'));
}

async function checkIndexAndPricing() {
  for (const p of ['index.md', 'pricing.md']) {
    if (!(await exists(p))) {
      check(`${p} exists`, false);
      continue;
    }
    const text = await readText(p);
    check(`${p} is substantive (≥ 400 chars)`, text.length >= 400, `got ${text.length}`);
    check(`${p} has H1`, /^#\s+/m.test(text));
  }
}

async function checkSectionBundles() {
  const sections = ['getting-started', 'core-concepts', 'developer-tools', 'tutorials', 'node-validators'];
  for (const locale of ['en', 'ja']) {
    for (const section of sections) {
      const rel = path.join(locale, section, 'llms.txt');
      if (!(await exists(rel))) {
        check(`${rel} exists`, false);
        continue;
      }
      const text = await readText(rel);
      check(`${rel} has H1 + list`, /^#\s+/m.test(text) && /^-\s+\[/m.test(text));
    }
  }
}

async function resolveLocaleIndex(locale) {
  const candidates = [`${locale}.html`, `${locale}/index.html`];
  for (const c of candidates) {
    if (await exists(c)) return c;
  }
  return null;
}

async function checkHtmlMetadata() {
  const apex = 'index.html';
  if (!(await exists(apex))) {
    check(`${apex} exists`, false, 'did next build run?');
  } else {
    const root = parseHtml(await readText(apex));
    check(`${apex} has <meta name="description">`, !!root.querySelector('meta[name="description"]'));
    check(`${apex} has canonical link`, !!root.querySelector('link[rel="canonical"]'));
    check(
      `${apex} has JSON-LD`,
      root.querySelectorAll('script[type="application/ld+json"]').length >= 1,
    );
  }
  for (const locale of ['en', 'ja']) {
    const file = await resolveLocaleIndex(locale);
    if (!file) {
      check(`${locale} landing page exists`, false, 'did next build run?');
      continue;
    }
    check(`${locale} landing page exists (${file})`, true);
    const root = parseHtml(await readText(file));
    check(`${file} has <meta name="description">`, !!root.querySelector('meta[name="description"]'));
    check(`${file} has canonical link`, !!root.querySelector('link[rel="canonical"]'));
    check(`${file} has JSON-LD`, root.querySelectorAll('script[type="application/ld+json"]').length >= 1);
  }
}

async function main() {
  console.log(`🔎 validating ${OUT_DIR}…\n`);

  if (!fsSync.existsSync(OUT_DIR)) {
    console.error(`❌ out/ does not exist. Run \`yarn build\` first.`);
    process.exit(2);
  }

  for (const locale of ['en', 'ja']) {
    await checkLlmsTxt(locale);
    await checkLlmsFull(locale);
  }
  await checkJsonl();
  await checkSiteIndex();
  await checkSitemap();
  await checkRobotsTxt();
  await checkWellKnown();
  await checkOpenApi();
  await checkIndexAndPricing();
  await checkSectionBundles();
  await checkHtmlMetadata();

  console.log(`\n📊 ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ validator crashed:', err);
  process.exit(2);
});
