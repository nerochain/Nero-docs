import { loadCorpus } from '../corpus.js';
import { CANONICAL_ORIGIN } from '../config.js';

const SECTION_LABELS: Record<string, Record<string, string>> = {
  en: {
    'getting-started': 'Getting Started',
    'core-concepts': 'White Paper',
    'developer-tools': 'Developer Tools',
    tutorials: 'Cookbook',
    'node-validators': 'Node Validators',
  },
  ja: {
    'getting-started': 'はじめに',
    'core-concepts': 'ホワイトペーパー',
    'developer-tools': '開発者ツール',
    tutorials: 'クックブック',
    'node-validators': 'ノードバリデータ',
  },
};

export const listSectionsTool = {
  name: 'list_sections',
  description:
    'Return the navigation tree of NERO Chain docs, grouped by top-level section. Includes titles, URLs, and brief summaries.',
  _meta: {
    ui: { resourceUri: 'ui://nero-docs/embed' },
  },
  inputSchema: {
    type: 'object',
    properties: {
      locale: { type: 'string', enum: ['en', 'ja'], default: 'en' },
    },
    additionalProperties: false,
  },
  async handler(args: { locale?: 'en' | 'ja' }) {
    const locale = args.locale ?? 'en';
    const corpus = loadCorpus().filter((p) => p.locale === locale);
    const sections = new Map<string, typeof corpus>();
    for (const page of corpus) {
      if (!sections.has(page.section)) sections.set(page.section, []);
      sections.get(page.section)!.push(page);
    }
    const tree = [...sections.entries()].map(([section, pages]) => ({
      section,
      label: SECTION_LABELS[locale]?.[section] ?? section,
      pages: pages
        .sort((a, b) => a.url.localeCompare(b.url))
        .map((p) => ({
          url: `${CANONICAL_ORIGIN}${p.url}`,
          title: p.title,
          summary: p.summary,
        })),
    }));
    const text = tree
      .map(
        (s) =>
          `## ${s.label} (${s.section})\n` +
          s.pages.map((p) => `- [${p.title}](${p.url})`).join('\n'),
      )
      .join('\n\n');
    return {
      content: [{ type: 'text' as const, text }],
      structuredContent: { locale, tree },
    };
  },
};
