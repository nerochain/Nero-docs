import React from 'react';

interface ResourceLink {
  title: string;
  url: string;
}

interface UsefulResourcesProps {
  links: ResourceLink[];
}

const UsefulResources: React.FC<UsefulResourcesProps> = ({ links }) => {
  return (
    <div className="mt-6">
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 mr-2 text-teal-500"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Useful resources to learn more</span>
      </div>
      
      <ul className="pl-6 space-y-2 text-sm">
        {links.map((link, index) => (
          <li key={index}>
            <a 
              href={link.url} 
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {link.title}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3 w-3 ml-1 inline-block"
              >
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsefulResources; 