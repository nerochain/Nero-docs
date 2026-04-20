import { loadSearchIndex } from '../corpus.js';

export const searchDocsTool = {
  name: 'search_docs',
  description:
    'Full-text search across NERO Chain documentation pages (EN + JA). Returns ranked hits with URL, title, section, summary, and a short snippet.',
  _meta: {
    ui: { resourceUri: 'ui://nero-docs/search-results' },
  },
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query (EN or JA).' },
      locale: { type: 'string', enum: ['en', 'ja'], description: 'Restrict to a single locale.' },
      section: {
        type: 'string',
        enum: [
          'getting-started',
          'core-concepts',
          'developer-tools',
          'tutorials',
          'node-validators',
        ],
        description: 'Restrict to a single top-level section.',
      },
      limit: { type: 'integer', minimum: 1, maximum: 25, default: 8 },
    },
    required: ['query'],
    additionalProperties: false,
  },
  async handler(args: {
    query: string;
    locale?: 'en' | 'ja';
    section?: string;
    limit?: number;
  }) {
    const ms = loadSearchIndex();
    const filter = (stored: Record<string, unknown>) => {
      if (args.locale && stored.locale !== args.locale) return false;
      if (args.section && stored.section !== args.section) return false;
      return true;
    };
    const limit = args.limit ?? 8;
    const hits = ms.search(args.query, { filter }).slice(0, limit);
    const results = hits.map((h) => ({
      url: h.url,
      title: h.title,
      locale: h.locale,
      section: h.section,
      summary: h.summary,
      score: Number(h.score.toFixed(3)),
    }));
    return {
      content: [
        {
          type: 'text' as const,
          text:
            results.length === 0
              ? `No results for "${args.query}".`
              : results
                  .map(
                    (r, i) =>
                      `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.section} · ${r.locale} · score=${r.score}\n   ${r.summary}`,
                  )
                  .join('\n\n'),
        },
      ],
      structuredContent: { query: args.query, total: results.length, results },
    };
  },
};
