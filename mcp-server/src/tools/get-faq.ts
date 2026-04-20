import { loadCorpus } from '../corpus.js';
import { CANONICAL_ORIGIN } from '../config.js';

export const getFaqTool = {
  name: 'get_faq',
  description:
    'Return the NERO Chain FAQ entries, optionally filtered by topic. Pulls from the /faq page in the docs corpus.',
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
    const faqPage = corpus.find((p) => p.locale === locale && p.url === `/${locale}/faq`);
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
    return {
      content: [
        {
          type: 'text' as const,
          text: `Source: ${CANONICAL_ORIGIN}${faqPage.url}\n\n${body}`,
        },
      ],
      structuredContent: {
        url: `${CANONICAL_ORIGIN}${faqPage.url}`,
        locale,
        topic: args.topic ?? null,
        markdown: body,
      },
    };
  },
};
