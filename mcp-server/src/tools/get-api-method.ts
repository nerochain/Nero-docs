const METHODS = {
  pm_supported_tokens: {
    summary:
      'List the ERC-20 tokens accepted for gas payments on the given EntryPoint, with current price ratios relative to NERO.',
    params: [
      { name: 'userOperation', description: 'Minimal UserOperation (at minimum, sender).' },
      { name: 'apiKey', description: 'API key from the AA Platform dashboard.' },
      {
        name: 'entryPoint',
        description:
          'EntryPoint contract address. Typically 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789.',
      },
    ],
    returns:
      '{ freeGas: boolean, native: {gas, price, decimals, symbol}, tokens: [{type, token, symbol, decimals, price}] }',
    docs: 'https://docs.nerochain.io/en/developer-tools/paymaster-api/core-methods#pm_supported_tokens',
  },
  pm_sponsor_userop: {
    summary:
      'Sign a UserOperation with the Paymaster, returning the UserOperation with paymasterAndData populated so it can be bundled.',
    params: [
      { name: 'userOperation', description: 'Fully-formed UserOperation (except paymasterAndData).' },
      { name: 'apiKey', description: 'API key from the AA Platform dashboard.' },
      { name: 'entryPoint', description: 'EntryPoint contract address.' },
      {
        name: 'context',
        description:
          '{ type: 0 | 1 | 2, token?: Address } — 0=sponsored, 1=prepay ERC-20, 2=postpay ERC-20. token required for types 1 and 2.',
      },
    ],
    returns: 'Signed UserOperation including paymasterAndData.',
    docs: 'https://docs.nerochain.io/en/developer-tools/paymaster-api/core-methods#pm_sponsor_userop',
  },
  pm_entrypoints: {
    summary: 'Return the EntryPoint contract addresses currently supported by this Paymaster.',
    params: [
      {
        name: '(positional)',
        description: 'Pass ["entryPoint"] or an empty array.',
      },
    ],
    returns: 'Array of EntryPoint addresses.',
    docs: 'https://docs.nerochain.io/en/developer-tools/paymaster-api/core-methods#pm_entrypoints',
  },
} as const;

export const getApiMethodTool = {
  name: 'get_api_method',
  description:
    'Return the JSON-RPC signature, parameters, and docs link for a Paymaster API method (pm_supported_tokens, pm_sponsor_userop, pm_entrypoints).',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['pm_supported_tokens', 'pm_sponsor_userop', 'pm_entrypoints'],
      },
    },
    required: ['method'],
    additionalProperties: false,
  },
  async handler(args: { method: keyof typeof METHODS }) {
    const spec = METHODS[args.method];
    if (!spec) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `Unknown method: ${args.method}` }],
      };
    }
    const text =
      `# ${args.method}\n\n${spec.summary}\n\n**Parameters**\n\n` +
      spec.params.map((p) => `- \`${p.name}\` — ${p.description}`).join('\n') +
      `\n\n**Returns**: ${spec.returns}\n\n**Docs**: ${spec.docs}`;
    return {
      content: [{ type: 'text' as const, text }],
      structuredContent: { method: args.method, ...spec },
    };
  },
};
