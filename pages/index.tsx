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

const DESCRIPTION =
  "Developer documentation for NERO Chain — a Layer-1 blockchain with native account abstraction, paymaster-based gas sponsorship, and Web2-friendly onboarding. English and Japanese.";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const userLang = typeof navigator !== "undefined" ? navigator.language : "en";
    if (userLang.startsWith("ja")) {
      void router.replace("/ja");
    } else {
      void router.replace("/en");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>NERO Chain Documentation</title>
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
        <link rel="describedby" href="https://docs.nerochain.io/llms.txt" type="text/plain" />
        <link rel="sitemap" type="application/xml" href="https://docs.nerochain.io/sitemap.xml" />
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
      </Head>
      <main
        style={{
          maxWidth: 720,
          margin: "4rem auto",
          padding: "0 1.5rem",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          lineHeight: 1.55,
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          NERO Chain Documentation
        </h1>
        <p>
          NERO Chain is a Layer-1 blockchain with native account abstraction,
          paymaster-based gas sponsorship, and Web2-friendly authentication
          (social logins, password-based security, MetaMask). These docs cover
          the protocol architecture, developer tools, and integration tutorials.
        </p>
        <p>
          Choose a language to continue. Your browser will be redirected
          automatically; if nothing happens, use the links below.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0" }}>
          <li style={{ margin: "0.5rem 0" }}>
            <a href="/en" style={{ fontSize: "1.1rem" }}>
              English documentation →
            </a>
          </li>
          <li style={{ margin: "0.5rem 0" }}>
            <a href="/ja" style={{ fontSize: "1.1rem" }}>
              日本語ドキュメント →
            </a>
          </li>
        </ul>
        <section aria-labelledby="agent-resources" style={{ marginTop: "2.5rem" }}>
          <h2 id="agent-resources" style={{ fontSize: "1.15rem" }}>
            For AI agents
          </h2>
          <ul>
            <li>
              <a href="/llms.txt">llms.txt</a> — curated index of the docs
            </li>
            <li>
              <a href="/llms-full.txt">llms-full.txt</a> — full docs corpus as
              markdown
            </li>
            <li>
              <a href="/specs/paymaster-openapi.yaml">
                Paymaster JSON-RPC OpenAPI spec
              </a>
            </li>
            <li>
              <a href="/en/ai-resources">AI resources hub</a> — MCP endpoint
              and install snippets
            </li>
          </ul>
        </section>
      </main>
      <noscript>
        <p style={{ textAlign: "center", margin: "2rem" }}>
          JavaScript is disabled. Pick{" "}
          <a href="/en">English</a> or <a href="/ja">日本語</a> to read the
          docs.
        </p>
      </noscript>
    </>
  );
}
