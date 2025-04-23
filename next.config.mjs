import nextra from "nextra";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});

export default withNextra({
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "en",
    localeDetection: true,
  },
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
});

// If you have other Next.js configurations, you can pass them as the parameter:
// export default withNextra({ /* other next.js config */ })
