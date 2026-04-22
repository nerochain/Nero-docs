# Agent task rubric

Each task is graded 0–5 on four axes. The final score is the sum (max 5, not 4+4+4+4 — see weights).

| Axis | Weight | What earns it |
|---|---|---|
| **Grounding** | 1 pt | Response cites at least one `docs.nerochain.io` URL (or the MCP path reveals it did). |
| **Correctness** | 2 pts | Factual + runnable. Spot-checked against the source MDX on first run; judge-model verified thereafter. |
| **Completeness** | 1 pt | Covers every edge case or caveat called out in the source page (e.g., "approve the Paymaster contract" for Type 1/2). |
| **No hallucination** | 1 pt, **auto-fail** | Zero invented addresses, method names, or fields. Any violation forces the whole task to 0. |

Total possible per task: **5 pts**.

## Targets

- Average ≥ **4.0 / 5.0** across all tasks × all agents.
- **Zero hallucinations** on critical tasks: `entrypoint-address`, `supported-tokens`, `gasless-tx`.
- **MCP uplift ≥ 1 pt average** over cold mode. If MCP doesn't move the needle, the MCP design needs rework.

## Operator notes

- When a task has `mustCite`, any `docs.nerochain.io` URL whose path matches the listed prefix satisfies it.
- `mustMention` items are case-insensitive substring checks.
- `forbidden` items force a hard fail (auto-0 on that task).
- Judge model: Claude Sonnet 4.6 at temperature 0. Sonnet judges other model outputs; for Sonnet's own outputs, use Opus 4.7 as judge.
