---
name: hui
description: >
  Convert Markdown to PNG, PDF, or HTML with the Hui (徽) CLI and multi-theme
  export (github-light/dark, notion, academic, terminal, minimal, solarized,
  newspaper). Use when the user wants md→image/PDF, themed screenshots of docs,
  batch Markdown conversion, md2png-style export, or mentions hui / 徽.
  Prefer invoking the `hui` binary; do not re-implement themes or Chromium.
---

# Hui (徽) — Markdown → PNG / PDF / HTML

This skill teaches any coding agent (Claude Code, Cursor, Codex, Copilot,
Windsurf, Continue, Grok, …) how to drive the **Hui** CLI for users.

Authoritative CLI help on the machine wins if it differs from this file:

```bash
hui --help
hui convert --help
hui themes
hui themes --json
```

## What users install

Two pieces (skill + CLI):

```bash
# 1) Skill — install for all supported agents (global)
npx skills add helson-lin/hui -g -y

# Project-only (current repo’s .agents/skills):
npx skills add helson-lin/hui -y

# List skill without installing:
npx skills add helson-lin/hui -l

# 2) CLI binary
brew tap helson-lin/tap && brew install helson-lin/tap/hui
# or from source:
# git clone https://github.com/helson-lin/hui && cd hui && npm i && npm run build && npm link
```

**PromptScript:** does not support **global** skill install. If install prints  
`PromptScript does not support global skill installation`, that is expected with `-g`.  
Use project install (`-y` without `-g`) inside a PromptScript project, or ignore if unused.

Canonical install path: `~/.agents/skills/hui` (other agents symlink or mirror from there).

PNG/PDF also need **Google Chrome** or **Chromium** on the machine.

```bash
export HUI_CHROME_PATH="/path/to/chrome-or-chromium"   # optional override
```

Docs: https://github.com/helson-lin/hui · 中文: README_ZH.md

## Hard rules

1. **Shell out to `hui`** — do not rewrite Markdown rendering, CSS themes, or headless Chrome.
2. **PNG/PDF require Chrome/Chromium** via `puppeteer-core`. HTML does not.
3. **Do not** download Playwright browsers for this tool.
4. Default theme: `github-light`. Change `-t` only when the user asks or the task implies a style.
5. Batch: `hui convert <dir>`; add `-r` only when recursion is needed. For batch, `-o` is always a **directory**.
6. Report **real absolute output paths**. Never claim success if exit code ≠ 0 or the file is missing.
7. macOS `zsh: killed` after brew: re-sign (see Troubleshooting). Do not invent other first-line fixes.

## Resolve `hui`

```bash
# Preferred: on PATH (Homebrew / npm link)
hui --version

# Inside a clone of this repo (development)
npm run build
npm run hui -- --version
# If tsx entry is silent, use built dist:
node --input-type=module -e "import { runCli } from './dist/cli.js'; await runCli(['node','hui','--version'])"
```

## Workflows

### Single file

```bash
# HTML only (no browser)
hui convert note.md
hui convert note.md -f html -o out/note.html

# PNG / PDF / multi
hui convert note.md -t notion -f png -o out/note.png
hui convert note.md -t academic -f pdf -p A4 -o out/note.pdf
hui convert note.md -t terminal -f html,png,pdf -o dist/note

# Shortcut: omit convert
hui note.md -t solarized -f png -o out/shot.png
```

| Flag | Meaning | Default |
|------|---------|---------|
| `-t, --theme` | Theme id | `github-light` |
| `-f, --format` | `html,png,pdf` (comma) | from `-o` ext, else `html` |
| `-o, --output` | File/base (single) or dir (batch) | beside input |
| `-p, --page` | `A4` \| `Letter` | `A4` |
| `--width` | PNG content width px | `794` |
| `--scale` | PNG device pixel ratio | `2` |
| `--title` | HTML title (single file) | input basename |
| `-r` | Recurse directories | off |
| `--fail-fast` | Stop batch on first error | off |

### Batch directory

```bash
hui convert ./notes
hui convert ./notes -r -t notion -f png -o ./out
hui convert ./docs -r -f html,pdf -t academic -o ./dist
hui convert ./notes -r -f png -o ./out --fail-fast
```

- Mirrors relative paths: `notes/a/b.md` → `out/a/b.png`
- Skips `node_modules`, `.git`, `dist`, … when recursive
- One shared Chromium session per batch for png/pdf
- Exit `1` if any file failed

### Themes

```bash
hui themes
hui themes --json
```

| id | Style |
|----|--------|
| `github-light` | Classic docs (default) |
| `github-dark` | Dark code |
| `notion` | Soft notes |
| `academic` | Paper layout |
| `terminal` | Green-on-black |
| `minimal` | Sparse whitespace |
| `solarized` | Eye-friendly |
| `newspaper` | Editorial |

Aliases: `light` → `github-light`, `dark` → `github-dark`, `paper` → `newspaper`.

## Library (optional)

Same npm package for app integration:

```ts
import { convertToFormats, convertMany, buildHtmlDocument, listThemes } from 'hui'
```

Prefer the **CLI** for agent one-shots; use the library only when embedding in Node code.

## Troubleshooting

**`hui: command not found`**  
Install CLI (brew / build + `npm link`), then retry `hui --version`.

**`未找到 Chrome/Chromium`**  
Install Chrome/Chromium or set `HUI_CHROME_PATH` to the executable.

**macOS `zsh: killed`**

```bash
xattr -cr "$(brew --prefix)/bin/hui"
codesign --force --sign - --timestamp=none \
  --identifier com.helsonlin.hui "$(brew --prefix)/bin/hui"
hui --version
```

## Agent checklist

1. Ensure skill intent matches: user wants Markdown → HTML/PNG/PDF or themed export.
2. Resolve `hui` on PATH (or guide install).
3. Confirm input path exists.
4. Choose format(s); require Chrome for png/pdf.
5. Choose theme only if relevant; else default.
6. Set `-o` correctly (file vs batch directory).
7. After run: report paths, sizes, exit status; surface CLI errors verbatim.

## Anti-patterns

- Hand-rolling HTML/CSS themes instead of `-t`
- Installing Playwright browsers “for Hui”
- Treating batch `-o` as a single file path
- Claiming success when the output file does not exist
- Using `sudo` for brew/codesign unless the user requires it
