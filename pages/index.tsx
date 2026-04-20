import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "nextra/hooks";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NERO Chain",
  url: "https://nerochain.io",
  logo: "https://docs.nerochain.io/assets/nerologo.svg",
  sameAs: [
    "https://github.com/nerochain",
    "https://discord.com/invite/nerochainofficial",
    "https://x.com/NeroChain",
  ],
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NERO Chain Documentation",
  url: "https://docs.nerochain.io",
  inLanguage: ["en", "ja"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://docs.nerochain.io/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NERO Chain",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "NERO Chain is a Layer-1 blockchain with native account abstraction, paymaster-based gas sponsorship, and Web2-style authentication (social logins, password-based security, MetaMask).",
  url: "https://docs.nerochain.io",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: ORG_JSON_LD,
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NERO Chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NERO Chain is a Layer-1 blockchain with native account abstraction, paymaster-based gas sponsorship, and Web2-friendly authentication.",
      },
    },
    {
      "@type": "Question",
      name: "How do paymaster gas sponsorship types work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NERO supports three payment types: Type 0 (developer-sponsored free gas), Type 1 (user pays gas in ERC-20 tokens up-front with surplus refunded), Type 2 (user pays the exact gas consumed in ERC-20 tokens after execution).",
      },
    },
    {
      "@type": "Question",
      name: "What is the EntryPoint contract address on NERO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The EntryPoint contract is deployed at 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 on NERO Chain.",
      },
    },
    {
      "@type": "Question",
      name: "Where is the NERO Paymaster JSON-RPC API documented?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Paymaster API is documented in OpenAPI 3.1 format at https://docs.nerochain.io/openapi.yaml and in prose at https://docs.nerochain.io/en/developer-tools/paymaster-api.",
      },
    },
  ],
};

const DESCRIPTION =
  "Developer documentation for NERO Chain — a Layer-1 blockchain with native account abstraction, paymaster-based gas sponsorship, and Web2-friendly onboarding. English and Japanese.";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "agent") return;
    const userLang = navigator.language;
    if (userLang.startsWith("ja")) {
      void router.replace("/ja");
    } else {
      void router.replace("/en");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>NERO Chain Documentation — Layer-1 Blockchain with Native Account Abstraction</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content="NERO Chain Documentation" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docs.nerochain.io" />
        <meta property="og:image" content="https://docs.nerochain.io/assets/nerologo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://docs.nerochain.io" />
        <link rel="alternate" hrefLang="en" href="https://docs.nerochain.io/en" />
        <link rel="alternate" hrefLang="ja" href="https://docs.nerochain.io/ja" />
        <link rel="alternate" hrefLang="x-default" href="https://docs.nerochain.io/en" />
        <link rel="alternate" type="text/markdown" href="https://docs.nerochain.io/index.md" />
        <link rel="describedby" href="https://docs.nerochain.io/llms.txt" type="text/plain" />
        <link rel="sitemap" type="application/xml" href="https://docs.nerochain.io/sitemap.xml" />
        <link rel="service-desc" type="application/yaml" href="https://docs.nerochain.io/openapi.yaml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        />
      </Head>
      <main
        style={{
          maxWidth: 840,
          margin: "3rem auto",
          padding: "0 1.5rem 4rem",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          lineHeight: 1.55,
        }}
      >
        <h1 style={{ fontSize: "2.1rem", marginBottom: "0.4rem" }}>
          NERO Chain Documentation
        </h1>
        <p style={{ color: "inherit", opacity: 0.82, margin: "0 0 1rem" }}>
          Layer-1 blockchain · native account abstraction · paymaster gas sponsorship · Web2-friendly login
        </p>
        <p>
          NERO Chain is a Layer-1 blockchain with native account abstraction,
          paymaster-based gas sponsorship, and Web2-friendly authentication
          (social logins, password-based security, MetaMask). These docs cover
          the protocol architecture, developer tools, and integration
          tutorials in both English and Japanese.
        </p>

        <h2 style={{ marginTop: "2rem" }}>Read the docs</h2>
        <ul>
          <li>
            <a href="/en">English documentation →</a>
          </li>
          <li>
            <a href="/ja">日本語ドキュメント →</a>
          </li>
        </ul>

        <h2 style={{ marginTop: "2rem" }}>What you can build</h2>
        <ul>
          <li>
            <strong>Gasless dApps</strong> — sponsor your users' transactions
            via the{" "}
            <a href="/en/developer-tools/paymaster-api">Paymaster API</a> (Type 0).
          </li>
          <li>
            <strong>Pay gas in any ERC-20</strong> — Type 1 prepay or Type 2
            postpay, with automatic price discovery.
          </li>
          <li>
            <strong>Web2-style onboarding</strong> — social login + password
            recovery via the <a href="/en/developer-tools/aa-wallet-ui-usage">AA Wallet UI</a>.
          </li>
          <li>
            <strong>Your first contract</strong> — deploy ERC-20/ERC-721 to
            NERO testnet with{" "}
            <a href="/en/tutorials/first-contract/using-hardhat">Hardhat</a> or{" "}
            <a href="/en/tutorials/first-contract/using-remix">Remix</a>.
          </li>
          <li>
            <strong>Run a validator</strong> — see the{" "}
            <a href="/en/node-validators">Node Validators</a> section.
          </li>
        </ul>

        <h2 style={{ marginTop: "2rem" }}>Key facts</h2>
        <ul>
          <li>
            <strong>Native token:</strong> NERO
          </li>
          <li>
            <strong>EntryPoint (ERC-4337) contract:</strong>{" "}
            <code>0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789</code>
          </li>
          <li>
            <strong>Paymaster API methods:</strong>{" "}
            <code>pm_supported_tokens</code>, <code>pm_sponsor_userop</code>,{" "}
            <code>pm_entrypoints</code>
          </li>
          <li>
            <strong>Payment types:</strong> 0 (sponsored / free),
            1 (prepay ERC-20), 2 (postpay ERC-20)
          </li>
          <li>
            <strong>Testnet faucet + explorer:</strong> see{" "}
            <a href="/en/faq">FAQ</a>
          </li>
          <li>
            <strong>AA Platform (API keys, quotas):</strong>{" "}
            <a href="https://aa-platform.nerochain.io">
              aa-platform.nerochain.io
            </a>
          </li>
        </ul>

        <h2 style={{ marginTop: "2rem" }}>For AI agents</h2>
        <p>
          NERO docs ship a full machine-readable surface. See the{" "}
          <a href="/en/ai-resources">AI resources hub</a> for MCP install
          snippets (Claude Code, Claude Desktop, Cursor, VS Code, ChatGPT,
          Codex) and download links.
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "0.5rem 0 1rem",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "0.4rem 0.6rem" }}>Resource</th>
              <th style={{ padding: "0.4rem 0.6rem" }}>Path</th>
              <th style={{ padding: "0.4rem 0.6rem" }}>Format</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>Curated index</td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="/llms.txt">/llms.txt</a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>text/plain</td>
            </tr>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>Full corpus</td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="/llms-full.txt">/llms-full.txt</a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>text/plain</td>
            </tr>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>Page-per-line JSON</td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="/llms-full.jsonl">/llms-full.jsonl</a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>application/jsonl</td>
            </tr>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>Site index</td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="/site-index.json">/site-index.json</a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>application/json</td>
            </tr>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>Paymaster OpenAPI</td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="/openapi.yaml">/openapi.yaml</a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>application/yaml</td>
            </tr>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>MCP server</td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="https://docs-mcp.nerochain.io">
                  docs-mcp.nerochain.io
                </a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>MCP (HTTP)</td>
            </tr>
            <tr>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                MCP server card
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>
                <a href="/.well-known/mcp/server-card.json">
                  /.well-known/mcp/server-card.json
                </a>
              </td>
              <td style={{ padding: "0.4rem 0.6rem" }}>application/json</td>
            </tr>
          </tbody>
        </table>

        <h2 style={{ marginTop: "2rem" }}>FAQ</h2>
        <dl>
          <dt>
            <strong>Is NERO Chain an L2?</strong>
          </dt>
          <dd style={{ margin: "0 0 1rem 0" }}>
            NERO is a Layer-1 blockchain. It runs its own consensus and
            settlement, and includes native account abstraction at the
            protocol level.
          </dd>
          <dt>
            <strong>What's the testnet RPC endpoint?</strong>
          </dt>
          <dd style={{ margin: "0 0 1rem 0" }}>
            <code>https://rpc-testnet.nerochain.io</code>. See the{" "}
            <a href="/en/tutorials/first-contract">Cookbook</a> for chain ID
            and faucet instructions.
          </dd>
          <dt>
            <strong>How much does gas cost?</strong>
          </dt>
          <dd style={{ margin: "0 0 1rem 0" }}>
            Gas is paid in NERO. dApps can sponsor user gas (Type 0) or let
            users pay in any supported ERC-20 (Type 1 / Type 2). See{" "}
            <a href="/pricing.md">/pricing.md</a>.
          </dd>
          <dt>
            <strong>How do I authenticate as an agent?</strong>
          </dt>
          <dd style={{ margin: "0 0 1rem 0" }}>
            Get an API key from the AA Platform dashboard and send it as
            <code>X-API-Key</code>. See the{" "}
            <a href="/en/agent-auth">Agent Auth Guide</a>.
          </dd>
        </dl>

        <p style={{ marginTop: "2.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
          Not the language you need? Jump to{" "}
          <a href="/en">English</a> · <a href="/ja">日本語</a>.
        </p>
      </main>
      <noscript>
        <p style={{ textAlign: "center", margin: "2rem" }}>
          JavaScript is disabled. Pick <a href="/en">English</a> or{" "}
          <a href="/ja">日本語</a> to read the docs.
        </p>
      </noscript>
    </>
  );
}
