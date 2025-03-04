import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const themeConfig: DocsThemeConfig = {
  logo: (
    <>
      <img 
        src="/assets/nerologo.svg" 
        alt="NERO Chain Logo"
        width={200}
        height={128}
      />
    </>
  ),
  // 日本語meta情報
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>NERO Chain Docs</title>
    </>
  ),
  footer: {
    content: (
      <span>
        {new Date().getFullYear()} ©{' '}
        <a href="https://nerochain.io/" target="_blank">
          NERO Chain
        </a>
        .
      </span>
    )
  },

  editLink: {
    component: null 
  },
  feedback: {
    content: null 
  },

  project: {
    link: "https://github.com/nerochain",
  },
  chat: {
    link: "https://discord.com/invite/nerochainofficial",
  },
  i18n: [
    { locale: "en", name: "English" },
    { locale: "ja", name: "日本語" },
  ],
  
  // Default menu collapse level
  sidebar: {
    defaultMenuCollapseLevel: 1
  }
};

export default themeConfig;
