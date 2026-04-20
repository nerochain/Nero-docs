#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = path.join(REPO_ROOT, 'pages');

const files = await glob('**/CLAUDE.md', { cwd: PAGES, absolute: true });
for (const f of files) {
  await fs.rm(f, { force: true });
}
if (files.length) console.log(`🧹 removed ${files.length} stray CLAUDE.md from pages/`);
