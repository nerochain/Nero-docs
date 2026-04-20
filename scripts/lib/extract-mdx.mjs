import { CANONICAL_ORIGIN } from './pagewalker.mjs';

const TABS_BLOCK_RE = /<Tabs\s+items=\{\[([^\]]+)\]\}>([\s\S]*?)<\/Tabs>/g;
const TAB_ITEM_RE = /<Tabs\.Tab>([\s\S]*?)<\/Tabs\.Tab>/g;

function stripImports(src) {
  return src
    .replace(/^\s*import\s+[^;\n]+[;\n]/gm, '')
    .replace(/^\s*export\s+const\s+meta\s*=\s*{[\s\S]*?}\s*$/m, '');
}

function stripPageFeedback(src) {
  return src.replace(/<PageFeedback[^>]*\/>/g, '').replace(/<PageFeedback[^>]*>[\s\S]*?<\/PageFeedback>/g, '');
}

function flattenTabs(src) {
  return src.replace(TABS_BLOCK_RE, (_, itemsRaw, body) => {
    const labels = itemsRaw
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
    const panels = [...body.matchAll(TAB_ITEM_RE)].map((m) => m[1].trim());
    const pairs = labels.map((label, i) => ({ label, content: panels[i] ?? '' }));
    return pairs
      .map(({ label, content }) => `**${label}:**\n\n${content.trim()}`)
      .join('\n\n');
  });
}

function stripInlineHtmlWrappers(src) {
  const imgRe = /<img\s+([^>]*?)\/?>(?:\s*<\/img>)?/g;
  let out = src.replace(imgRe, (_, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/);
    if (!srcMatch) return '';
    let url = srcMatch[1];
    if (url.startsWith('/')) url = `${CANONICAL_ORIGIN}${url}`;
    return `![${altMatch?.[1] ?? ''}](${url})`;
  });
  out = out.replace(/<figure[^>]*>/g, '').replace(/<\/figure>/g, '');
  out = out.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g, (_, inner) =>
    `\n*${inner.replace(/\s+/g, ' ').trim()}*\n`,
  );
  out = out.replace(/<div[^>]*>\s*/g, '').replace(/\s*<\/div>/g, '');
  return out;
}

function normalizeLinks(src) {
  return src.replace(/\]\((\/(?:en|ja)\/[^)\s]*)\)/g, (_, href) => `](${CANONICAL_ORIGIN}${href})`);
}

function collapseWhitespace(src) {
  return src.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

export function extractPlainMarkdown(mdxSource) {
  let s = mdxSource;
  s = stripImports(s);
  s = stripPageFeedback(s);
  s = flattenTabs(s);
  s = stripInlineHtmlWrappers(s);
  s = normalizeLinks(s);
  s = collapseWhitespace(s);
  return s;
}

export function extractTitleAndBody(mdxSource) {
  const md = extractPlainMarkdown(mdxSource);
  const h1Match = md.match(/^#\s+(.+)$/m);
  const title = h1Match?.[1]?.trim() ?? '';
  const body = h1Match ? md.slice(h1Match.index + h1Match[0].length).trimStart() : md;
  return { title, body };
}
