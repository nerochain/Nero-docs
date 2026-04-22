#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..', '..');
const REPORT_DIR = path.join(REPO_ROOT, 'reports');
const TASKS_PATH = path.join(REPO_ROOT, 'scripts', 'eval', 'tasks.yaml');

const TARGETS = [
  { id: 'claude-opus-4-7', provider: 'anthropic', model: 'claude-opus-4-7' },
  { id: 'claude-sonnet-4-6', provider: 'anthropic', model: 'claude-sonnet-4-6' },
  { id: 'gpt-5', provider: 'openai', model: 'gpt-5' },
];

const MODES = ['cold', 'mcp'];

function grade(task, text) {
  const lower = text.toLowerCase();
  let grounding = 0;
  let correctness = 0;
  let completeness = 0;
  let noHallucination = 1;

  if (task.mustCite) {
    const hit = task.mustCite.some((c) => lower.includes(c.toLowerCase()));
    grounding = hit ? 1 : 0;
  } else {
    grounding = lower.includes('docs.nerochain.io') ? 1 : 0;
  }

  if (task.forbidden) {
    for (const f of task.forbidden) {
      if (lower.includes(f.toLowerCase())) noHallucination = 0;
    }
  }

  const mustMention = task.mustMention ?? [];
  const mentions = mustMention.filter((m) => lower.includes(m.toLowerCase())).length;
  completeness = mustMention.length
    ? Math.round(mentions / mustMention.length)
    : 1;
  correctness = mustMention.length
    ? Math.min(2, Math.round((mentions / mustMention.length) * 2))
    : 1;

  if (noHallucination === 0) {
    return { score: 0, grounding, correctness, completeness, noHallucination, reason: 'contains forbidden term' };
  }
  return {
    score: grounding + correctness + completeness + noHallucination,
    grounding,
    correctness,
    completeness,
    noHallucination,
    reason: '',
  };
}

async function runAnthropic({ model, prompt, mcpConfig }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const params = {
    model,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  };
  if (mcpConfig) params.mcp_servers = [mcpConfig];
  const res = await client.messages.create(params);
  return res.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

async function runOpenAI({ model, prompt }) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.responses.create({
    model,
    input: prompt,
    max_output_tokens: 1500,
  });
  return res.output_text ?? '';
}

async function runOne(target, mode, task) {
  const mcpConfig =
    mode === 'mcp'
      ? {
          type: 'url',
          name: 'nero-docs',
          url: process.env.DOCS_MCP_ORIGIN ?? 'https://docs-mcp.nerochain.io',
        }
      : undefined;
  const prompt = `You are a helpful coding assistant. Ground answers in https://docs.nerochain.io.\n\nUser: ${task.prompt}`;
  try {
    const text =
      target.provider === 'anthropic'
        ? await runAnthropic({ model: target.model, prompt, mcpConfig })
        : await runOpenAI({ model: target.model, prompt });
    return { text, error: null };
  } catch (err) {
    return { text: '', error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const raw = await fs.readFile(TASKS_PATH, 'utf8');
  const spec = yaml.load(raw);
  const tasks = spec.tasks ?? [];

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error(
      '⚠️  ANTHROPIC_API_KEY and OPENAI_API_KEY are both unset. Set at least one before running.',
    );
    process.exit(2);
  }

  const runs = [];
  for (const target of TARGETS) {
    if (target.provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) continue;
    if (target.provider === 'openai' && !process.env.OPENAI_API_KEY) continue;
    for (const mode of MODES) {
      if (mode === 'mcp' && target.provider !== 'anthropic') continue;
      for (const task of tasks) {
        process.stdout.write(`  ▶ ${target.id} · ${mode} · ${task.id}… `);
        const { text, error } = await runOne(target, mode, task);
        if (error) {
          console.log(`error: ${error}`);
          runs.push({ target: target.id, mode, task: task.id, error });
          continue;
        }
        const g = grade(task, text);
        console.log(`${g.score}/5`);
        runs.push({
          target: target.id,
          mode,
          task: task.id,
          score: g.score,
          grounding: g.grounding,
          correctness: g.correctness,
          completeness: g.completeness,
          noHallucination: g.noHallucination,
          output: text,
        });
      }
    }
  }

  const byPair = new Map();
  for (const r of runs) {
    if (r.score == null) continue;
    const key = `${r.target}:${r.mode}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key).push(r.score);
  }
  const summary = [...byPair.entries()].map(([key, scores]) => ({
    key,
    mean: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
    n: scores.length,
  }));

  const report = {
    timestamp: new Date().toISOString(),
    targets: TARGETS.map((t) => t.id),
    modes: MODES,
    summary,
    runs,
  };
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(REPORT_DIR, 'agent-tasks-latest.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  console.log('\n📊 mean scores');
  for (const s of summary) console.log(`  ${s.key} → ${s.mean} (n=${s.n})`);
  console.log('📝 reports/agent-tasks-latest.json');
}

main().catch((err) => {
  console.error('❌ run-agent-tasks crashed:', err);
  process.exit(2);
});
