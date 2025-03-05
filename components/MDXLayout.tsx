import React from 'react';
import { useRouter } from 'next/router';
import RightSidebar from './RightSidebar';

interface MDXLayoutProps {
  children: React.ReactNode;
  toc?: React.ReactNode;
}

const resourceLinksMap: Record<string, { title: string; url: string }[]> = {
  '/en/getting-started/introduction': [
    {
      title: "NeroChain Architecture Overview",
      url: "https://nero-docs.vercel.app/en/nero-architecture"
    },
    {
      title: "Developer Tools & Account Abstraction",
      url: "https://nero-docs.vercel.app/en/developer-tools"
    },
    {
      title: "NeroChain GitHub Repository",
      url: "https://github.com/nerochain"
    }
  ]
};

const MDXLayout: React.FC<MDXLayoutProps> = ({ children, toc }) => {
  const router = useRouter();
  const resourceLinks = resourceLinksMap[router.pathname] || [];

  return (
    <div className="nextra-container main-container flex flex-row">
      <article className="nextra-body full w-full min-w-0 max-w-4xl px-6 pt-4 md:px-8">
        {children}
      </article>
      <RightSidebar toc={toc} resourceLinks={resourceLinks} />
    </div>
  );
};

export default MDXLayout; 