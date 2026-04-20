import fs from 'node:fs';
import MiniSearch from 'minisearch';
import { CORPUS_PATH, SEARCH_INDEX_PATH } from './config.js';

export type Page = {
  url: string;
  locale: 'en' | 'ja';
  section: string;
  title: string;
  summary: string;
  headings: string[];
  tokens: number;
  markdown: string;
};

let cachedCorpus: Page[] | null = null;
let cachedSearch: MiniSearch<Page> | null = null;

export function loadCorpus(): Page[] {
  if (cachedCorpus) return cachedCorpus;
  if (!fs.existsSync(CORPUS_PATH)) {
    throw new Error(
      `corpus missing at ${CORPUS_PATH}. Run \`yarn --cwd mcp-server build:index\` after \`yarn build\` at the repo root.`,
    );
  }
  const raw = fs.readFileSync(CORPUS_PATH, 'utf8');
  cachedCorpus = JSON.parse(raw) as Page[];
  return cachedCorpus;
}

export function loadSearchIndex(): MiniSearch<Page> {
  if (cachedSearch) return cachedSearch;
  if (!fs.existsSync(SEARCH_INDEX_PATH)) {
    const corpus = loadCorpus();
    cachedSearch = buildSearchIndex(corpus);
    return cachedSearch;
  }
  const raw = fs.readFileSync(SEARCH_INDEX_PATH, 'utf8');
  cachedSearch = MiniSearch.loadJSON<Page>(raw, {
    fields: ['title', 'summary', 'headings', 'markdown'],
    storeFields: ['url', 'locale', 'section', 'title', 'summary', 'headings', 'tokens'],
    idField: 'url',
  });
  return cachedSearch;
}

export function buildSearchIndex(corpus: Page[]): MiniSearch<Page> {
  const ms = new MiniSearch<Page>({
    fields: ['title', 'summary', 'headings', 'markdown'],
    storeFields: ['url', 'locale', 'section', 'title', 'summary', 'headings', 'tokens'],
    idField: 'url',
    searchOptions: { boost: { title: 3, headings: 2, summary: 1.5 }, fuzzy: 0.2, prefix: true },
  });
  ms.addAll(
    corpus.map((p) => ({
      ...p,
      headings: p.headings.join('\n'),
    })) as unknown as Page[],
  );
  return ms;
}

export function getPageByUrl(url: string): Page | undefined {
  return loadCorpus().find((p) => p.url === url);
}
