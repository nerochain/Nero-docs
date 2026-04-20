#!/usr/bin/env node
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MiniSearch from 'minisearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PACKAGE_ROOT, '..');
const DATA_DIR = path.join(PACKAGE_ROOT, 'data');

const SOURCE = path.join(REPO_ROOT, 'out', 'llms-full.jsonl');

async function main() {
  if (!fsSync.existsSync(SOURCE)) {
    console.error(
      `❌ expected corpus at ${SOURCE}. Run \`yarn build\` at the repo root first.`,
    );
    process.exit(1);
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  const raw = await fs.readFile(SOURCE, 'utf8');
  const corpus = raw
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l));

  await fs.writeFile(path.join(DATA_DIR, 'corpus.json'), JSON.stringify(corpus));

  const ms = new MiniSearch({
    fields: ['title', 'summary', 'headings', 'markdown'],
    storeFields: ['url', 'locale', 'section', 'title', 'summary', 'headings', 'tokens'],
    idField: 'url',
    searchOptions: { boost: { title: 3, headings: 2, summary: 1.5 }, fuzzy: 0.2, prefix: true },
  });
  ms.addAll(
    corpus.map((p) => ({
      ...p,
      headings: Array.isArray(p.headings) ? p.headings.join('\n') : '',
    })),
  );
  await fs.writeFile(path.join(DATA_DIR, 'search-index.json'), JSON.stringify(ms));

  console.log(
    `✅ built index for ${corpus.length} pages → ${path.relative(REPO_ROOT, DATA_DIR)}`,
  );
}

main().catch((err) => {
  console.error('❌ build-index failed:', err);
  process.exit(1);
});
