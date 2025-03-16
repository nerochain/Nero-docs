import React from 'react';
import { useRouter } from 'next/router';

interface ResourceLink {
  title: string;
  url: string;
}

const resourceLinksMap: Record<string, ResourceLink[]> = {
  '/en/getting-started/introduction': [
    {
      title: "Introduction to NERO Chain",
      url: "https://medium.com/@souza.mvsl/d508f827910e"
    }
  ], '/en/getting-started/key-features': [
    {
      title: "Introduction to NERO Chain",
      url: "https://medium.com/@souza.mvsl/d508f827910e"
    }
  ],
  '/en/getting-started/nero-dapp-architecture': [
    {
      title: "Sample dApps for NERO Chain",
      url: "https://github.com/souzavinny/dapp-samples-nero"
    }
  ], 
  '/en/tutorials/aa-wallet-integration': [
    {
      title: "Simple NERO Template",
      url: "https://github.com/souzavinny/application-templates-nero"
    },
    {
      title: "Working with AA Wallets",
      url: "/en/user-op-sdk/working-with-wallets"
    }
  ],
  '/en/tutorials/checking-sup-tokens': [
    {
      title: "Sample dApps for NERO Chain",
      url: "https://github.com/souzavinny/dapp-samples-nero"
    },
    {
      title: "Getting Supported Tokens",
      url: "/en/developer-tools/user-op-sdk/paymaster-integration#getting-supported-tokens"
    }
  ],
  '/en/tutorials/create-first-dapp': [
    {
      title: "Full NERO dApp",
      url: "https://github.com/souzavinny/dapp-samples-nero/tree/main/nero-aa-tutorial"
    }
  ],
  '/en/tutorials/sending-ops': [
    {
      title: "UserOps Guide",
      url: "/developer-tools/user-op-sdk/sending-user-operations"
    }
  ],
  '/en/tutorials/types-payments': [
    {
      title: "Payment Types Documentation",
      url: "/en/developer-tools/user-op-sdk/paymaster-integration#setting-payment-type"
    },
    {
      title: "ERC-20 Gas Payment Examples",
      url: "https://medium.com/@souza.mvsl/d508f827910e"
    }
  ],

  '/en/core-concepts/architecture/architecture': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],
  '/en/core-concepts/architecture/accessLayer': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],
  '/en/core-concepts/architecture/dataAvailabilityLayer': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],
  '/en/core-concepts/architecture/settlementLayer': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],

  '/en/core-concepts/consensus-mechanism/overview': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],
  '/en/core-concepts/consensus-mechanism/pipelinedConsensus': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],
  '/en/core-concepts/consensus-mechanism/randomNumberGeneration': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],

  '/en/core-concepts/native-account-abstraction/nativeAccountAbstraction': [
    {
      title: "Check the References section",
      url: "/en/core-concepts/references"
    }
  ],
  '/en/developer-tools/user-op-sdk': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    }
  ],
  '/en/developer-tools/user-op-sdk/basic-usage': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    },
    {
      title: "Simple NERO Template",
      url: "https://github.com/souzavinny/application-templates-nero"
    }
  ],
  '/en/developer-tools/user-op-sdk/paymaster-integration': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    }, {
      title: "Simple NERO Template",
      url: "https://github.com/souzavinny/application-templates-nero"
    }
  ],
  '/en/developer-tools/user-op-sdk/sending-user-operations': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    }
  ],
  '/en/developer-tools/user-op-sdk/creating-user-operations': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    }, 
    {
      title: "Simple NERO Template",
      url: "https://github.com/souzavinny/application-templates-nero"
    }
  ],
  '/en/developer-tools/user-op-sdk/working-with-wallets': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    },
    {
      title: "Simple NERO Template",
      url: "https://github.com/souzavinny/application-templates-nero"
    }
  ],
  '/en/developer-tools/user-op-sdk/advanced-usage': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    },
    {
      title: "Full NERO dApp",
      url: "https://github.com/souzavinny/dapp-samples-nero/tree/main/nero-aa-tutorial"
    }
  ],
  '/en/developer-tools/user-op-sdk/error-handling': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    },
    {
      title: "Full NERO dApp",
      url: "https://github.com/souzavinny/dapp-samples-nero/tree/main/nero-aa-tutorial"
    }
  ],
  '/en/developer-tools/user-op-sdk/best-practices': [
    {
      title: "User OP SDK Github",
      url: "https://github.com/nerochain/aa-userop-sdk"
    }
  ],
  '/en/developer-tools/paymaster-api': [
    {
      title: "Paymaster API Guide",
      url: "https://medium.com/@souza.mvsl/d508f827910e"
    },
    {
      title: "Gas Sponsorship Examples",
      url: "https://medium.com/@souza.mvsl/d508f827910e"
    }
  ],
};

const SidebarResources: React.FC = () => {
  const router = useRouter();
  const links = resourceLinksMap[router.pathname];

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center text-xs mb-2">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mr-2.5 flex-shrink-0"
          style={{ width: '16px', height: '16px' }}
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-semibold text-gray-700">Useful resources</span>
      </div>
      
      <ul className="pl-5 space-y-1.5 text-xs">
        {links.map((link, index) => (
          <li key={index} className="leading-tight">
            <a 
              href={link.url} 
              className="text-gray-700 hover:text-gray-900 hover:underline flex items-center"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span className="inline-block">{link.title}</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="ml-0.5 inline-block flex-shrink-0"
                style={{ width: '12px', height: '12px' }}
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

export default SidebarResources; 