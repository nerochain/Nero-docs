import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(PACKAGE_ROOT, 'data');
export const CORPUS_PATH = path.join(DATA_DIR, 'corpus.json');
export const SEARCH_INDEX_PATH = path.join(DATA_DIR, 'search-index.json');
export const CODE_EXAMPLES_PATH = path.join(DATA_DIR, 'code-examples.json');

export const TRANSPORT = process.env.MCP_TRANSPORT ?? 'http';
export const HTTP_PORT = Number(process.env.PORT ?? 8080);
export const HTTP_HOST = process.env.HOST ?? '0.0.0.0';
export const CANONICAL_ORIGIN = process.env.DOCS_ORIGIN ?? 'https://docs.nerochain.io';

export const SERVER_INFO = {
  name: 'nero-chain-docs',
  version: '1.0.0',
};
