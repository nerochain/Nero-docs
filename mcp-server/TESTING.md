# Local MCP testing — what and how

Before this branch is merged, the MCP server has been exercised end-to-end without being deployed. This doc summarizes what was tested, how it was tested, and — most importantly — how the local test shape maps onto real user behavior.

## What was tested

Two runs of the same 26-probe suite:

| Path | Command | Result |
|---|---|---|
| **Level 2 — local Node HTTP** | `node mcp-server/scripts/verify-deployment.mjs node` | **26 / 26 passing** |
| **Level 3 — Docker container** | `node mcp-server/scripts/verify-deployment.mjs docker` | **26 / 26 passing** |

Reports: `reports/mcp-verify-node.json`, `reports/mcp-verify-docker.json`.

## How the test is structured

The verification script uses the **official `@modelcontextprotocol/sdk` TypeScript client** over `StreamableHTTPClientTransport`. That is the same package and the same transport that Claude Desktop, Claude Code, Cursor, VS Code (MCP), and ChatGPT use when they connect to any MCP server. The only difference between the local probe and a real Claude Desktop session is the client name field — everything else (handshake, framing, session ID routing, SSE/JSON response shape) is byte-identical.

Docker mode builds the exact image Cloud Run will run, binds it to a local port, and runs the same probe suite against the container. Passing Docker gives very high confidence the service will work on Cloud Run (same base image, same npm install flow, same user, same HEALTHCHECK).

## Probe-by-probe → real user behavior

### Protocol fundamentals (every connection)
| Probe | What a real user triggers |
|---|---|
| `GET /health` | Uptime monitors (Cloud Run health check, UptimeRobot, your internal status page) |
| MCP `initialize` handshake | Every `claude mcp add ...` connection, every Cursor/VS Code MCP connect, every ChatGPT Apps SDK attach |
| `tools/list` | The "@nero-docs" tool picker that shows up in Claude Desktop, Cursor, Codex |
| `_meta.ui.resourceUri` on every tool | MCP-Apps-capable clients (ChatGPT Apps, Claude Desktop canvas) rendering tool output inline |
| `resources/list` | Claude Desktop's attachment picker enumerating `docs://*` pages |
| Error shape on missing page | User typos a URL or Claude tries a stale link — the assistant sees a structured error instead of a protocol crash |

### English docs retrieval (EN-locale users)
| Probe | Maps to |
|---|---|
| `search_docs("paymaster sponsorship")` | *"Claude, find me where NERO docs talk about paymaster sponsorship types."* |
| `get_api_method(pm_sponsor_userop)` | *"What's the signature of pm_sponsor_userop?"* |
| `get_page("/en/developer-tools/paymaster-api/core-methods")` | *"Pull the core methods page."* |
| `resources/read docs:///en/getting-started/introduction` | Claude Desktop attaching the Introduction doc to the conversation |
| `resources/read ui://nero-docs/search-results` | The ChatGPT Apps UI template that renders a search result list inline |

### Japanese docs retrieval (JA-locale users)
| Probe | Maps to |
|---|---|
| `search_docs("ペイマスター", locale=ja)` | Japanese user asking *「ペイマスターの使い方を教えて」* |
| `search_docs("トークン 支払い", locale=ja)` | Japanese user asking about token gas payment in native script |
| `get_page("/ja/developer-tools/paymaster-api/core-methods")` | Japanese dev opening the JA version of the Core Methods page |
| `list_sections(locale=ja)` | Navigation / TOC shown in Japanese (ホワイトペーパー, 開発者ツール…) |
| `resources/read docs:///ja/getting-started/introduction` | Japanese doc attached as a resource |
| `get_faq(locale=ja)` | Japanese FAQ lookup. **Caught a real bug** — url/path mismatch — during this probe |

Unicode verification uses explicit Hiragana/Katakana/CJK range checks (`/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/`) so "looks Japanese" is actually verified, not assumed.

### Integration patterns (dApp developers)
| Probe | Maps to |
|---|---|
| `get_integration_config(topic=testnet)` | *"Claude, generate my .env for NERO testnet."* |
| `get_integration_config(topic=mainnet)` | Same, but for production |
| `get_integration_config(topic=contracts)` | *"What's the EntryPoint / SimpleAccountFactory address?"* |
| `get_integration_config(topic=env-vars, network=testnet)` | Claude writing a complete `.env.local` file for the user |
| `get_integration_config(topic=all)` | Full NERO integration context dumped into an agent's working memory |
| `get_code_example(topic=quickstart)` | *"Show me a minimum NERO + Web3Auth starter."* |
| `get_code_example(topic=staking)` | *"Write me the code to stake NERO."* |
| `get_code_example(topic=erc20-transfer)` | *"Send an ERC-20 to this address gaslessly."* |
| `get_code_example(topic=line-miniapp)` | *"Adapt this for LINE mini apps."* |

## Real-world call flow the probes reproduce

What Claude Desktop actually does on a user message like *"Search NERO docs for paymaster"*:

1. Claude Desktop → `POST /mcp` with `initialize` → server returns capabilities + `Mcp-Session-Id` header
2. Claude Desktop → `POST /mcp` with `notifications/initialized` (same session)
3. Claude Desktop → `POST /mcp` with `tools/list` to know what's available
4. Claude picks `search_docs`, Claude Desktop → `POST /mcp` with `tools/call`
5. Server runs BM25 index, returns `structuredContent` + formatted text
6. Claude renders the response, optionally referencing `_meta.ui.resourceUri` for rich display

The verification script executes exactly this flow via the MCP client SDK — no mocks, no shortcuts. A 26 / 26 result means a real client running that exact sequence will get exactly these responses.

## What the local tests do NOT prove

Honest list of gaps that can only be checked post-deploy:

- **Cloud Run cold-start latency.** Container boots fast locally; first production hit after idle may take 1–3 s.
- **Custom-domain SSL.** The Let's Encrypt cert for `docs-mcp.nerochain.io` provisions only after DNS is set up.
- **Multi-client concurrency.** We exercise one session at a time. The server code maps `Mcp-Session-Id → {transport, server}` with a 10-minute TTL; theoretically sound, not load-tested.
- **Real LLM behavior.** The probes prove transport fidelity. They don't prove Claude/ChatGPT will always *pick* the right tool or *phrase* the answer well — that's a docs-content concern, tracked by the task-completion harness at `scripts/eval/run-agent-tasks.mjs`.

## How to rerun

From a clean tree at the repo root:

```bash
yarn install
yarn build                                      # regenerates mcp-server/data/
yarn workspace @nerochain/docs-mcp build        # compiles src/ + rebuilds index

# Level 2 — local Node HTTP (30 s)
node mcp-server/scripts/verify-deployment.mjs node

# Level 3 — Docker container mirroring Cloud Run (5 min first run, cached after)
node mcp-server/scripts/verify-deployment.mjs docker
```

Both runs write detailed JSON reports to `reports/mcp-verify-{node,docker}.json` that CI can attach to the deploy log.
