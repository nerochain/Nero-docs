import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..', '..');
export const PAGES_ROOT = path.join(REPO_ROOT, 'pages');
export const CANONICAL_ORIGIN = 'https://docs.nerochain.io';

const SECTIONS = [
  'getting-started',
  'core-concepts',
  'developer-tools',
  'tutorials',
  'node-validators',
];

function parseMetaSource(source) {
  const bodyMatch = source.match(/export\s+default\s+({[\s\S]*})/);
  if (!bodyMatch) return {};
  const body = bodyMatch[1];
  try {
    return Function(`"use strict"; return (${body});`)();
  } catch (err) {
    console.warn(`⚠️  failed to parse _meta.ts body: ${err.message}`);
    return {};
  }
}

async function readMeta(dir) {
  const metaPath = path.join(dir, '_meta.ts');
  try {
    const source = await fs.readFile(metaPath, 'utf8');
    return parseMetaSource(source);
  } catch {
    return {};
  }
}

function extractFirstHeading(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractSummary(body) {
  const cleaned = body
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export\s+const\s+meta[^\n]*(\n[^\n]*)*\n}/m, '')
    .replace(/^#[^\n]*\n/m, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*\n+/, '');
  const firstPara = cleaned.split(/\n\s*\n/).find((p) => p.trim().length > 40);
  if (!firstPara) return '';
  return firstPara.replace(/\s+/g, ' ').trim().slice(0, 200);
}

function extractHeadings(body) {
  const out = [];
  const re = /^(#{1,3})\s+(.+)$/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    out.push(`${m[1]} ${m[2].trim()}`);
  }
  return out;
}

export async function walkPages({ locales = ['en', 'ja'] } = {}) {
  const pages = [];
  for (const locale of locales) {
    const base = path.join(PAGES_ROOT, locale);
    const files = await glob('**/*.{mdx,md}', { cwd: base });
    for (const rel of files.sort()) {
      const abs = path.join(base, rel);
      const source = await fs.readFile(abs, 'utf8');
      const { data: frontmatter, content: body } = matter(source);
      const noExt = rel.replace(/\.(mdx|md)$/, '');
      let routePath = noExt.replace(/\/index$/, '');
      if (routePath === 'index') routePath = '';
      const url = `/${locale}${routePath ? '/' + routePath : ''}`;
      const section = routePath.split('/')[0] || '';
      const isIndex = noExt === 'index' || noExt.endsWith('/index');
      const title =
        frontmatter?.title ||
        extractFirstHeading(body) ||
        (routePath.split('/').pop() || locale).replace(/-/g, ' ');
      pages.push({
        absPath: abs,
        relPath: rel,
        locale,
        url,
        canonicalUrl: `${CANONICAL_ORIGIN}${url}`,
        section,
        isIndex,
        title: title.trim(),
        summary: extractSummary(body),
        headings: extractHeadings(body),
        frontmatter,
        raw: source,
        body,
      });
    }
  }
  return pages;
}

export async function collectMeta({ locales = ['en', 'ja'] } = {}) {
  const meta = {};
  for (const locale of locales) {
    const localeDir = path.join(PAGES_ROOT, locale);
    meta[locale] = { root: await readMeta(localeDir), sections: {} };
    for (const section of SECTIONS) {
      const dir = path.join(localeDir, section);
      try {
        const st = await fs.stat(dir);
        if (st.isDirectory()) {
          meta[locale].sections[section] = await readMeta(dir);
        }
      } catch {}
    }
  }
  return meta;
}

export function groupBySection(pages) {
  const groups = new Map();
  for (const section of SECTIONS) groups.set(section, []);
  groups.set('', []);
  for (const p of pages) {
    const key = groups.has(p.section) ? p.section : '';
    groups.get(key).push(p);
  }
  return groups;
}

export { SECTIONS };
