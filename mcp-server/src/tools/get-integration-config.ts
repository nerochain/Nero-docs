const ENTRY_POINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const ACCOUNT_FACTORY = '0x9406Cc6185a346906296840746125a0E44976454';
const STAKING_CONTRACT = '0x000000000000000000000000000000000000f000';
const MULTICALL3 = '0x2c43d4695b99029f940e5aae273348e22016e0d0';
const DEFAULT_VALIDATOR = '0xcbA00A3d882497A54e4d3a0a03b7FE1d2495F295';

const TESTNET = {
  name: 'NERO Testnet',
  chainIdDecimal: 689,
  chainIdHex: '0x2B1',
  rpcUrl: 'https://rpc-testnet.nerochain.io',
  bundlerUrl: 'https://bundler-testnet.nerochain.io',
  paymasterUrl: 'https://paymaster-testnet.nerochain.io',
  blockExplorerUrl: 'https://testnet.neroscan.io',
  apiUrl: 'https://api.neroscan.io',
  web3authNetwork: 'SAPPHIRE_DEVNET',
};

const MAINNET = {
  name: 'NERO Mainnet',
  chainIdDecimal: 1689,
  chainIdHex: '0x699',
  rpcUrl: 'https://rpc.nerochain.io',
  bundlerUrl: 'https://bundler.nerochain.io',
  paymasterUrl: 'https://paymaster.nerochain.io',
  blockExplorerUrl: 'https://neroscan.io',
  apiUrl: 'https://api.neroscan.io',
  web3authNetwork: 'SAPPHIRE_MAINNET',
};

const NATIVE_TOKEN = { symbol: 'NERO', decimals: 18 };

const CONTRACTS = {
  entryPoint: {
    address: ENTRY_POINT,
    description: 'ERC-4337 EntryPoint. Same address on testnet and mainnet.',
  },
  accountFactory: {
    address: ACCOUNT_FACTORY,
    description: 'SimpleAccount factory. Used to derive SCW addresses for Web3Auth users.',
  },
  staking: {
    address: STAKING_CONTRACT,
    description: 'Native staking pre-compile. Validator delegation, exit, and reward claim live here.',
    defaultValidator: DEFAULT_VALIDATOR,
  },
  multicall3: {
    address: MULTICALL3,
    description: 'Batch call utility for read-heavy flows (balances, prices).',
  },
};

const PAYMASTER_TYPES = [
  { type: 0, name: 'Sponsored', summary: 'Developer pays from AA Platform balance. Free for the end user. Ideal for onboarding and Web2-style UX.' },
  { type: 1, name: 'Prepay ERC-20', summary: 'User pays gas in an ERC-20 token up-front. Excess refunded after execution. Requires approving the paymaster to spend the token.' },
  { type: 2, name: 'Postpay ERC-20', summary: 'User pays exactly the gas consumed in an ERC-20 after execution. Requires approval. Risk of failure if user depletes the token mid-op.' },
];

const ENV_VARS = {
  required: [
    { key: 'NEXT_PUBLIC_WEB3AUTH_CLIENT_ID', description: 'Web3Auth client ID from dashboard.web3auth.io.' },
    { key: 'NEXT_PUBLIC_WEB3AUTH_NETWORK', description: 'SAPPHIRE_DEVNET (dev) or SAPPHIRE_MAINNET (prod).' },
    { key: 'NEXT_PUBLIC_CHAIN_ID', description: 'Hex chain ID. Testnet 0x2B1 / Mainnet 0x699.' },
    { key: 'NEXT_PUBLIC_RPC_URL', description: 'NERO RPC endpoint.' },
    { key: 'NEXT_PUBLIC_BUNDLER_URL', description: 'NERO bundler endpoint.' },
    { key: 'NEXT_PUBLIC_PAYMASTER_URL', description: 'NERO paymaster endpoint.' },
    { key: 'NEXT_PUBLIC_PAYMASTER_API', description: 'Paymaster API key from aa-platform.nerochain.io.' },
    { key: 'NEXT_PUBLIC_ENTRY_POINT', description: `EntryPoint address. Default ${ENTRY_POINT}.` },
    { key: 'NEXT_PUBLIC_ACCOUNT_FACTORY', description: `SimpleAccount factory. Default ${ACCOUNT_FACTORY}.` },
  ],
  optional: [
    { key: 'NEXT_PUBLIC_DISPLAY_NAME', description: 'Human-readable network label shown in Web3Auth UI.' },
    { key: 'NEXT_PUBLIC_BLOCK_EXPLORER_URL', description: 'Block explorer to link transactions to.' },
    { key: 'NEXT_PUBLIC_LOGO', description: 'Logo URL shown in Web3Auth modal.' },
    { key: 'NEXT_PUBLIC_API_URL', description: 'neroscan API base URL (defaults to https://api.neroscan.io).' },
    { key: 'NEXT_PUBLIC_VALIDATOR_ADDRESS', description: `Validator to delegate to. Default ${DEFAULT_VALIDATOR}.` },
    { key: 'NEXT_PUBLIC_MULTICALL3_ADDRESS', description: `Multicall3 address. Default ${MULTICALL3}.` },
  ],
  serverOnly: [
    { key: 'NEROCHAIN_NETWORK', description: 'testnet | mainnet — used by server-side scripts.' },
    { key: 'NEROCHAIN_FAUCET_PRIVATE_KEY', description: 'Private key for server-side operations. Never expose to the client.' },
  ],
};

const WEB3AUTH = {
  socialLoginProviders: ['google', 'twitter', 'facebook', 'discord', 'apple', 'github', 'email_passwordless', 'sms_passwordless'],
  networks: ['SAPPHIRE_DEVNET', 'SAPPHIRE_MAINNET', 'TESTNET', 'MAINNET'],
  uxModes: ['redirect', 'popup'],
  requiredProviderNesting: 'Web3AuthProvider → QueryClientProvider → WagmiProvider → app',
  ssrHydration: 'Use cookieToWeb3AuthState(cookie) in layout.tsx and pass to <Web3AuthProvider initialState>.',
  noteForLineMiniApps: 'Use uxMode: "redirect" and defaultLanguage: "ja" — LINE in-app browsers block popups.',
};

const SECURITY_RULES = [
  'Never ship the paymaster API key or any private key in client JavaScript.',
  'Always treat the Smart Contract Wallet (SCW) address as the canonical user address — not the Web3Auth EOA.',
  'Validate destination addresses before calling builder.execute() — SCW calls are executed atomically.',
  'Handle -32503 and -32504 paymaster errors with exponential backoff; treat other -325xx codes as non-retriable.',
  'Rotate paymaster API keys when exposed. AA Platform dashboard invalidates old keys immediately.',
];

export const getIntegrationConfigTool = {
  name: 'get_integration_config',
  description:
    'Return structured reference configuration for integrating NERO Chain into web apps: network parameters (chain IDs, RPC/bundler/paymaster URLs, block explorers), pre-deployed contract addresses (EntryPoint, SimpleAccountFactory, staking, multicall3), paymaster payment types, required and optional environment variables, Web3Auth setup rules, and security constraints. Returns JSON, not prose — suitable for agents that need to produce boilerplate or validate a config without parsing markdown.',
  _meta: {
    ui: { resourceUri: 'ui://nero-docs/embed' },
  },
  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: [
          'all',
          'networks',
          'testnet',
          'mainnet',
          'contracts',
          'paymaster-types',
          'env-vars',
          'web3auth',
          'security',
        ],
        default: 'all',
      },
      network: {
        type: 'string',
        enum: ['testnet', 'mainnet'],
        description: 'When topic is "env-vars", render the values for this network.',
      },
    },
    additionalProperties: false,
  },
  async handler(args: { topic?: string; network?: 'testnet' | 'mainnet' }) {
    const topic = args.topic ?? 'all';
    const network = args.network ?? 'testnet';
    const networkConfig = network === 'mainnet' ? MAINNET : TESTNET;

    let payload: unknown;
    switch (topic) {
      case 'networks':
        payload = { testnet: TESTNET, mainnet: MAINNET, nativeToken: NATIVE_TOKEN };
        break;
      case 'testnet':
        payload = { ...TESTNET, nativeToken: NATIVE_TOKEN };
        break;
      case 'mainnet':
        payload = { ...MAINNET, nativeToken: NATIVE_TOKEN };
        break;
      case 'contracts':
        payload = CONTRACTS;
        break;
      case 'paymaster-types':
        payload = { types: PAYMASTER_TYPES, entryPoint: ENTRY_POINT };
        break;
      case 'env-vars':
        payload = {
          network,
          exampleValues: {
            NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: 'your-web3auth-client-id',
            NEXT_PUBLIC_WEB3AUTH_NETWORK: networkConfig.web3authNetwork,
            NEXT_PUBLIC_CHAIN_ID: networkConfig.chainIdHex,
            NEXT_PUBLIC_RPC_URL: networkConfig.rpcUrl,
            NEXT_PUBLIC_BUNDLER_URL: networkConfig.bundlerUrl,
            NEXT_PUBLIC_PAYMASTER_URL: networkConfig.paymasterUrl,
            NEXT_PUBLIC_PAYMASTER_API: 'your-paymaster-api-key',
            NEXT_PUBLIC_ENTRY_POINT: ENTRY_POINT,
            NEXT_PUBLIC_ACCOUNT_FACTORY: ACCOUNT_FACTORY,
            NEXT_PUBLIC_DISPLAY_NAME: networkConfig.name,
            NEXT_PUBLIC_BLOCK_EXPLORER_URL: networkConfig.blockExplorerUrl,
            NEXT_PUBLIC_API_URL: networkConfig.apiUrl,
          },
          variables: ENV_VARS,
        };
        break;
      case 'web3auth':
        payload = WEB3AUTH;
        break;
      case 'security':
        payload = { rules: SECURITY_RULES };
        break;
      case 'all':
      default:
        payload = {
          networks: { testnet: TESTNET, mainnet: MAINNET, nativeToken: NATIVE_TOKEN },
          contracts: CONTRACTS,
          paymasterTypes: PAYMASTER_TYPES,
          envVars: ENV_VARS,
          web3auth: WEB3AUTH,
          security: SECURITY_RULES,
          docs: 'https://docs.nerochain.io/en/developer-tools',
        };
    }

    const asText = JSON.stringify(payload, null, 2);
    return {
      content: [{ type: 'text' as const, text: asText }],
      structuredContent: payload as Record<string, unknown>,
    };
  },
};
