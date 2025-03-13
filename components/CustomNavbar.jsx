import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import HeaderAskAI component with no SSR to avoid hydration issues
const HeaderAskAI = dynamic(() => import('./HeaderAskAI'), {
  ssr: false,
});

// This component will be used as a custom navbar for the Nextra theme
const CustomNavbar = ({ 
  // Standard Nextra NavBarProps
  lite = false,
  links,
  locale,
  menu,
  themeSwitch,
  title,
  banner,
  direction,
  // Our custom props
  logo,
  ...props
}) => {
  const router = useRouter();

  return (
    <div className="nextra-nav-container nx-sticky nx-top-0 nx-z-40 nx-w-full nx-backdrop-blur nx-bg-white dark:nx-bg-dark nx-transition-colors">
      <div className="nx-mx-auto nx-flex nx-h-[var(--nextra-navbar-height)] nx-w-full nx-max-w-[90rem] nx-items-center nx-gap-2 nx-pl-[max(env(safe-area-inset-left),1.5rem)] nx-pr-[max(env(safe-area-inset-right),1.5rem)]">
        {/* Logo */}
        <div className="nx-flex nx-gap-2 nx-mr-auto">
          {logo && (
            <Link href="/" className="nx-flex nx-items-center">
              {logo}
            </Link>
          )}
          {title && <span>{title}</span>}
        </div>

        {/* Our custom placement for HeaderAskAI */}
        <div className="nx-mr-2">
          <HeaderAskAI />
        </div>
        
        {/* Render the rest of the navbar items */}
        {links}
        {menu}
        {themeSwitch}
      </div>
      {banner && <div className="nx-border-b nx-border-gray-200 dark:nx-border-neutral-800">{banner}</div>}
    </div>
  );
};

export default CustomNavbar; 