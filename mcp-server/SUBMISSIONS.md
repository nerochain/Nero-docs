# MCP registry submissions

Step-by-step playbook to get the NERO Docs MCP server listed everywhere that matters. Total time: ~45 minutes of form-filling, then wait for reviews.

---

## Canonical submission packet

Every registry asks for roughly the same fields. Copy-paste these verbatim.

```
Name:          NERO Chain Docs
Qualified ID:  nero-chain-docs
Category:      Documentation / Developer Tools / Blockchain
Transport:     http (streamable)
Endpoint:      https://docs-mcp.nerochain.io
MCP path:      https://docs-mcp.nerochain.io/mcp
Health:        https://docs-mcp.nerochain.io/health
Homepage:      https://docs.nerochain.io/en/ai-resources
Server Card:   https://docs.nerochain.io/.well-known/mcp/server-card.json
GitHub:        https://github.com/nerochain/Nero-docs
Source path:   mcp-server/
Author:        NERO Chain
Contact:       contact@nerochain.io
License:       MIT
Logo:          https://docs.nerochain.io/assets/nerologo.svg
```

### Short description (280 chars)

> MCP server for NERO Chain documentation — a Layer-1 blockchain with native account abstraction, paymaster gas sponsorship, and Web2-style auth. 7 tools covering search, page retrieval, Paymaster JSON-RPC methods, code examples, integration config. EN + JA.

### Long description

> Model Context Protocol server exposing the complete NERO Chain developer documentation.
>
> **Seven tools:**
> - `search_docs` — full-text BM25 search across EN + JA
> - `get_page` — fetch full markdown for any page by URL path
> - `list_sections` — localized navigation tree
> - `get_api_method` — Paymaster JSON-RPC signatures (pm_supported_tokens, pm_sponsor_userop, pm_entrypoints)
> - `get_code_example` — 21 curated integration patterns: quickstart, providers-setup, wallet-hook, builder-with-paymaster, gasless transfers, ERC-20, NFT, staking, Web3Auth, LINE mini-app, SSR, batch tx, error handling, Hardhat + Remix deploys
> - `get_faq` — FAQ entries filtered by topic
> - `get_integration_config` — structured JSON for networks (testnet/mainnet), contracts (EntryPoint, SimpleAccountFactory, staking), paymaster types, env vars, Web3Auth rules, security
>
> Plus **143 `docs://` resources** (full markdown of every page, EN + JA) and **4 `ui://` MCP Apps templates** (skybridge HTML for search results, page preview, API method card, and generic embed).
>
> Index is rebuilt from the same `llms-full.jsonl` the docs site ships — zero drift between what humans read and what agents retrieve.

### Tags

```
blockchain, ethereum, account-abstraction, erc-4337, paymaster,
layer-1, web3, developer-docs, documentation, search, userop, aa-wallet
```

---

## Tier 1 — registries orank scans (submit all five)

### 1. mcp.so

- **Submit URL:** [https://mcp.so/submit](https://mcp.so/submit)
- **Fields:** Name, description, URL, GitHub, category tags, logo
- **Review time:** ~24 h
- **Use the canonical packet above**

### 2. Smithery

- **Submit URL:** [https://smithery.ai/new](https://smithery.ai/new) — or open a PR against [smithery-ai/registry](https://github.com/smithery-ai/registry)
- **Review time:** Automated merge after PR lint passes

**Paste as `smithery.yaml`:**

```yaml
qualifiedName: nero-chain-docs
displayName: NERO Chain Docs
description: >-
  MCP server for NERO Chain documentation — a Layer-1 blockchain with
  native account abstraction, paymaster gas sponsorship, and Web2-style
  auth. 7 tools covering search, page retrieval, Paymaster JSON-RPC,
  code examples, integration config. EN + JA.
homepage: https://docs.nerochain.io/en/ai-resources
repository: https://github.com/nerochain/Nero-docs
sourcePath: mcp-server
remote:
  transport: http
  url: https://docs-mcp.nerochain.io/mcp
author: NERO Chain
license: MIT
tags:
  - blockchain
  - account-abstraction
  - erc-4337
  - paymaster
  - developer-docs
  - documentation
  - web3
logo: https://docs.nerochain.io/assets/nerologo.svg
```

### 3. Glama

- **Submit URL:** [https://glama.ai/mcp/servers/submit](https://glama.ai/mcp/servers/submit)
- **How it works:** Paste the GitHub repo URL. Glama auto-indexes [`.well-known/mcp/server-card.json`](https://docs.nerochain.io/.well-known/mcp/server-card.json) — no form fields to fill.
- **Review time:** Hours

### 4. PulseMCP

- **Submit URL:** [https://www.pulsemcp.com/submit](https://www.pulsemcp.com/submit)
- **Fields:** Name, URL, transport, description, GitHub
- **Review time:** ~48 h
- **Use the canonical packet above**

### 5. skills.sh

- **Setup:** add a `SKILL.md` at the repo root, then run `npx skills add` locally
- **Template:** our existing [`.well-known/agent-skills/index.json`](../public/.well-known/agent-skills/index.json) already has the right shape — convert to markdown:

**Paste as `SKILL.md`:**

````markdown
# NERO Chain Docs MCP

Search and retrieve NERO Chain documentation via MCP. Seven tools, 143 docs
resources, 4 MCP Apps UI templates.

## Endpoint

https://docs-mcp.nerochain.io

## When to use

- Answering questions about NERO Chain protocol, native account abstraction, or ERC-4337
- Writing code that integrates Web3Auth + the NERO Paymaster API
- Looking up JSON-RPC method signatures for `pm_supported_tokens`, `pm_sponsor_userop`, `pm_entrypoints`
- Finding the EntryPoint / SimpleAccountFactory / staking contract addresses
- Producing `.env` configs for testnet or mainnet
- Drafting Hardhat / Remix deploy scripts targeting NERO testnet

## Install

```bash
claude mcp add --transport http nero-docs https://docs-mcp.nerochain.io
```
````

---

## Tier 2 — official MCP ecosystem (non-negotiable)

### 6. Official MCP Registry (Anthropic)

- **Repo:** [https://github.com/modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry)
- **Action:** Open a PR adding a `servers/nero-chain-docs.json` with our metadata
- **Why it matters:** Claude Desktop's in-app "Browse MCP servers" pulls from here

**Paste as `servers/nero-chain-docs.json`:**

```json
{
  "name": "io.nerochain/docs",
  "description": "NERO Chain documentation — search + retrieval for protocol, account abstraction, paymaster JSON-RPC, and integration patterns. EN + JA.",
  "status": "active",
  "repository": {
    "url": "https://github.com/nerochain/Nero-docs",
    "source": "github",
    "subfolder": "mcp-server"
  },
  "version": "1.0.0",
  "remotes": [
    {
      "transport_type": "streamable-http",
      "url": "https://docs-mcp.nerochain.io/mcp"
    }
  ],
  "websiteUrl": "https://docs.nerochain.io/en/ai-resources"
}
```

### 7. awesome-mcp-servers

- **Repo:** [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- **Action:** PR adding one line under the **Documentation** section

**Add to the Documentation list (alphabetical):**

```markdown
- [nerochain/Nero-docs](https://github.com/nerochain/Nero-docs) 🌐 — MCP server for NERO Chain documentation (Layer-1, native account abstraction, paymaster). 7 tools, 143 docs resources, EN + JA. Hosted at `docs-mcp.nerochain.io`.
```

---

## Tier 3 — optional but cheap

### 8. LobeHub MCP Store

- **Repo:** [https://github.com/lobehub/lobe-mcp-store](https://github.com/lobehub/lobe-mcp-store)
- **Action:** PR adding a new YAML entry
- **Why:** LobeChat desktop app includes this directory in its built-in MCP picker

### 9. Hugging Face Spaces (optional hosted demo)

- **URL:** [https://huggingface.co/new-space](https://huggingface.co/new-space)
- **Why:** Free hosted mirror of the MCP server for testing without going through Cloud Run. Skip unless you want a demo UI.

---

## Checklist

Work top-to-bottom. Each checkbox ≈ 5–10 minutes.

### Before submitting

- [ ] Custom domain serving: `curl https://docs-mcp.nerochain.io/health` → 200
- [ ] `resources/list` returns 147 (4 ui:// + 143 docs://) — run `node mcp-server/scripts/verify-deployment.mjs node` against prod to confirm
- [ ] Server card loads: `curl https://docs.nerochain.io/.well-known/mcp/server-card.json`
- [ ] README + DEPLOYMENT.md are current in the repo

### Submissions

- [ ] **mcp.so** — [submit form](https://mcp.so/submit)
- [ ] **Smithery** — [new server](https://smithery.ai/new) or PR against [smithery-ai/registry](https://github.com/smithery-ai/registry)
- [ ] **Glama** — [submit form](https://glama.ai/mcp/servers/submit), just paste GitHub URL
- [ ] **PulseMCP** — [submit form](https://www.pulsemcp.com/submit)
- [ ] **skills.sh** — add `SKILL.md` to repo, run `npx skills add`
- [ ] **Official MCP Registry** — PR to [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) with `servers/nero-chain-docs.json`
- [ ] **awesome-mcp-servers** — PR to [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) adding the Documentation entry
- [ ] **LobeHub** — PR to [lobehub/lobe-mcp-store](https://github.com/lobehub/lobe-mcp-store) (optional)

### After submissions

- [ ] Bookmark each listing URL and add to `docs/agent-readiness.md`
- [ ] Rescan orank — `Listed in MCP registries` and `Skills.sh skill quality` should flip green
- [ ] Announce on Discord / Twitter with MCP install snippets

---

## Future regression safety

If this MCP ever moves domains (e.g., from personal GCP to NERO's GCP), update:

1. The registry entries above (most let you edit after submission)
2. `public/.well-known/mcp/index.json` + `public/.well-known/mcp/server-card.json`
3. `public/.well-known/agent-card.json`
4. `components/AskButton.tsx` — `MCP_URL` default
5. `pages/{en,ja}/ai-resources.mdx` — every install snippet
6. `mcp-server/README.md`

A single sed across those files catches all references:

```bash
grep -rn 'docs-mcp.nerochain.io' public/ components/ pages/ mcp-server/
```
