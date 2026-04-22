import { loadCorpus } from '../corpus.js';
import { CANONICAL_ORIGIN } from '../config.js';

function toPath(url: string): string {
  const withoutOrigin = url.replace(CANONICAL_ORIGIN, '');
  return withoutOrigin || '/';
}

export function docsUriForPage(url: string): string {
  return `docs:/${toPath(url)}`;
}

export function parseDocsUri(uri: string): string | null {
  if (!uri.startsWith('docs:')) return null;
  const pathPart = uri.replace(/^docs:\/*/, '/');
  return pathPart;
}

export function listDocsResources() {
  const corpus = loadCorpus();
  return corpus.map((p) => ({
    uri: docsUriForPage(p.url),
    name: p.title,
    description: p.summary || undefined,
    mimeType: 'text/markdown',
    annotations: {
      audience: ['assistant'],
      priority: p.section === 'getting-started' ? 0.8 : 0.5,
    },
  }));
}

export function readDocsResource(uri: string) {
  const target = parseDocsUri(uri);
  if (!target) return null;
  const corpus = loadCorpus();
  const page = corpus.find((p) => toPath(p.url) === target);
  if (!page) return null;
  const absoluteUrl = page.url.startsWith('http') ? page.url : `${CANONICAL_ORIGIN}${page.url}`;
  return {
    contents: [
      {
        uri,
        mimeType: 'text/markdown',
        text: `# ${page.title}\nSource: ${absoluteUrl}\n\n${page.markdown}`,
      },
    ],
  };
}
