export const SECTION_LABELS = {
  en: {
    '': 'Overview',
    'getting-started': 'Getting Started',
    'core-concepts': 'White Paper',
    'developer-tools': 'Developer Tools',
    'tutorials': 'Cookbook',
    'node-validators': 'Node Validators',
  },
  ja: {
    '': '概要',
    'getting-started': 'はじめに',
    'core-concepts': 'ホワイトペーパー',
    'developer-tools': '開発者ツール',
    'tutorials': 'クックブック',
    'node-validators': 'ノードバリデータ',
  },
};

export function sectionLabel(locale, section) {
  return SECTION_LABELS[locale]?.[section] ?? section;
}
