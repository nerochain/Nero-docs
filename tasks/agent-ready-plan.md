# NERO Docs Agent-Ready Plan

Goal: take `docs.nerochain.io` from **41/100 (D — At Risk)** on [orank.ai](https://www.orank.ai/) to a verifiably "agent-ready" documentation site. Model the target experience on [`docs.polkadot.com/ai-resources`](https://docs.polkadot.com/ai-resources/).

---

## 1. Problem summary

The orank scorecard splits into five verticals. Current state:

| Vertical | Score | Dominant failure mode |
|---|---|---|
| Discovery | 8/15 | `/llms.txt`, `/sitemap.xml`, `/robots.txt`, `/.well-known/*` all return a Next.js HTML shell |
| Identity | 5/20 | No JSON-LD, no meta/og description, no quotable on-page content without JS |
| Auth & Access | 17/30 | No OpenAPI spec for Paymaster JSON-RPC, no `oauth-protected-resource`, no self-serve onboarding doc |
| Agent Integration | 7/20 | No MCP server, no valid `ai-plugin.json` / `agent-card.json`, no agent platform configs (`.cursor/`, `.claude/`) |
| User Experience | 4/15 | Empty homepage without JS, no pricing/trust anchors, no multi-turn coherence |

### Root causes (verified live)

1. **Firebase catch-all rewrite.** `firebase.json:17-20` rewrites `**` to `/index.html`. Every "agent well-known" URL returns the 1349-byte empty Next.js shell (`<div id="__next"></div>`), so orank sees files that "exist but are invalid". Fix requires either real files in `public/` **and** excluding them from the rewrite, or Firebase `cleanUrls`/explicit passthroughs.
2. **Nextra is CSR-first for content.** Nav and text are hydrated client-side. Non-JS crawlers (tier-2/3 LLM bots) get no content. Next.js static export *does* emit static HTML per route, but without meaningful SSR metadata. We need to verify the static `out/en/**/index.html` files actually contain readable prose — the homepage (`pages/index.tsx`) is a redirect shim and renders empty by design.
3. **No machine-oriented artifacts.** There is no llms.txt, no OpenAPI, no structured data — the content exists only as MDX inside the Next.js bundle.

### What Polkadot proves works

`docs-mcp.polkadot.com` + `/ai-resources` page exposes:
- One HTTP MCP endpoint with copy-paste install snippets for Cursor, VS Code, Claude (desktop + Code CLI), ChatGPT, Codex CLI
- `llms.txt` (index, ~13K tok), `site-index.json` (page metadata, ~77K tok), `llms-full.jsonl` (full corpus, ~629K tok)
- Per-section bundles (full markdown + lightweight index) for nine thematic areas
- "Open in ChatGPT / Claude" deep-links and copy-to-clipboard buttons
- Explicit statement that files carry no embedded system prompt

That's the shape to match, tuned to NERO's surface area (70 EN pages across Getting Started, Core Concepts, Developer Tools, Tutorials, Node Validators).

---

## 2. Plan — two verticals + one bridge

### Vertical A — Agent-ready static artifacts (foundational)

Nothing else works without this. All of it is cheap and deterministic.

**A1. Pipeline to generate agent artifacts at build time**
- Add `scripts/build-agent-artifacts.mjs` that runs after `next build`:
  - walks `pages/en/**/*.mdx` and `pages/ja/**/*.mdx`
  - parses frontmatter with `gray-matter` (already a dep)
  - strips JSX imports, normalizes relative links, produces plain markdown
  - emits to `out/` (the export target) so Firebase serves them statically
- Wire into `package.json`: `"build": "next build && node scripts/build-agent-artifacts.mjs"`

**A2. Core files to emit (per locale)**
| Path | Format | Content |
|---|---|---|
| `/llms.txt` | Markdown | H1 title, one-paragraph description, curated links grouped by section (getting-started, core-concepts, developer-tools, tutorials). Follows [llmstxt.org](https://llmstxt.org) spec. Target ≤ 20K tokens. |
| `/llms-full.txt` | Markdown | Full concatenation of all EN pages with H1 per page and canonical URL header. Target ~300–500K tokens. |
| `/llms-ja.txt`, `/llms-full-ja.txt` | Markdown | Japanese equivalents |
| `/site-index.json` | JSON | `[{ url, title, section, headings[], summary, tokens }]` for every page |
| `/llms-full.jsonl` | JSONL | One page per line: `{ url, title, section, markdown, tokens }` — friendlier for streaming ingestion |
| `/en/<section>/llms.txt` | Markdown | Section-level llms.txt for each of the 7 top-level sections |
| `/sitemap.xml` | XML | Generated from the same walk; includes `<xhtml:link hreflang>` pairs for en/ja |
| `/index.md`, `/en/index.md`, `/ja/index.md` | Markdown | Real markdown served with `Content-Type: text/markdown` — the homepage "what is NERO" summary, quotable |
| `/pricing.md` | Markdown | Explain the economic model: NERO gas token, Type 0/1/2 paymaster sponsorship, AA Platform tiers (if any), testnet free. Treat absence-of-SaaS-pricing as explainable, not a gap. |

**A3. robots.txt with tiered AI policy**
Replace the missing file with an explicit policy in `public/robots.txt`:
- Allow Tier-1 AI crawlers (GPTBot, ClaudeBot, ChatGPT-User, Google-Extended, PerplexityBot, CCBot, Applebot-Extended) on everything
- `Sitemap:` directive pointing to the canonical sitemap
- Optional `schemamap:` directive per NLWeb spec
- No `Disallow` that blocks docs content

**A4. `/.well-known/` surface**
Ship valid JSON at:
- `/.well-known/ai-plugin.json` — ChatGPT plugin manifest (title, description_for_human/model, auth=none, api spec URL pointing to A5)
- `/.well-known/agent-card.json` — A2A agent card: name, description, capabilities, endpoints, pricing model
- `/.well-known/agent-skills/index.json` — skill catalog (e.g., "search_nero_docs", "deploy_first_contract", "setup_paymaster"), each with description, when-to-use, examples
- `/.well-known/api-catalog` — RFC 9727 linkset pointing to OpenAPI + MCP service-desc
- `/.well-known/oauth-protected-resource` — RFC 9728 metadata referring the AA Platform dashboard as the authorization server (even if AA Platform is human-gated today, the file still enables discovery)
- `/.well-known/http-message-signatures-directory` — valid Ed25519 JWK (orank flagged the current file as invalid)
- `/.well-known/llms.txt` — same content as `/llms.txt` (some probes hit the well-known variant)

**A5. OpenAPI spec for Paymaster API**
- Paymaster API is JSON-RPC, not REST, but OpenAPI 3.1 supports JSON-RPC via the `jsonrpc` extension or via individual `POST /` operations per method
- Author at `spec/paymaster-openapi.yaml`, publish to `/specs/paymaster-openapi.yaml` and `/specs/paymaster-openapi.json`
- Source-of-truth the existing `pages/en/developer-tools/paymaster-api/*.mdx` — request/response examples are already there
- Include `securitySchemes`: API key via dashboard header
- Validate in CI with [Spectral](https://stoplight.io/open-source/spectral)

**A6. JSON-LD + metadata**
- In `theme.config.tsx` `head`, emit:
  - `<meta name="description">` and `<meta property="og:description">` per page, derived from MDX frontmatter or first paragraph
  - `og:type`, `og:image`, canonical URL, `html[lang]`
- On the homepage and `/en/index`, inline `<script type="application/ld+json">` with:
  - `Organization` (name, url, logo, sameAs: GitHub/Discord/X/Wikidata)
  - `SoftwareApplication` (applicationCategory=DeveloperApplication)
  - `WebSite` with `potentialAction: SearchAction`
- On tutorial pages, emit `TechArticle` schema with `author`, `datePublished`, `keywords`
- Add `speakable` markup for the Quick Start paragraph
- Validate with [Schema.org validator](https://validator.schema.org) and Google Rich Results test

**A7. Firebase rewrite fix**
Update `firebase.json` so agent artifacts are not rewritten to `index.html`:

```json
{
  "hosting": {
    "rewrites": [
      { "source": "/ja/**", "destination": "/ja/index.html" },
      { "source": "/en/**", "destination": "/en/index.html" },
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

Firebase serves real files in `public/` (i.e., `out/` in our case) **before** applying rewrites, so emitting `out/llms.txt` with the proper extension is sufficient — but we need to add explicit `"headers"` entries so `.md` files get `Content-Type: text/markdown; charset=utf-8` and `.jsonl` gets `application/jsonl`. Otherwise Firebase falls back to `application/octet-stream`, which breaks `/index.md` markdown fallback.

**A8. Agent platform configs in repo root**
- `.cursor/rules/nero-docs.mdc` — tell Cursor how to use NERO docs and what sections mean
- `.claude/agents/nero.md` — Claude Code agent definition pointing at the MCP server
- `.github/copilot-instructions.md` — Copilot rules mirroring CLAUDE.md conventions

These ship in the repo so scanners (orank searches GitHub for them) find them, and so dApp devs who clone nero examples inherit sensible rules.

---

### Vertical B — NERO Docs MCP server

**B1. Scope**

One HTTP MCP server hosted at `https://docs-mcp.nerochain.io` (or `mcp.docs.nerochain.io`), exposing NERO documentation over Model Context Protocol. Read-only, unauthenticated, anonymous. No blockchain access — that's out of scope for a *docs* MCP. (A separate `chain-mcp` for RPC calls is a future piece, tracked as an open question.)

**B2. Tools to expose**

| Tool | Purpose |
|---|---|
| `search_docs(query, locale?, section?, limit?)` | Full-text + semantic search across all pages; returns ranked hits with snippet, URL, section |
| `get_page(path, locale?)` | Return full markdown for one page by canonical path |
| `list_sections(locale?)` | Return nav tree with titles + descriptions |
| `get_api_method(method_name)` | Return Paymaster JSON-RPC method signature + example pulled from `core-methods.mdx` |
| `get_code_example(topic)` | Return curated snippets for common tasks ("send gasless tx", "integrate AA wallet", "deploy contract via Hardhat") |
| `get_faq(topic?)` | Return FAQ entries |

**B3. Resources (MCP `resources/list`)**

Expose every page as `docs://en/<path>` and `docs://ja/<path>` with `text/markdown` mime. Agents can then `resources/read` them directly without going through a tool.

**B4. Implementation stack (recommended)**

- **Language:** TypeScript (matches the existing Next.js toolchain; devs can contribute without context-switch)
- **SDK:** `@modelcontextprotocol/sdk` with HTTP transport (streamable)
- **Index:** build-time step that produces `search-index.json` (BM25 via [minisearch](https://github.com/lucaong/minisearch), ~500KB for 140 pages) + optional `embeddings.jsonl` (e.g., text-embedding-3-small, ~4MB) for semantic fallback
- **Hosting:** Cloud Run (simplest, autoscale-to-zero, matches "static-ish" workload), or Fly.io, or Vercel functions. Pick whichever matches the team's existing ops. *Open Q — see §5.*
- **Repo:** new top-level package `mcp-server/` in this monorepo (Yarn workspace) or sibling repo `nero-docs-mcp`. Co-locating simplifies keeping the index in sync with MDX content.

**B5. Registration & distribution**

- Publish `@nerochain/docs-mcp` to npm for stdio-transport users (Claude Desktop JSON config)
- Submit to registries: [mcp.so](https://mcp.so), [Smithery](https://smithery.ai), [Glama](https://glama.ai), [PulseMCP](https://www.pulsemcp.com), [skills.sh](https://skills.sh) (orank already confirmed some NERO presence there — dedupe/claim the listings)
- Add install buttons on `/ai-resources/` for: Cursor (deep link), VS Code (deep link), Claude Desktop (copy JSON), Claude Code CLI (`claude mcp add --transport http ...`), ChatGPT Apps SDK, Codex CLI

**B6. CI / content sync**

- On push to `main`, the CI job that rebuilds docs also rebuilds the MCP index and redeploys the server image. Single source of truth: MDX files. Drift risk = zero.

---

### Vertical C — `/ai-resources/` page (bridge)

Model directly on Polkadot's hub. Lives at `pages/en/ai-resources.mdx` and `pages/ja/ai-resources.mdx`, wired into `pages/en/_meta.ts` at the top level.

**Sections:**
1. **Why this page** — one-paragraph framing. State positive ("NERO docs are machine-readable via MCP and markdown bundles") rather than negating agent fears.
2. **Connect via MCP** — endpoint URL, install snippets (Cursor / VS Code / Claude Desktop / Claude Code / ChatGPT / Codex CLI). Copy buttons via a small `<CopyableSnippet/>` React component.
3. **Download bundles** — table of `llms.txt`, `llms-full.txt`, `site-index.json`, `llms-full.jsonl` with token counts and download links.
4. **Section bundles** — per-section full + lightweight variants (Getting Started, White Paper, Developer Tools, Cookbook, Node Validators).
5. **Open in…** — quick deep-links for ChatGPT and Claude web UIs that pre-seed the bundle.
6. **OpenAPI & schemas** — links to Paymaster OpenAPI, JSON-LD, agent skill catalog.
7. **Transparency** — explicit statement that files contain no system prompts and no tracking, mirroring Polkadot's callout.

---

## 3. Validation framework — how we prove it's agent-ready

Three independent layers. All must pass before declaring a vertical done.

### 3.1 Automated CI checks (runs on every PR)

Add `scripts/validate-agent-artifacts.mjs` + GitHub Action. Fails the build if any of:

- [ ] `out/llms.txt` exists, starts with `#`, contains ≥ 1 `[title](url)` link, passes [llmstxt.org](https://llmstxt.org) shape check
- [ ] `out/llms-full.txt` ≥ 50K chars and contains ≥ 1 H1 per section
- [ ] `out/sitemap.xml` parses as valid XML, has `<urlset>`, has an entry for every MDX file, valid hreflang pairs
- [ ] `out/robots.txt` has `Sitemap:` and at least one AI User-agent rule
- [ ] `out/.well-known/ai-plugin.json` / `agent-card.json` / `agent-skills/index.json` parse as valid JSON and validate against their schemas (ship JSON Schemas alongside)
- [ ] `out/specs/paymaster-openapi.yaml` passes Spectral lint (`@stoplight/spectral-cli --ruleset .spectral.yaml`)
- [ ] Every MDX page compiles to static HTML with a non-empty `<main>`: `scripts/check-ssr-content.mjs` asserts ≥ 200 chars of text per `out/en/**/index.html`
- [ ] JSON-LD on `out/index.html` validates against schema.org via `@hyperjump/json-schema`
- [ ] `<meta name="description">` present and ≤ 160 chars on every page
- [ ] MCP server `mcp-server/` passes conformance suite: `initialize` → `tools/list` → `tools/call search_docs {query:"paymaster"}` returns ≥ 1 hit; `resources/list` returns ≥ 140 resources

### 3.2 Live external validators (runs post-deploy, weekly cron)

Single script `scripts/external-validation.mjs` that hits:

- [ ] [orank.ai](https://www.orank.ai) rescan → target score **≥ 85/100** across all five verticals (no vertical < 12/15 or proportional equivalent)
- [ ] Google Rich Results test for `/en/index`, `/en/ai-resources`, one tutorial page
- [ ] schema.org validator (batch over top 10 pages)
- [ ] [llmstxt.org](https://llmstxt.org) validator → green
- [ ] HTTP `Link:` header includes `rel="describedby"` pointing at llms.txt
- [ ] WebPageTest / Lighthouse with user-agent `ClaudeBot/1.0`: page renders text without JS
- [ ] MCP server uptime ≥ 99.5% (UptimeRobot or similar)

### 3.3 Task-completion agent harness (the real test)

This is the one that actually matters. Borrow from orank's "multi-turn conversation" and "autonomous task completion" methodology but make it reproducible and CI-runnable.

**Harness:** `scripts/eval/run-agent-tasks.mjs` using the Anthropic + OpenAI SDKs, running against Claude Opus, Claude Sonnet, GPT-5-class, and Gemini.

**Task set (seed with 10, grow to 30):**
1. "What is NERO Chain and what makes it different from Ethereum L2s?"
2. "Write a Hardhat script that deploys an ERC-20 contract to NERO testnet."
3. "Integrate the AA wallet UI into a Next.js app and send a gasless USDC transfer."
4. "Explain Type 0 vs Type 1 vs Type 2 paymaster payments with when to use each."
5. "Generate a curl request to `pm_supported_tokens` for a given sender address."
6. "What's the EntryPoint address on NERO testnet?"
7. "How does NERO's consensus differ from Ethereum's Gasper?"
8. "Walk me through setting up a validator node — list every command in order."
9. "My UserOp is reverting with AA23. Diagnose and fix."
10. "How do I claim fee-sharing revenue as a dApp builder?"

**Scoring rubric (per task, per agent):**
- Grounding: cites `docs.nerochain.io` URL — 1 pt
- Correctness: factual + runnable (spot-check against docs manually first time; automate later with judge model) — 2 pts
- Completeness: covers all edge cases noted in the source MDX — 1 pt
- No hallucination: no invented addresses, methods, or fields — 1 pt (automatic fail if violated)

**Targets:**
- Average score ≥ 4.0/5.0 across all tasks × all agents
- Zero hallucinations on critical tasks (addresses, method signatures)
- "MCP-enabled" agent beats "no-MCP" agent by ≥ 1 pt average (proves MCP pulls weight)

**Two runs per evaluation:**
- **Cold** — agent has no prior context, only web search
- **MCP-connected** — agent is given the NERO docs MCP endpoint
If MCP doesn't meaningfully improve scores, the MCP design needs rework.

### 3.4 Dashboard

Single `docs/agent-readiness.md` in the repo, regenerated weekly, showing:
- Orank score trend
- Task-completion scores by agent + task
- Artifact validation status
- Open issues / regressions

This becomes the living evidence that the docs stay agent-ready.

---

## 4. Phased rollout

Tight sequencing. Each phase lands independently and is independently measurable.

| Phase | Duration | Deliverables | Success gate |
|---|---|---|---|
| **1. Foundations** | Week 1 | A1 pipeline, A2 core files (llms.txt, llms-full.txt, site-index.json, sitemap.xml), A3 robots.txt, A7 Firebase fix | Orank rescan: Discovery ≥ 12/15 |
| **2. Identity** | Week 2 | A4 well-known files, A6 JSON-LD + metadata, A2 `/pricing.md` + `/index.md`, A8 platform configs | Orank Identity ≥ 14/20; rich-results test passes |
| **3. API surface** | Week 3 | A5 Paymaster OpenAPI, JSON Schemas for agent-card/ai-plugin, Spectral CI | Orank Auth & Access ≥ 22/30 |
| **4. MCP server** | Week 4–5 | B1–B4 MCP server built, hosted, indexed; conformance tests green | Task harness shows ≥ 1 pt MCP uplift; 99.5% uptime after 1 week |
| **5. AI resources page** | Week 5 | C (full `/ai-resources/` EN + JA page), registry submissions, public announcement | Orank Agent Integration ≥ 15/20; Agent Integration + UX ≥ 25/35 combined |
| **6. Continuous** | ongoing | 3.2 weekly cron, 3.3 task harness on every release, 3.4 dashboard | Orank score holds ≥ 85; no vertical regresses > 2 pts release-over-release |

---

## 5. Open questions

1. **MCP hosting target.** Cloud Run vs Vercel Edge Functions vs Fly.io — which does the infra team already run? Default pick: Cloud Run (matches Firebase tenancy).
2. **Japanese coverage.** Do we ship `llms-ja.txt` + Japanese MCP responses on day 1, or phase it? Default: ship EN first, JA in phase 5.
3. **Who claims existing MCP registry listings?** Orank reports NERO presence on Smithery and Glama but we don't control them. Need to find & claim or takedown/replace.
4. **Pricing page framing.** `/pricing.md` is in the orank rubric but NERO isn't a SaaS. Decide: explain the gas/paymaster economic model, or explicitly state no plan tiers exist. Default: explain economic model — it's what agents actually need to answer user pricing questions.
5. **Chain MCP vs Docs MCP.** Out of scope here, but worth flagging: a second MCP that exposes chain RPC calls (deploy contract, send UserOp, query balance) would unlock autonomous agent *builders*. Track as a separate initiative.
6. **Ownership of orank score.** Assign one engineer as permanent owner so the score doesn't drift back after shipping. Suggest rotating monthly.

---

## 6. What "done" looks like

NERO docs are agent-ready when, **simultaneously**:

- Orank.ai rescan returns ≥ 85/100 with no vertical below 70% of its max
- Every file listed in §A2 and §A4 exists, is valid, and renders with correct `Content-Type`
- The MCP server answers `tools/list` at `docs-mcp.nerochain.io` with the six tools in §B2
- The task-completion harness (§3.3) scores ≥ 4.0/5.0 average, zero hallucinations on critical tasks
- `/ai-resources/` page is live in EN and JA with working copy-to-clipboard install snippets
- CI blocks regressions: a PR that deletes `/llms.txt` or breaks OpenAPI fails to merge
- The dashboard (§3.4) has been green for two consecutive weeks
