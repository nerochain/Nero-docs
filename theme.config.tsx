import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import MessageBanner from "./components/MessageBanner";
import SidebarResources from "./components/SidebarResources";
import AskButton from "./components/AskButton";

const themeConfig: DocsThemeConfig = {
  logo: (
    <>
      <img 
        src="/assets/nerologo.svg" 
        alt="NERO Chain Logo"
        width={200}
        height={128}
        style={{ borderRadius: '20px' }}
      />
    </>
  ),
  // 日本語meta情報
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>NERO Docs | Developer Guides, SDKs &amp; Resources</title>
      <meta name="description" content="Explore NERO documentation, SDKs, APIs, account abstraction tools, smart contract guides, and developer resources for building applications on NERO Chain." />
    </>
  ),
  banner: {
    key: 'network-status',
    content: <MessageBanner />,
    dismissible: false
  },
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
  },
  
  // Add custom components to the right sidebar
  toc: {
    extraContent: <SidebarResources />
  },

  // Wrap main content with the "Ask" button so every docs page surfaces
  // copy-page-as-markdown, open-in-ChatGPT/Claude, and MCP install actions.
  main: ({ children }) => (
    <>
      <AskButton />
      {children}
    </>
  )
};

export default themeConfig;
