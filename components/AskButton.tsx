import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'nextra/hooks';
import {
  ClaudeIcon,
  CopyIcon,
  CursorIcon,
  MarkdownIcon,
  MCPIcon,
  OpenAIIcon,
  VSCodeIcon,
} from './BrandIcons';

const ORIGIN = 'https://docs.nerochain.io';
const MCP_URL = 'https://docs-mcp.nerochain.io';
const MCP_NAME = 'nero-docs';

type Locale = 'en' | 'ja';

const I18N: Record<Locale, Record<string, string>> = {
  en: {
    ask: 'Ask',
    copyPage: 'Copy page',
    copyPageHint: 'Copy page as Markdown for LLMs',
    viewMarkdown: 'View as Markdown',
    viewMarkdownHint: 'View this page as plain text',
    openChatGPT: 'Open in ChatGPT',
    openChatGPTHint: 'Ask ChatGPT about this page',
    openClaude: 'Open in Claude',
    openClaudeHint: 'Ask Claude about this page',
    connectMcp: 'Connect with MCP',
    connectMcpHint: 'Copy MCP config for any compatible client',
    connectVSCode: 'Connect to VS Code',
    connectVSCodeHint: 'Install this MCP in VS Code',
    connectCursor: 'Connect to Cursor',
    connectCursorHint: 'Copy the Cursor MCP config',
    connectClaudeCode: 'Connect to Claude Code',
    connectClaudeCodeHint: 'Copy the Claude Code CLI command',
    connectCodex: 'Connect to Codex',
    connectCodexHint: 'Copy the Codex CLI command',
    copied: 'Copied',
  },
  ja: {
    ask: 'AI に聞く',
    copyPage: 'ページをコピー',
    copyPageHint: 'LLM 用に Markdown としてコピー',
    viewMarkdown: 'Markdown で表示',
    viewMarkdownHint: 'プレーンテキストで表示',
    openChatGPT: 'ChatGPT で開く',
    openChatGPTHint: 'ChatGPT にこのページについて質問',
    openClaude: 'Claude で開く',
    openClaudeHint: 'Claude にこのページについて質問',
    connectMcp: 'MCP で接続',
    connectMcpHint: '互換クライアント向けの MCP 設定をコピー',
    connectVSCode: 'VS Code に接続',
    connectVSCodeHint: 'VS Code にこの MCP をインストール',
    connectCursor: 'Cursor に接続',
    connectCursorHint: 'Cursor の MCP 設定をコピー',
    connectClaudeCode: 'Claude Code に接続',
    connectClaudeCodeHint: 'Claude Code CLI コマンドをコピー',
    connectCodex: 'Codex に接続',
    connectCodexHint: 'Codex CLI コマンドをコピー',
    copied: 'コピーしました',
  },
};

const Sparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.39 6.11L20.5 10.5l-6.11 2.39L12 19l-2.39-6.11L3.5 10.5l6.11-2.39L12 2z" />
  </svg>
);

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ExternalArrow = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ opacity: 0.6, flexShrink: 0 }}
  >
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  hint: string;
  external?: boolean;
  onClick?: () => void;
  href?: string;
  copiedState?: boolean;
};

function MenuItem({ icon, label, hint, external, onClick, href, copiedState }: MenuItemProps) {
  const content = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4rem 1fr auto',
        alignItems: 'start',
        gap: '0.7rem',
        padding: '0.55rem 0.75rem',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.1s',
        color: 'inherit',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          'var(--nab-hover, rgba(127,127,127,0.1))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.4rem',
          height: '1.15rem',
          opacity: 0.9,
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {copiedState ? label : label}
          {external ? <ExternalArrow /> : null}
        </div>
        <div
          style={{
            fontSize: '0.76rem',
            opacity: 0.62,
            marginTop: '0.12rem',
            lineHeight: 1.3,
          }}
        >
          {hint}
        </div>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        display: 'block',
        width: '100%',
      }}
    >
      {content}
    </button>
  );
}

function Divider() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 1,
        background: 'rgba(127,127,127,0.2)',
        margin: '0.25rem 0.5rem',
      }}
    />
  );
}

export default function AskButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const locale: Locale =
    router.locale === 'ja' || router.asPath?.startsWith('/ja') ? 'ja' : 'en';
  const t = I18N[locale];

  const { canonicalUrl, mdUrl } = useMemo(() => {
    const rawPath = (router.asPath ?? '/').split('?')[0].split('#')[0];
    const path = rawPath.replace(/\/$/, '') || `/${locale}`;
    return {
      canonicalUrl: `${ORIGIN}${path}`,
      mdUrl: `${ORIGIN}${path}.md`,
    };
  }, [router.asPath, locale]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const flashCopied = (key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(key);
    } catch {
      // Silently ignore — older browsers without the Clipboard API
    }
  };

  const copyPageMarkdown = async () => {
    try {
      const res = await fetch(mdUrl, { headers: { Accept: 'text/markdown, text/plain' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await copyText('copyPage', text);
    } catch {
      await copyText('copyPage', mdUrl);
    }
  };

  const openChatGPT = () => {
    const prompt =
      locale === 'ja'
        ? `${mdUrl} を読んで、このページについて日本語で手伝ってください。`
        : `Please read ${mdUrl} and help me with this page.`;
    const q = encodeURIComponent(prompt);
    window.open(`https://chatgpt.com/?q=${q}`, '_blank', 'noopener,noreferrer');
  };

  const openClaude = () => {
    const prompt =
      locale === 'ja'
        ? `${mdUrl} を読んで、このページについて日本語で手伝ってください。`
        : `Please read ${mdUrl} and help me with this page.`;
    const q = encodeURIComponent(prompt);
    window.open(`https://claude.ai/new?q=${q}`, '_blank', 'noopener,noreferrer');
  };

  const connectMcpGeneric = () =>
    copyText(
      'connectMcp',
      JSON.stringify(
        { mcpServers: { [MCP_NAME]: { type: 'http', url: MCP_URL } } },
        null,
        2,
      ),
    );

  const connectVSCode = () => {
    const payload = encodeURIComponent(
      JSON.stringify({ name: MCP_NAME, type: 'http', url: MCP_URL }),
    );
    window.open(`vscode:mcp/install?${payload}`, '_self');
    void copyText(
      'connectVSCode',
      JSON.stringify(
        { servers: { [MCP_NAME]: { type: 'http', url: MCP_URL } } },
        null,
        2,
      ),
    );
  };

  const connectCursor = () =>
    copyText(
      'connectCursor',
      JSON.stringify(
        { mcpServers: { [MCP_NAME]: { transport: 'http', url: MCP_URL } } },
        null,
        2,
      ),
    );

  const connectClaudeCode = () =>
    copyText(
      'connectClaudeCode',
      `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`,
    );

  const connectCodex = () =>
    copyText(
      'connectCodex',
      `codex mcp add ${MCP_NAME} --transport http --url ${MCP_URL}`,
    );

  const copyIcon = <CopyIcon />;
  const mdIcon = <MarkdownIcon />;
  const chatGPTIcon = <OpenAIIcon />;
  const claudeIcon = <ClaudeIcon />;
  const linkIcon = <MCPIcon />;
  const vscodeIcon = <VSCodeIcon />;
  const cursorIcon = <CursorIcon />;
  const claudeCodeIcon = <ClaudeIcon />;
  const codexIcon = <OpenAIIcon />;

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'flex-end',
        margin: '0 0 1rem',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.8rem',
          borderRadius: 7,
          border: '1px solid rgba(127,127,127,0.3)',
          background: 'rgba(127,127,127,0.08)',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '0.88rem',
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        <Sparkle />
        <span>{t.ask}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 310,
            maxWidth: 'calc(100vw - 2rem)',
            borderRadius: 10,
            border: '1px solid rgba(127,127,127,0.28)',
            background: 'var(--nextra-primary-hue, #fff)',
            backgroundColor:
              'light-dark(#ffffff, #121212)' as unknown as string,
            boxShadow: '0 14px 38px rgba(0,0,0,0.18)',
            zIndex: 50,
            padding: '0.35rem',
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon={copyIcon}
            label={copied === 'copyPage' ? t.copied : t.copyPage}
            hint={t.copyPageHint}
            copiedState={copied === 'copyPage'}
            onClick={copyPageMarkdown}
          />
          <MenuItem
            icon={mdIcon}
            label={t.viewMarkdown}
            hint={t.viewMarkdownHint}
            href={mdUrl}
            external
          />
          <Divider />
          <MenuItem
            icon={chatGPTIcon}
            label={t.openChatGPT}
            hint={t.openChatGPTHint}
            onClick={openChatGPT}
            external
          />
          <MenuItem
            icon={claudeIcon}
            label={t.openClaude}
            hint={t.openClaudeHint}
            onClick={openClaude}
            external
          />
          <Divider />
          <MenuItem
            icon={linkIcon}
            label={copied === 'connectMcp' ? t.copied : t.connectMcp}
            hint={t.connectMcpHint}
            copiedState={copied === 'connectMcp'}
            onClick={connectMcpGeneric}
          />
          <MenuItem
            icon={vscodeIcon}
            label={copied === 'connectVSCode' ? t.copied : t.connectVSCode}
            hint={t.connectVSCodeHint}
            copiedState={copied === 'connectVSCode'}
            onClick={connectVSCode}
            external
          />
          <MenuItem
            icon={cursorIcon}
            label={copied === 'connectCursor' ? t.copied : t.connectCursor}
            hint={t.connectCursorHint}
            copiedState={copied === 'connectCursor'}
            onClick={connectCursor}
          />
          <MenuItem
            icon={claudeCodeIcon}
            label={copied === 'connectClaudeCode' ? t.copied : t.connectClaudeCode}
            hint={t.connectClaudeCodeHint}
            copiedState={copied === 'connectClaudeCode'}
            onClick={connectClaudeCode}
          />
          <MenuItem
            icon={codexIcon}
            label={copied === 'connectCodex' ? t.copied : t.connectCodex}
            hint={t.connectCodexHint}
            copiedState={copied === 'connectCodex'}
            onClick={connectCodex}
          />
        </div>
      )}
    </div>
  );
}
