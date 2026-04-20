# Agent-readiness dashboard

Living record of how NERO Chain docs score for AI agents. Updated by the
weekly external validation cron (`.github/workflows/external-validation.yml`)
and by the task-completion harness (`scripts/eval/run-agent-tasks.mjs`).

## Targets

| Metric | Target | Owner |
|---|---|---|
| orank.ai total | ≥ 85 / 100 | docs team |
| orank.ai per-vertical | ≥ 70% of each vertical's max | docs team |
| External validator pass rate | ≥ 95% weekly | docs team |
| Task harness mean (cold) | ≥ 3.5 / 5 | docs team |
| Task harness mean (MCP) | ≥ 4.5 / 5 | docs team |
| MCP uplift (mcp − cold) | ≥ 1.0 | MCP maintainer |
| MCP server uptime | ≥ 99.5% | ops |

## Orank history

| Date | Total | Discovery | Identity | Auth & Access | Agent Integration | User Experience |
|---|---|---|---|---|---|---|
| 2026-04-20 (baseline) | 41 / 100 | 8/15 | 5/20 | 17/30 | 7/20 | 4/15 |
| _pending first post-deploy rescan_ | — | — | — | — | — | — |

## External validator

See `reports/external-latest.json` for the latest run. The CI job fails if any
of these are red:

- `GET /llms.txt`, `/llms-full.txt`, `/llms-full.jsonl`, `/site-index.json`,
  `/sitemap.xml`, `/robots.txt`, `/index.md`, `/pricing.md`,
  `/specs/paymaster-openapi.*` — 2xx with the right `Content-Type`.
- `GET /.well-known/{ai-plugin,agent-card,agent-skills/index,api-catalog,oauth-protected-resource,nero-docs}.json` — valid JSON, shape-checked.
- `GET /` as `User-Agent: ClaudeBot/1.0` — ≥ 500 chars of static content.
- `POST https://docs-mcp.nerochain.io/mcp` with an MCP `initialize` — 2xx with `result`.

## Task harness

Run manually with `yarn eval:tasks` (requires `ANTHROPIC_API_KEY` and/or
`OPENAI_API_KEY`). Seed task set lives in `scripts/eval/tasks.yaml`; rubric in
`scripts/eval/rubric.md`. Reports write to `reports/agent-tasks-latest.json`.

Record trends here after each run:

| Date | Agent | Cold mean | MCP mean | Uplift | Hallucinations |
|---|---|---|---|---|---|
| _TBD_ | | | | | |

## Open items

- [ ] First post-deploy orank rescan (owner: docs team)
- [ ] Submit MCP server to mcp.so / Smithery / Glama / PulseMCP / skills.sh
- [ ] Generate and publish Ed25519 public key in `/.well-known/http-message-signatures-directory`
- [ ] Provision `docs-mcp.nerochain.io` DNS → Cloud Run
- [ ] Wire `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` as GitHub Actions secrets
