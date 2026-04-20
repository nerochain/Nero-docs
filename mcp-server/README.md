# @nerochain/docs-mcp

Model Context Protocol server for [NERO Chain](https://nerochain.io) documentation.

Exposes the NERO docs corpus to AI agents through MCP, with six tools and per-page resources. Index is built at image-build time from the same `llms-full.jsonl` that ships on `docs.nerochain.io`, so the server and the docs site can never drift.

## Tools

| Tool | Use |
|---|---|
| `search_docs` | BM25 search across all pages (EN + JA). |
| `get_page` | Fetch full markdown for a page by URL path. |
| `list_sections` | Return the navigation tree. |
| `get_api_method` | Paymaster JSON-RPC method signature (`pm_supported_tokens`, `pm_sponsor_userop`, `pm_entrypoints`). |
| `get_code_example` | Curated runnable snippets covering 21 integration topics: quickstart, providers-setup, wallet-hook, builder-with-paymaster-hook, send-gasless-tx, send-userop, batch-transactions, erc20-transfer, nft-mint, staking, integrate-aa-wallet, web3auth-login-methods, nextjs-ssr-setup, fetch-balance, fetch-price, check-supported-tokens, complete-wallet-component, line-miniapp, error-handling, deploy-contract-hardhat, deploy-contract-remix. |
| `get_faq` | FAQ entries, optionally filtered by topic. |
| `get_integration_config` | Structured reference data (JSON) for NERO integration: network params, contract addresses, paymaster types, env vars, Web3Auth setup, security rules. |

## Resources

Every docs page is exposed as `docs:/<locale>/<path>` with `text/markdown` mime, so agents can read them via MCP `resources/read` directly.

## Local development

```bash
# 1. Build the docs artifacts at the repo root (produces out/llms-full.jsonl)
cd ..
yarn install
yarn build

# 2. Build the MCP server and its index
cd mcp-server
yarn install
yarn build

# 3. Run it
yarn start           # HTTP streamable on :8080/mcp
yarn start:stdio     # stdio transport for local Claude Desktop testing

# 4. Conformance test (spawns the server over stdio and runs a smoke test)
yarn test:conformance
```

## Deploy (Google Cloud Run)

```bash
gcloud config set project PROJECT_ID
gcloud builds submit --tag gcr.io/PROJECT_ID/nero-docs-mcp:latest
gcloud run services replace cloud-run.yaml --region=us-central1
gcloud run services add-iam-policy-binding nero-docs-mcp \
  --region=us-central1 --member=allUsers --role=roles/run.invoker
# Map a custom domain to docs-mcp.nerochain.io.
```

## Connect

Install snippets for Claude Code, Claude Desktop, Cursor, VS Code, ChatGPT, and Codex CLI are on [`/en/ai-resources`](https://docs.nerochain.io/en/ai-resources).

## Registry submissions

After the first public deployment, submit this server to:

- [mcp.so](https://mcp.so)
- [Smithery](https://smithery.ai)
- [Glama](https://glama.ai)
- [PulseMCP](https://www.pulsemcp.com)
- [skills.sh](https://skills.sh)

Claim or replace any existing NERO listings on those registries.
