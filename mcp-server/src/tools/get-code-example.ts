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

export const getCodeExampleTool = {
  name: 'get_code_example',
  description:
    'Return curated code snippets for common NERO integration tasks (deploy contract via Hardhat or Remix, send gasless transaction, integrate AA wallet UI, send a UserOperation, check supported tokens).',
  _meta: {
    ui: { resourceUri: 'ui://nero-docs/page-preview' },
  },
  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: [
          'deploy-contract-hardhat',
          'deploy-contract-remix',
          'send-gasless-tx',
          'integrate-aa-wallet',
          'send-userop',
          'check-supported-tokens',
        ],
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
