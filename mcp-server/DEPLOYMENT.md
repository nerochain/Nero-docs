# Deploying the NERO Docs MCP Server

## The short answer

**No, the site's CI/CD does not deploy the MCP.** They are two separate services with different hosting requirements:

| Service | URL | Host | Serves |
|---|---|---|---|
| Docs site | `docs.nerochain.io` | Firebase Hosting (static) | HTML, `.md`, `/llms*.txt`, `/.well-known/*`, `/specs/*` |
| **MCP server** | `docs-mcp.nerochain.io` | **Separate Node container host** | Live JSON-RPC + MCP streamable HTTP |

Firebase Hosting only serves static files — it cannot run a Node process, so the MCP server must go on a container host. This guide covers the recommended path (Google Cloud Run, because you already have a GCP project for Firebase) plus one alternative (Fly.io).

Once deployed, the docs site does not need to change: every install snippet and every `.well-known/mcp/*` file already points at `https://docs-mcp.nerochain.io`. You only deploy the MCP once (then redeploy on each release).

---

## What you'll need

- A Google Cloud project — you can reuse the one that hosts Firebase (`app-site-mainnet-dea7`), or create a new one like `nero-mcp`.
- `gcloud` CLI installed and authenticated (`gcloud auth login`, `gcloud auth configure-docker`).
- DNS control for `nerochain.io`.
- Docker installed locally (only needed if you want to test the image before pushing; CI can build it instead).
- About 15 minutes of hands-on time, plus up to ~1 hour waiting for SSL cert provisioning.

---

## Step 1 — Prepare the GCP project

Run once, from anywhere:

```bash
PROJECT_ID=app-site-mainnet-dea7   # or whatever you want to use
REGION=us-central1
gcloud config set project "$PROJECT_ID"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com
```

## Step 2 — Build & push the container image

The repo already has `mcp-server/Dockerfile` and its `data/` directory is prebuilt on the host (from `yarn build`), so a plain `gcloud builds submit` works.

Run from the repo root:

```bash
yarn build                     # ensures mcp-server/data is fresh
cd mcp-server
gcloud builds submit \
  --tag="gcr.io/${PROJECT_ID}/nero-docs-mcp:$(git rev-parse --short HEAD)"
cd ..
```

This uploads the `mcp-server/` directory to Cloud Build, builds the image against `Dockerfile`, and pushes to `gcr.io/<PROJECT_ID>/nero-docs-mcp:<sha>`.

Take note of the final image path, e.g.:
```
gcr.io/app-site-mainnet-dea7/nero-docs-mcp:5c80600
```

## Step 3 — Deploy to Cloud Run

The repo ships `mcp-server/cloud-run.yaml` as a template. You need to substitute `PROJECT_ID` with your real project and point it at the image you just pushed. Easiest is to deploy with an inline command:

```bash
gcloud run deploy nero-docs-mcp \
  --image="gcr.io/${PROJECT_ID}/nero-docs-mcp:$(git rev-parse --short HEAD)" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --timeout=30 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="MCP_TRANSPORT=http,PORT=8080,DOCS_ORIGIN=https://docs.nerochain.io"
```

Cloud Run prints a URL like `https://nero-docs-mcp-xyz-uc.a.run.app`. Test it:

```bash
curl -sI "https://nero-docs-mcp-xyz-uc.a.run.app/health"
# → HTTP/2 200, body: {"status":"ok","server":{"name":"nero-chain-docs",...}}
```

## Step 4 — Map the custom domain

```bash
gcloud beta run domain-mappings create \
  --service=nero-docs-mcp \
  --domain=docs-mcp.nerochain.io \
  --region="$REGION"
```

Cloud Run prints a CNAME target, e.g. `ghs.googlehosted.com`. Add it to DNS:

```
Type:   CNAME
Name:   docs-mcp.nerochain.io
Value:  ghs.googlehosted.com
TTL:    300
```

Wait 5–30 minutes for the Let's Encrypt cert to provision. Check:

```bash
gcloud beta run domain-mappings describe \
  --domain=docs-mcp.nerochain.io \
  --region="$REGION" \
  --format='value(status.conditions)'
```

All conditions should end up `True`.

## Step 5 — Verify end-to-end

Same script as local verification, pointed at prod:

```bash
# Manual health + initialize handshake
curl -s https://docs-mcp.nerochain.io/health
curl -X POST https://docs-mcp.nerochain.io/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","clientInfo":{"name":"probe","version":"1"},"capabilities":{}}}'

# Or run the full 26-probe suite against prod
DOCS_MCP_ORIGIN=https://docs-mcp.nerochain.io \
  node mcp-server/scripts/verify-deployment.mjs node   # (needs local adjustment — see below)
```

A quick public smoke test works out of the box:

```bash
# Install the MCP into a local Claude Code session and ask it a question
claude mcp add --transport http nero-docs https://docs-mcp.nerochain.io
claude
> Search the NERO docs for paymaster sponsorship types
```

---

## CI/CD — auto-deploy on merges to main

The repo already ships `.github/workflows/mcp-deploy.yml`. It's disabled by default; enabling it requires two one-time setup steps:

### Option A — Service-account key (simplest, less secure)

1. Create a service account with the roles `roles/run.admin`, `roles/artifactregistry.writer`, and `roles/iam.serviceAccountUser`:
   ```bash
   gcloud iam service-accounts create nero-mcp-deployer \
     --display-name="NERO MCP Deployer"
   SA=nero-mcp-deployer@${PROJECT_ID}.iam.gserviceaccount.com
   for ROLE in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser; do
     gcloud projects add-iam-policy-binding "$PROJECT_ID" \
       --member="serviceAccount:$SA" --role="$ROLE"
   done
   gcloud iam service-accounts keys create key.json --iam-account="$SA"
   ```
2. Add GitHub secrets in the repo settings:
   - `GCP_PROJECT_ID` = your project ID
   - `GCP_REGION` = e.g. `us-central1`
   - `GCP_SA_KEY` = contents of `key.json` (paste the full JSON)
3. Delete `key.json` locally (`shred -u key.json`).

### Option B — Workload Identity Federation (recommended for production)

Follows [Google's WIF guide](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines). Replace the `auth` step in the workflow with `google-github-actions/auth@v2` pointed at the provider.

### Trigger behavior

The workflow runs automatically on:
- Push to `main` that touches `mcp-server/**` or `scripts/build-agent-artifacts.mjs`
- `workflow_dispatch` (manual trigger from the GitHub UI)

It reruns the docs build first so the MCP ships against the current `llms-full.jsonl`, then builds the Docker image, pushes to `gcr.io`, and deploys to Cloud Run with a single `gcloud run deploy` command. No YAML manipulation needed.

---

## Alternative host — Fly.io (if you don't use GCP)

If your team already uses Fly, it's a single config file and one command.

1. Install `flyctl`: `brew install flyctl` (or [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)).
2. Create `mcp-server/fly.toml`:

   ```toml
   app = "nero-docs-mcp"
   primary_region = "iad"

   [build]
     dockerfile = "Dockerfile"

   [env]
     MCP_TRANSPORT = "http"
     PORT = "8080"
     DOCS_ORIGIN = "https://docs.nerochain.io"

   [[services]]
     internal_port = 8080
     protocol = "tcp"
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]

     [services.concurrency]
       type = "connections"
       soft_limit = 50
       hard_limit = 80

   [[services.tcp_checks]]
     interval = "30s"
     timeout = "5s"

   [[services.http_checks]]
     interval = "30s"
     timeout = "5s"
     grace_period = "10s"
     path = "/health"
   ```

3. Deploy + map domain:

   ```bash
   cd mcp-server
   fly launch --no-deploy --copy-config --name nero-docs-mcp
   fly deploy
   fly certs add docs-mcp.nerochain.io
   ```

4. Add the DNS records flyctl prints (A + AAAA for the apex-style target).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 404 at `/mcp` but 200 at `/health` | Session not routed — client sent `tools/list` before `initialize`, or `Mcp-Session-Id` header stripped by proxy | Use a real MCP client (Claude Code CLI, Inspector) or raw curl with the session flow from `verify-deployment.mjs` |
| `"Server not initialized"` error body | Same as above — no session | Always call `initialize` first on a new session |
| SSL cert stuck in `CertificateProvisioning` | DNS CNAME missing or wrong | Confirm `dig docs-mcp.nerochain.io` returns the Cloud Run target |
| Health check fails in container | `data/corpus.json` missing from the image | Re-run `yarn build` at the repo root before `gcloud builds submit` |
| Cold-start latency | Min instances = 0, expected | Bump `--min-instances=1` (costs ~$5/mo for an always-warm container) |

## Cost estimate (Cloud Run, `--min-instances=0`)

- ~1 MB response payloads, ~50 req/day average (docs traffic): **< $1/month**
- 1 always-warm instance: ~$4–6/month
- Plus ~$0.10/month for the image storage in gcr.io.

## Post-deploy checklist

- [ ] `curl https://docs-mcp.nerochain.io/health` returns 200 JSON
- [ ] `claude mcp add --transport http nero-docs https://docs-mcp.nerochain.io` + a test question works
- [ ] `scripts/validate-agent-artifacts.mjs` still passes
- [ ] Run orank scan against `docs.nerochain.io` — expect MCP discovery checks to go green
- [ ] Update `docs/agent-readiness.md` with the rescan score
- [ ] Optional: submit the MCP to [mcp.so](https://mcp.so), [Smithery](https://smithery.ai), [Glama](https://glama.ai), [PulseMCP](https://www.pulsemcp.com), [skills.sh](https://skills.sh)
