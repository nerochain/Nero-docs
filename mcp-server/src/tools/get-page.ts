import { loadCorpus } from '../corpus.js';
import { CANONICAL_ORIGIN } from '../config.js';

function normalizePath(input: string): string {
  let p = input.trim();
  if (p.startsWith(CANONICAL_ORIGIN)) p = p.slice(CANONICAL_ORIGIN.length);
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\.md$/, '').replace(/\.mdx$/, '').replace(/\/$/, '');
  return p || '/';
}

export const getPageTool = {
  name: 'get_page',
  description:
    'Fetch the full markdown content of a specific NERO docs page. Accepts either a URL path (e.g. /en/developer-tools/paymaster-api/core-methods) or a full canonical URL.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'URL path or full canonical URL. Trailing .md/.mdx is tolerated.',
      },
      locale: { type: 'string', enum: ['en', 'ja'] },
    },
    required: ['path'],
    additionalProperties: false,
  },
  async handler(args: { path: string; locale?: 'en' | 'ja' }) {
    const target = normalizePath(args.path);
    const corpus = loadCorpus();
    const toPath = (u: string) => u.replace(CANONICAL_ORIGIN, '') || '/';
    const matches = (p: { url: string; locale: string }) =>
      toPath(p.url) === target && (!args.locale || p.locale === args.locale);
    const page = corpus.find(matches) ?? corpus.find((p) => toPath(p.url) === target);
    if (!page) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `No page at ${target}.` }],
      };
    }
    const absoluteUrl = page.url.startsWith('http') ? page.url : `${CANONICAL_ORIGIN}${page.url}`;
    return {
      content: [
        {
          type: 'text' as const,
          text: `# ${page.title}\nSource: ${absoluteUrl}\nSection: ${page.section}\nLocale: ${page.locale}\n\n${page.markdown}`,
        },
      ],
      structuredContent: {
        url: absoluteUrl,
        title: page.title,
        section: page.section,
        locale: page.locale,
        tokens: page.tokens,
        markdown: page.markdown,
      },
    };
  },
};
