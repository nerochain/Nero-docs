import fs from 'node:fs';
import { CODE_EXAMPLES_PATH } from '../config.js';

type Example = {
  topic: string;
  title: string;
  description: string;
  language: string;
  code: string;
  docs: string;
};

let cached: Example[] | null = null;
function loadExamples(): Example[] {
  if (cached) return cached;
  const raw = fs.readFileSync(CODE_EXAMPLES_PATH, 'utf8');
  cached = JSON.parse(raw) as Example[];
  return cached;
}

const TOPICS = [
  'quickstart',
  'providers-setup',
  'builder-with-paymaster-hook',
  'wallet-hook',
  'send-gasless-tx',
  'send-userop',
  'batch-transactions',
  'erc20-transfer',
  'nft-mint',
  'staking',
  'integrate-aa-wallet',
  'web3auth-login-methods',
  'nextjs-ssr-setup',
  'fetch-balance',
  'fetch-price',
  'check-supported-tokens',
  'complete-wallet-component',
  'line-miniapp',
  'error-handling',
  'deploy-contract-hardhat',
  'deploy-contract-remix',
] as const;

export const getCodeExampleTool = {
  name: 'get_code_example',
  description:
    'Return curated, production-ready code snippets for NERO Chain integration tasks. Covers: initial install/quickstart, Web3Auth + Wagmi + React Query provider stack, the useWallet and useBuilderWithPaymaster React hooks, gasless native transfers, UserOperation construction, batch transactions, ERC-20 transfers, NFT minting, native staking, Web3Auth login-method tuning, Next.js SSR hydration, balance/price fetching, LINE mini app tweaks, error handling, and contract deploys via Hardhat or Remix.',
  _meta: {
    ui: { resourceUri: 'ui://nero-docs/page-preview' },
  },
  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: [...TOPICS],
        description: 'One of the curated integration topics.',
      },
    },
    required: ['topic'],
    additionalProperties: false,
  },
  async handler(args: { topic: Example['topic'] }) {
    const examples = loadExamples();
    const match = examples.find((e) => e.topic === args.topic);
    if (!match) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `No example for topic: ${args.topic}` }],
      };
    }
    const text = `# ${match.title}\n\n${match.description}\n\n\`\`\`${match.language}\n${match.code}\n\`\`\`\n\nDocs: ${match.docs}`;
    return {
      content: [{ type: 'text' as const, text }],
      structuredContent: match,
    };
  },
};
