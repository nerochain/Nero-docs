import { loadCorpus } from '../corpus.js';
import { CANONICAL_ORIGIN } from '../config.js';

export const getFaqTool = {
  name: 'get_faq',
  description:
    'Return the NERO Chain FAQ entries, optionally filtered by topic. Pulls from the /faq page in the docs corpus.',
  _meta: {
    ui: { resourceUri: 'ui://nero-docs/page-preview' },
  },
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'Optional substring to match against question headings.' },
      locale: { type: 'string', enum: ['en', 'ja'], default: 'en' },
    },
    additionalProperties: false,
  },
  async handler(args: { topic?: string; locale?: 'en' | 'ja' }) {
    const locale = args.locale ?? 'en';
    const corpus = loadCorpus();
    const toPath = (u: string) => u.replace(CANONICAL_ORIGIN, '') || '/';
    const expectedPath = `/${locale}/faq`;
    const faqPage = corpus.find((p) => p.locale === locale && toPath(p.url) === expectedPath);
    if (!faqPage) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `FAQ page not found for locale ${locale}.` }],
      };
    }
    let body = faqPage.markdown;
    if (args.topic) {
      const needle = args.topic.toLowerCase();
      const sections = body.split(/\n(?=##\s)/);
      const matching = sections.filter((s) => s.toLowerCase().includes(needle));
      body = matching.length ? matching.join('\n\n') : body;
    }
    const absoluteUrl = faqPage.url.startsWith('http')
      ? faqPage.url
      : `${CANONICAL_ORIGIN}${faqPage.url}`;
    return {
      content: [
        {
          type: 'text' as const,
          text: `Source: ${absoluteUrl}\n\n${body}`,
        },
      ],
      structuredContent: {
        url: absoluteUrl,
        locale,
        topic: args.topic ?? null,
        markdown: body,
      },
    };
  },
};
