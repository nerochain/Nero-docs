const UI_RESOURCES: Record<string, { mimeType: string; text: string; name: string; description: string }> = {
  'ui://nero-docs/search-results': {
    name: 'NERO Docs — search results view',
    description: 'Compact HTML list of search hits for rendering inline in an MCP-Apps-capable chat UI.',
    mimeType: 'text/html+skybridge',
    text: `<div class="nero-search-results" style="font-family:ui-sans-serif,system-ui;line-height:1.45">
  <style>
    .nero-search-results .hit { border-bottom:1px solid #eee; padding:0.6rem 0; }
    .nero-search-results .title { font-weight:600; }
    .nero-search-results .meta { font-size:0.8rem; opacity:0.7; }
    .nero-search-results a { color:#0366d6; text-decoration:none; }
    .nero-search-results a:hover { text-decoration:underline; }
  </style>
  <template data-if="results && results.length">
    <div data-for="hit of results" class="hit">
      <a data-attr-href="hit.url" class="title" data-text="hit.title"></a>
      <div class="meta"><span data-text="hit.section"></span> · <span data-text="hit.locale"></span></div>
      <div data-text="hit.summary"></div>
    </div>
  </template>
  <template data-if="!results || !results.length">
    <em>No results.</em>
  </template>
</div>`,
  },
  'ui://nero-docs/page-preview': {
    name: 'NERO Docs — page preview',
    description: 'Preview panel for a single doc page (title, section, summary, link, truncated markdown).',
    mimeType: 'text/html+skybridge',
    text: `<div class="nero-page-preview" style="font-family:ui-sans-serif,system-ui;line-height:1.55">
  <style>
    .nero-page-preview h3 { margin:0 0 0.3rem; font-size:1.1rem; }
    .nero-page-preview .meta { font-size:0.82rem; opacity:0.7; margin-bottom:0.6rem; }
    .nero-page-preview pre { background:#f4f4f4; padding:0.6rem; border-radius:5px; overflow-x:auto; font-size:0.82rem; }
  </style>
  <h3 data-text="title"></h3>
  <div class="meta">
    <a data-attr-href="url" data-text="url"></a> · <span data-text="section"></span> · <span data-text="locale"></span>
  </div>
  <p data-text="summary"></p>
  <details>
    <summary>Full markdown (first 4KB)</summary>
    <pre data-text="markdown"></pre>
  </details>
</div>`,
  },
  'ui://nero-docs/api-method': {
    name: 'NERO Docs — API method card',
    description: 'Reference card for a Paymaster JSON-RPC method: signature, params, return shape, docs link.',
    mimeType: 'text/html+skybridge',
    text: `<div class="nero-api-method" style="font-family:ui-sans-serif,system-ui;line-height:1.55">
  <style>
    .nero-api-method h3 { font-family:ui-monospace,Menlo,monospace; margin:0 0 0.4rem; font-size:1rem; }
    .nero-api-method ul { padding-left:1.2rem; }
    .nero-api-method li { margin:0.25rem 0; font-size:0.88rem; }
    .nero-api-method .returns { margin-top:0.6rem; font-size:0.88rem; }
    .nero-api-method a { color:#0366d6; }
  </style>
  <h3 data-text="method"></h3>
  <p data-text="summary"></p>
  <strong>Parameters</strong>
  <ul>
    <li data-for="p of params">
      <code data-text="p.name"></code> — <span data-text="p.description"></span>
    </li>
  </ul>
  <div class="returns"><strong>Returns:</strong> <code data-text="returns"></code></div>
  <p><a data-attr-href="docs">Read the full docs →</a></p>
</div>`,
  },
  'ui://nero-docs/embed': {
    name: 'NERO Docs — embed',
    description: 'Shell that links to the AI resources hub. Use when no specific UI applies.',
    mimeType: 'text/html+skybridge',
    text: `<div style="font-family:ui-sans-serif,system-ui;padding:0.5rem 0">
  <p>This response comes from the <strong>NERO Chain Docs</strong> MCP server.</p>
  <p><a href="https://docs.nerochain.io/en/ai-resources">See install snippets and download bundles →</a></p>
</div>`,
  },
};

export function listUiResources() {
  return Object.entries(UI_RESOURCES).map(([uri, r]) => ({
    uri,
    name: r.name,
    description: r.description,
    mimeType: r.mimeType,
    annotations: { audience: ['assistant'] },
  }));
}

export function readUiResource(uri: string) {
  const r = UI_RESOURCES[uri];
  if (!r) return null;
  return { contents: [{ uri, mimeType: r.mimeType, text: r.text }] };
}

export function isUiUri(uri: string): boolean {
  return uri.startsWith('ui://nero-docs/');
}
