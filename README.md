# NERO Chain Documentation

This is the official documentation for NERO Chain
(https://docs.nerochain.io/)

## Prerequisites

- Node.js ^20.11.1
- Yarn v3.8.3

## Install dependencies:

```bash
yarn install
```

## Run the development server:

```bash
yarn dev
```

## Preview Environments

When you create a PR from a feature/* branch, the following will happen automatically:
1. Amplify will deploy a preview environment
2. A preview URL will be added as a PR comment

### Branch Naming Convention
- New features: `feature/feature-name`
- Bug fixes: `fix/fix-description`
- Releases: `release/version`

### Notes
- Preview environment deployment takes a few minutes
- Preview URLs become invalid when the PR is merged or closed

## For AI agents

The site publishes machine-readable documentation at:

- `llms.txt` — curated markdown index ([link](https://docs.nerochain.io/llms.txt))
- `llms-full.txt` — full docs corpus ([link](https://docs.nerochain.io/llms-full.txt))
- `site-index.json` — page metadata ([link](https://docs.nerochain.io/site-index.json))
- Paymaster OpenAPI 3.1 spec ([link](https://docs.nerochain.io/specs/paymaster-openapi.yaml))
- MCP server at `https://docs-mcp.nerochain.io`

Install snippets for Claude Code, Claude Desktop, Cursor, VS Code, ChatGPT, and Codex CLI are on the [AI resources hub](https://docs.nerochain.io/en/ai-resources).
