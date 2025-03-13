import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import MessageBanner from "./components/MessageBanner";
import SidebarResources from "./components/SidebarResources";
import dynamic from "next/dynamic";

// Dynamically import HeaderAskAI component with no SSR to avoid hydration issues
const HeaderAskAI = dynamic(() => import("./components/HeaderAskAI"), {
  ssr: false,
});

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
      <title>NERO Chain Docs</title>
      {/* Add custom CSS */}
      <link rel="stylesheet" href="/custom.css" />
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
  
  // Custom search
  search: {
    placeholder: "Search documentation...",
    emptyResult: "No results found.",
  },
  
  // Add the HeaderAskAI component to the navbar
  navbar: {
    extraContent: (
      <div className="nx-flex nx-items-center nx-gap-4">
        <HeaderAskAI />
      </div>
    )
  }
};

export default themeConfig;
