import React from 'react';

type IconProps = { size?: number };

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
});

// --- Generic utilities ---

export const CopyIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// Markdown logo — CommonMark / daringfireball "M↓" lockup.
export const MarkdownIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M22.27 19.385H1.73A1.73 1.73 0 0 1 0 17.655V6.345A1.73 1.73 0 0 1 1.73 4.615h20.54A1.73 1.73 0 0 1 24 6.345v11.31a1.73 1.73 0 0 1-1.73 1.73zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.884L5.769 8.077H3.462v7.846zM21.232 12h-2.308V8.077h-2.308V12h-2.307l3.461 4.039z" />
  </svg>
);

// --- Brand marks (SVG paths adapted from simple-icons.org, CC0-1.0) ---

// OpenAI (for ChatGPT + Codex)
export const OpenAIIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.998-2.9 6.056 6.056 0 0 0-.748-7.073zm-9.022 12.608a4.476 4.476 0 0 1-2.876-1.04l.142-.08 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.495 4.493zm-9.66-4.125a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.758a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.499 4.499 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.814 3.354-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.596 3.856L13.104 8.364 15.12 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.104v-5.677a.79.79 0 0 0-.407-.667zm2.011-3.023l-.142-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.41 9.23V6.897a.066.066 0 0 1 .028-.062l4.83-2.787a4.499 4.499 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.039-.057V6.074A4.499 4.499 0 0 1 13.605 2.62l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.098-2.366l2.602-1.5 2.607 1.5v2.999l-2.598 1.5-2.607-1.5z" />
  </svg>
);

// Anthropic / Claude (for Open in Claude + Connect to Claude Code)
export const ClaudeIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M17.3041 3.541H13.7843l6.4182 16.918H23.7226Zm-10.6082 0L.0774 20.459H3.6532l1.3143-3.5638h6.7363l1.3144 3.5638h3.5758L9.7856 3.541Zm-.6363 10.3575 2.2521-6.1064 2.252 6.1064Z" />
  </svg>
);

// Visual Studio Code
export const VSCodeIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448z" />
  </svg>
);

// Cursor (tetrahedron)
export const CursorIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M11.925 24 22.35 18l-10.425-6L1.5 18Zm10.425-6V6L11.925 0v12Zm-10.425-6L1.5 6v12l10.425-6Z" />
  </svg>
);

// Model Context Protocol — stylized "dual chain" glyph.
export const MCPIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3.5A4.5 4.5 0 0 1 17.5 8V12" />
    <path d="M11 20.5A4.5 4.5 0 0 1 6.5 16V12" />
    <path d="M17.5 7.5c1.66 0 3 1.34 3 3v3c0 1.66-1.34 3-3 3" />
    <path d="M6.5 16.5c-1.66 0-3-1.34-3-3v-3c0-1.66 1.34-3 3-3" />
    <circle cx="9" cy="7" r="1" />
    <circle cx="15" cy="17" r="1" />
  </svg>
);
