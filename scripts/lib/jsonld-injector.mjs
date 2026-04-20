import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse } from 'node-html-parser';
import { CANONICAL_ORIGIN } from './pagewalker.mjs';
import { sectionLabel } from './section-index.mjs';

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NERO Chain',
  url: 'https://nerochain.io',
  logo: `${CANONICAL_ORIGIN}/assets/nerologo.svg`,
  sameAs: [
    'https://github.com/nerochain',
    'https://discord.com/invite/nerochainofficial',
    'https://x.com/NeroChain',
  ],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NERO Chain Documentation',
  url: CANONICAL_ORIGIN,
  inLanguage: ['en', 'ja'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${CANONICAL_ORIGIN}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const SOFTWARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'NERO Chain',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description:
    'NERO Chain is a Layer-1 blockchain with native account abstraction, paymaster gas sponsorship, and Web2-style authentication. These docs cover the protocol and developer tools.',
  url: CANONICAL_ORIGIN,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: ORG_JSON_LD,
};

function htmlPathToUrl(outDir, filePath) {
  const rel = path.relative(outDir, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/, '');
}

function matchPageForHtml(outDir, filePath, pages) {
  const url = htmlPathToUrl(outDir, filePath);
  return pages.find((p) => p.url === url) ?? null;
}

function buildTechArticleJsonLd(page) {
  const keywords = [
    ...new Set(
      page.headings
        .filter((h) => h.startsWith('## '))
        .map((h) => h.replace(/^#+\s*/, '').trim()),
    ),
  ].slice(0, 10);
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.title,
    description: page.summary,
    url: page.canonicalUrl,
    inLanguage: page.locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'NERO Chain Documentation',
      url: CANONICAL_ORIGIN,
    },
    articleSection: sectionLabel(page.locale, page.section),
    keywords: keywords.join(', '),
    publisher: ORG_JSON_LD,
  };
}

function buildJsonLdScripts(page) {
  const blocks = [];
  if (page.isIndex || page.url === '/') {
    blocks.push(ORG_JSON_LD, WEBSITE_JSON_LD, SOFTWARE_JSON_LD);
  } else {
    blocks.push(buildTechArticleJsonLd(page));
  }
  return blocks.map(
    (obj) =>
      `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`,
  );
}

function ensureMeta(head, name, property, content) {
  const escaped = content.replace(/"/g, '&quot;');
  if (name) {
    const existing = head.querySelector(`meta[name="${name}"]`);
    if (existing) {
      existing.setAttribute('content', content);
    } else {
      head.appendChild(parse(`<meta name="${name}" content="${escaped}">`));
    }
  }
  if (property) {
    const existing = head.querySelector(`meta[property="${property}"]`);
    if (existing) {
      existing.setAttribute('content', content);
    } else {
      head.appendChild(parse(`<meta property="${property}" content="${escaped}">`));
    }
  }
}

function ensureLink(head, rel, href) {
  const existing = head.querySelector(`link[rel="${rel}"]`);
  if (existing) {
    existing.setAttribute('href', href);
  } else {
    head.appendChild(parse(`<link rel="${rel}" href="${href}">`));
  }
}

async function injectOne(filePath, page) {
  const raw = await fs.readFile(filePath, 'utf8');
  const root = parse(raw, {
    lowerCaseTagName: false,
    comment: true,
    voidTag: { addClosingSlash: false },
  });
  const html = root.querySelector('html');
  if (html && page?.locale) {
    html.setAttribute('lang', page.locale);
  }
  const head = root.querySelector('head');
  if (!head) return false;

  const description = page?.summary || 'NERO Chain developer documentation.';
  const title = page?.title || 'NERO Chain Documentation';
  const url = page?.canonicalUrl || CANONICAL_ORIGIN + htmlPathToUrl(path.dirname(filePath), filePath);

  ensureMeta(head, 'description', 'og:description', description);
  ensureMeta(head, null, 'og:title', title);
  ensureMeta(head, null, 'og:type', page?.isIndex ? 'website' : 'article');
  ensureMeta(head, null, 'og:url', url);
  ensureMeta(head, null, 'og:image', `${CANONICAL_ORIGIN}/assets/nerologo.svg`);
  ensureMeta(head, 'twitter:card', null, 'summary_large_image');
  ensureLink(head, 'canonical', url);

  const scripts = page ? buildJsonLdScripts(page) : [];
  for (const s of scripts) head.appendChild(parse(s));

  await fs.writeFile(filePath, root.toString(), 'utf8');
  return true;
}

export async function injectMetadata({ outDir, pages }) {
  const htmlFiles = await glob('**/*.html', { cwd: outDir, nodir: true });
  let processed = 0;
  let withPage = 0;
  for (const rel of htmlFiles) {
    const abs = path.join(outDir, rel);
    const page = matchPageForHtml(outDir, abs, pages);
    const ok = await injectOne(abs, page);
    if (ok) processed++;
    if (ok && page) withPage++;
  }
  console.log(`🧬 injected metadata into ${processed} HTML files (${withPage} matched to pages)`);
}
