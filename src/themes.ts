export type ThemeId =
  | 'github-light'
  | 'github-dark'
  | 'notion'
  | 'academic'
  | 'terminal'
  | 'minimal'
  | 'solarized'
  | 'newspaper'

export interface ThemeMeta {
  id: ThemeId
  name: string
  description: string
  previewBg: string
  previewFg: string
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'github-light',
    name: 'GitHub Light',
    description: '经典文档风',
    previewBg: '#ffffff',
    previewFg: '#1f2328',
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    description: '暗色代码风',
    previewBg: '#0d1117',
    previewFg: '#e6edf3',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: '笔记柔和风',
    previewBg: '#ffffff',
    previewFg: '#37352f',
  },
  {
    id: 'academic',
    name: 'Academic',
    description: '论文排版',
    previewBg: '#fbf9f4',
    previewFg: '#1a1a1a',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: '终端绿字',
    previewBg: '#0b0f0c',
    previewFg: '#33ff66',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: '极简留白',
    previewBg: '#fafafa',
    previewFg: '#111111',
  },
  {
    id: 'solarized',
    name: 'Solarized',
    description: '护眼配色',
    previewBg: '#fdf6e3',
    previewFg: '#657b83',
  },
  {
    id: 'newspaper',
    name: 'Newspaper',
    description: '编辑部风格',
    previewBg: '#fffcf7',
    previewFg: '#1c1917',
  },
]

const SHARED = `
.md-body {
  font-size: 16px;
  line-height: 1.7;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.md-body > *:first-child { margin-top: 0; }
.md-body > *:last-child { margin-bottom: 0; }
.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6 {
  line-height: 1.25;
  font-weight: 650;
  margin: 1.4em 0 0.55em;
}
.md-body h1 { font-size: 2em; }
.md-body h2 { font-size: 1.5em; }
.md-body h3 { font-size: 1.25em; }
.md-body h4 { font-size: 1.05em; }
.md-body p, .md-body ul, .md-body ol, .md-body blockquote, .md-body table, .md-body pre {
  margin: 0 0 1em;
}
.md-body ul, .md-body ol { padding-left: 1.5em; }
.md-body li + li { margin-top: 0.25em; }
.md-body li > p { margin: 0.35em 0; }
.md-body a { text-decoration: underline; text-underline-offset: 2px; }
.md-body hr {
  border: 0;
  height: 1px;
  margin: 1.5em 0;
}
.md-body table {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
}
.md-body th, .md-body td {
  border: 1px solid;
  padding: 0.45em 0.7em;
  text-align: left;
}
.md-body th { font-weight: 650; }
.md-body pre {
  padding: 1em 1.1em;
  overflow-x: auto;
  border-radius: 8px;
  font-size: 0.9em;
  line-height: 1.55;
}
.md-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}
.md-body :not(pre) > code {
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
.md-body blockquote {
  margin-left: 0;
  padding: 0.15em 0 0.15em 1em;
  border-left: 4px solid;
}
.md-body img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
.md-body input[type="checkbox"] {
  margin-right: 0.45em;
  vertical-align: middle;
}
`

const THEME_CSS: Record<ThemeId, string> = {
  'github-light': `
.md-body {
  color: #1f2328;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
}
.md-body h1, .md-body h2 { border-bottom: 1px solid #d1d9e0; padding-bottom: 0.3em; }
.md-body a { color: #0969da; }
.md-body hr { background: #d1d9e0; }
.md-body th, .md-body td { border-color: #d1d9e0; }
.md-body th { background: #f6f8fa; }
.md-body blockquote { border-color: #d1d9e0; color: #59636e; }
.md-body pre { background: #f6f8fa; }
.md-body :not(pre) > code { background: rgba(175,184,193,0.2); }
`,
  'github-dark': `
.md-body {
  color: #e6edf3;
  background: #0d1117;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
}
.md-body h1, .md-body h2 { border-bottom: 1px solid #3d444d; padding-bottom: 0.3em; }
.md-body a { color: #4493f8; }
.md-body hr { background: #3d444d; }
.md-body th, .md-body td { border-color: #3d444d; }
.md-body th { background: #161b22; }
.md-body blockquote { border-color: #3d444d; color: #9198a1; }
.md-body pre { background: #161b22; }
.md-body :not(pre) > code { background: rgba(110,118,129,0.4); }
`,
  notion: `
.md-body {
  color: #37352f;
  background: #ffffff;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.65;
}
.md-body h1 { font-size: 1.875em; border: 0; }
.md-body h2 { font-size: 1.5em; border: 0; }
.md-body h3 { font-size: 1.25em; }
.md-body a { color: #0b6e99; text-decoration: none; border-bottom: 1px solid rgba(11,110,153,0.35); }
.md-body hr { background: rgba(55,53,47,0.16); }
.md-body th, .md-body td { border-color: rgba(55,53,47,0.16); }
.md-body th { background: rgba(55,53,47,0.04); }
.md-body blockquote {
  border-color: rgba(55,53,47,0.2);
  color: rgba(55,53,47,0.75);
  background: rgba(55,53,47,0.03);
  border-radius: 0 6px 6px 0;
  padding: 0.4em 0.9em;
}
.md-body pre { background: #f7f6f3; border-radius: 6px; }
.md-body :not(pre) > code { background: rgba(135,131,120,0.15); color: #eb5757; }
`,
  academic: `
.md-body {
  color: #1a1a1a;
  background: #fbf9f4;
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Noto Serif SC", serif;
  font-size: 17px;
  line-height: 1.8;
  max-width: 42em;
}
.md-body h1, .md-body h2, .md-body h3 {
  font-family: "Iowan Old Style", Palatino, Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.md-body h1 {
  font-size: 2.1em;
  text-align: center;
  border-bottom: 0;
  margin-bottom: 0.8em;
}
.md-body h2 {
  font-size: 1.35em;
  border-bottom: 1px solid #cfc8b8;
  padding-bottom: 0.2em;
}
.md-body a { color: #6b3f1d; }
.md-body hr { background: #cfc8b8; }
.md-body th, .md-body td { border-color: #cfc8b8; }
.md-body th { background: #f0ebe0; }
.md-body blockquote {
  border-color: #a89070;
  color: #4a463e;
  font-style: italic;
}
.md-body pre, .md-body code {
  font-family: "IBM Plex Mono", Menlo, Consolas, monospace;
}
.md-body pre { background: #f0ebe0; border: 1px solid #e0d8c8; }
.md-body :not(pre) > code { background: #efe8d8; }
`,
  terminal: `
.md-body {
  color: #33ff66;
  background: #0b0f0c;
  font-family: "IBM Plex Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 14.5px;
  line-height: 1.65;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4 {
  color: #7CFFA8;
  font-weight: 600;
  border: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.md-body h1 { font-size: 1.5em; }
.md-body h2 { font-size: 1.25em; border-left: 3px solid #33ff66; padding-left: 0.5em; }
.md-body a { color: #8affc1; }
.md-body hr { background: #1f3d28; }
.md-body th, .md-body td { border-color: #1f3d28; }
.md-body th { background: #102016; color: #7CFFA8; }
.md-body blockquote {
  border-color: #33ff66;
  color: #8fd9a8;
  background: #0f1812;
}
.md-body pre {
  background: #050806;
  border: 1px solid #1f3d28;
  box-shadow: inset 0 0 0 1px rgba(51,255,102,0.08);
}
.md-body :not(pre) > code {
  background: #122018;
  color: #a8ffc0;
  border: 1px solid #1f3d28;
}
`,
  minimal: `
.md-body {
  color: #111111;
  background: #fafafa;
  font-family: "Helvetica Neue", Helvetica, Arial, "Noto Sans SC", sans-serif;
  font-size: 16.5px;
  line-height: 1.75;
  letter-spacing: -0.01em;
}
.md-body h1, .md-body h2, .md-body h3 {
  font-weight: 600;
  letter-spacing: -0.03em;
  border: 0;
}
.md-body h1 { font-size: 2.25em; margin-bottom: 0.4em; }
.md-body h2 { font-size: 1.4em; margin-top: 1.8em; }
.md-body a { color: #111; text-decoration-thickness: 1px; }
.md-body hr { background: #e5e5e5; height: 1px; }
.md-body th, .md-body td { border-color: #e5e5e5; }
.md-body th { background: #f0f0f0; font-weight: 600; }
.md-body blockquote {
  border-color: #111;
  color: #555;
  padding-left: 1.2em;
}
.md-body pre {
  background: #f0f0f0;
  border-radius: 0;
  border-left: 3px solid #111;
}
.md-body :not(pre) > code { background: #efefef; }
`,
  solarized: `
.md-body {
  color: #657b83;
  background: #fdf6e3;
  font-family: "Source Sans 3", "Segoe UI", "Noto Sans SC", sans-serif;
  font-size: 16.5px;
}
.md-body h1, .md-body h2, .md-body h3 { color: #073642; border: 0; }
.md-body h1 { font-size: 2em; }
.md-body h2 {
  font-size: 1.4em;
  border-bottom: 2px solid #eee8d5;
  padding-bottom: 0.25em;
}
.md-body a { color: #268bd2; }
.md-body hr { background: #eee8d5; }
.md-body th, .md-body td { border-color: #eee8d5; }
.md-body th { background: #eee8d5; color: #073642; }
.md-body blockquote {
  border-color: #cb4b16;
  color: #586e75;
  background: #eee8d5;
  border-radius: 0 6px 6px 0;
  padding: 0.35em 0.9em;
}
.md-body pre { background: #eee8d5; color: #586e75; }
.md-body :not(pre) > code { background: #eee8d5; color: #d33682; }
`,
  newspaper: `
.md-body {
  color: #1c1917;
  background: #fffcf7;
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Noto Serif SC", serif;
  font-size: 17px;
  line-height: 1.7;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4 {
  font-family: "Iowan Old Style", Palatino, Georgia, "Noto Serif SC", serif;
  color: #1c1917;
  font-weight: 700;
  letter-spacing: -0.02em;
  border: 0;
}
.md-body h1 {
  font-size: 2.35em;
  line-height: 1.12;
  margin: 0 0 0.45em;
  font-weight: 700;
}
.md-body h2 {
  font-size: 1.35em;
  margin-top: 1.6em;
  margin-bottom: 0.5em;
}
.md-body h3 {
  font-size: 1.12em;
  margin-top: 1.35em;
}
.md-body p { margin: 0 0 1em; color: #3f3a36; }
.md-body a { color: #8a5a12; }
.md-body hr { background: #e7e0d6; height: 1px; }
.md-body th, .md-body td {
  border-color: #e7e0d6;
  font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
  font-size: 0.92em;
}
.md-body th {
  background: #f7f2ea;
  color: #1c1917;
  font-weight: 600;
}
.md-body blockquote {
  border-left: 3px solid #c48a3a;
  color: #57534e;
  font-style: italic;
  background: transparent;
  padding: 0.15em 0 0.15em 1em;
  margin: 1.1em 0;
}
.md-body pre {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  background: #f5f0e8;
  border: 1px solid #e7e0d6;
  border-radius: 8px;
  color: #44403c;
}
.md-body :not(pre) > code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  background: #f5f0e8;
  color: #9a3412;
}
`,
}

export function getThemeCss(id: ThemeId): string {
  return `${SHARED}\n${THEME_CSS[id]}`
}

export function getThemeMeta(id: ThemeId): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function isThemeId(v: string): v is ThemeId {
  return THEMES.some((t) => t.id === v)
}

export function parseThemeId(v: string): ThemeId {
  const id = v.trim().toLowerCase()
  if (isThemeId(id)) return id
  const aliases: Record<string, ThemeId> = {
    light: 'github-light',
    dark: 'github-dark',
    gh: 'github-light',
    'gh-light': 'github-light',
    'gh-dark': 'github-dark',
    paper: 'newspaper',
  }
  if (aliases[id]) return aliases[id]
  const available = THEMES.map((t) => t.id).join(', ')
  throw new Error(`Unknown theme: ${v}\nAvailable: ${available}`)
}

export function listThemes(): ThemeMeta[] {
  return THEMES
}
