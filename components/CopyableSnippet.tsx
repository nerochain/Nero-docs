import React, { useState } from 'react';

type Props = {
  label?: string;
  language?: string;
  children: string;
};

export default function CopyableSnippet({ label, language = 'bash', children }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        margin: '0.75rem 0 1.25rem',
      }}
    >
      {label ? (
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '0.35rem',
            opacity: 0.75,
          }}
        >
          {label}
        </div>
      ) : null}
      <pre
        style={{
          margin: 0,
          padding: '0.9rem 3.2rem 0.9rem 1rem',
          borderRadius: 8,
          overflowX: 'auto',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.88rem',
          lineHeight: 1.55,
          background: 'rgba(127,127,127,0.08)',
          border: '1px solid rgba(127,127,127,0.25)',
        }}
      >
        <code className={`language-${language}`}>{children}</code>
      </pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        style={{
          position: 'absolute',
          top: label ? '2rem' : '0.6rem',
          right: '0.6rem',
          padding: '0.3rem 0.55rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: 6,
          border: '1px solid rgba(127,127,127,0.35)',
          background: copied ? '#2ecc71' : 'rgba(255,255,255,0.75)',
          color: copied ? '#fff' : 'inherit',
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
