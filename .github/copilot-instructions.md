# Copilot instructions — NERO Chain Docs

This repository is the NERO Chain documentation site (Next.js 15 + Nextra 3.2, static export to Firebase Hosting). When assisting with edits:

## Canonical references

- Docs site: https://docs.nerochain.io
- Full docs corpus (markdown): https://docs.nerochain.io/llms-full.txt
- Paymaster OpenAPI spec: https://docs.nerochain.io/specs/paymaster-openapi.yaml
- MCP server (when live): https://docs-mcp.nerochain.io
- AI resources hub: https://docs.nerochain.io/en/ai-resources

## Project shape

- Content: `pages/en/**/*.mdx`, `pages/ja/**/*.mdx` (mirrored structure). Each dir has a `_meta.ts`.
- Components: `components/`. `PageFeedback` is auto-inserted by a script; keep the existing pattern.
- Build: `yarn build` runs `next build` then `node scripts/build-agent-artifacts.mjs`. Both must succeed.
- Static export output: `out/`. Firebase serves real files from there; rewrites are a fallback.
- Tests/lint: none. Use `yarn validate:agent-ready` after MDX changes.

## Hard facts — do not invent

- EntryPoint address: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- Paymaster JSON-RPC methods: `pm_supported_tokens`, `pm_sponsor_userop`, `pm_entrypoints`
- Payment types: 0 (sponsored), 1 (prepay ERC-20), 2 (postpay ERC-20)
- Native token: NERO
- Node version: 20.11.1; Yarn 3.8.3 Berry; `nodeLinker: node-modules`

## Writing style

- Lead with the positive claim. Do not define by negation ("not an L2, but…").
- Don't write comments that repeat what code does; prefer clear naming.
- When adding a page, mirror EN → JA and update both `_meta.ts` files.

## Branch naming

- `feature/*` — new features (auto-deploys an Amplify PR preview)
- `fix/*` — bug fixes
- `release/*` — releases
