import React from 'react';
import UsefulResources from './UsefulResources';

interface RightSidebarProps {
  toc?: React.ReactNode;
  resourceLinks?: {
    title: string;
    url: string;
  }[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ toc, resourceLinks }) => {
  return (
    <div className="nextra-toc w-64 hidden xl:block text-sm px-4">
      {toc && (
        <>
          <div className="font-medium mb-4">On this page</div>
          <div className="nextra-scrollbar overflow-y-auto pr-4 -mr-4 max-h-[calc(100vh-4rem-env(safe-area-inset-bottom))]">
            {toc}
          </div>
        </>
      )}
      
      {resourceLinks && resourceLinks.length > 0 && (
        <UsefulResources links={resourceLinks} />
      )}
    </div>
  );
};

export default RightSidebar; 