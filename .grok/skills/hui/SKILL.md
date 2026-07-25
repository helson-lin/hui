---
name: hui
description: >
  Use the Hui (徽) CLI to convert Markdown to PNG, PDF, or HTML with multi-theme
  support. Trigger when the user mentions hui, 徽, md2png, Markdown to PNG/PDF/HTML,
  theme export (github-light/dark, notion, academic, terminal, minimal, solarized,
  newspaper), batch md convert, or wants CLI/scripted screenshot-style docs.
  Prefer the `hui` binary or repo-local `npm run hui --`. Use when the user runs /hui.
---

# Hui (徽) CLI — agent skill

Operational map for converting Markdown → **PNG / PDF / HTML** with shared themes.
CLI help on the machine is authoritative if it disagrees with this skill:

```bash
hui --help
hui convert --help
hui themes
hui themes --json
```

## Hard rules

1. **Prefer shelling out to `hui`**, not re-implementing Markdown/CSS/Chromium.
2. **PNG/PDF need system Chrome or Chromium** via `puppeteer-core`. HTML does not.
3. Do **not** download Playwright browsers. If Chrome is missing, set `HUI_CHROME_PATH` or tell the user to install Chrome/Chromium.
4. Default theme is `github-light`. Only change `-t` when the user asks or the task implies a style.
5. For batch directories, use `hui convert <dir>`; add `-r` only when recursion is needed.
6. Report **real output paths** after success. Do not claim PNG/PDF succeeded without a written file.
7. On macOS `zsh: killed` after brew install: re-sign (see Install). Do not invent other fixes first.

## Resolve the binary

Try in order:

```bash
# 1) Installed (Homebrew / PATH)
hui --version

# 2) Inside this repo (preferred for development)
cd /path/to/hui
npm run hui -- --version
# after build:
node --input-type=module -e "import { runCli } from './dist/cli.js'; await runCli(process.argv)" -- --version

# 3) Global npm link
npm link   # from repo root after npm run build
```

If `npm run hui` (tsx) produces no output, use **built** `dist/` via Node ESM as above, or `npm run build` then `npm link`.

Optional browser pin:

```bash
export HUI_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# Linux example:
export HUI_CHROME_PATH="/usr/bin/chromium"
# or puppeteer cache chrome if present
```

## Standard workflows

### Single file → HTML (no browser)

```bash
hui convert note.md
hui convert note.md -f html -o out/note.html
hui note.md -f html -o out/note.html   # shortcut: omit convert
```

### Single file → PNG / PDF

```bash
hui convert note.md -t notion -f png -o out/note.png
hui convert note.md -t academic -f pdf -p A4 -o out/note.pdf
hui convert note.md -t terminal -f html,png,pdf -o dist/note
```

PNG knobs:

| Flag | Meaning | Default |
|------|---------|---------|
| `--width <px>` | Content width | `794` |
| `--scale <n>` | Device pixel ratio | `2` |
| `-p A4\|Letter` | Page size (PDF layout) | `A4` |
| `--title <title>` | HTML title (single file) | input basename |

### Batch directory

```bash
# All *.md / *.markdown in one level → HTML beside each file
hui convert ./notes

# Recurse; mirror relative paths under out/
hui convert ./notes -r -t notion -f png -o ./out

# Multi-format batch
hui convert ./docs -r -f html,pdf -t academic -o ./dist

# Stop on first error (default continues)
hui convert ./notes -r -f png -o ./out --fail-fast
```

Batch rules:

- `-o` is **always a directory** for batch.
- Skips `node_modules`, `.git`, `dist`, etc. when recursive.
- PNG/PDF share one Chromium session per batch.
- Exit code `1` if any file failed.

### List themes

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

Previews (if present in repo): `docs/themes/<id>.png`.

### Theme preview regen (docs)

```bash
# English previews (README.md)
hui convert examples/sample.en.md -t notion -f png -o docs/themes/en/notion.png --width 720 --scale 2
# Chinese previews (README_ZH.md)
hui convert examples/sample.md -t notion -f png -o docs/themes/notion.png --width 720 --scale 2
```

## Library API (same package)

When embedding in Node code is better than a one-off CLI:

```ts
import {
  convertToFormats,
  convertMany,
  buildHtmlDocument,
  listThemes,
  findMarkdownFiles,
  mapBatchOutputBase,
} from 'hui'
```

- `buildHtmlDocument` → HTML string only (no browser).
- `convertToFormats` → write html/png/pdf; launches headless Chrome for png/pdf.
- `convertMany` → batch with **shared** browser.

Prefer CLI for agent one-shots; use library only when integrating into an existing Node app.

## Install (when `hui` is missing)

**macOS Homebrew:**

```bash
brew tap helson-lin/tap
git -C "$(brew --repo helson-lin/tap)" fetch origin
git -C "$(brew --repo helson-lin/tap)" reset --hard origin/main
brew reinstall helson-lin/tap/hui
hui --version
```

If `zsh: killed`:

```bash
xattr -cr "$(brew --prefix)/bin/hui"
codesign --force --sign - --timestamp=none \
  --identifier com.helsonlin.hui "$(brew --prefix)/bin/hui"
hui --version
```

**From this repo:**

```bash
npm install
npm run build
npm link   # optional
```

Docs: [README.md](../../../README.md) (EN), [README_ZH.md](../../../README_ZH.md) (中文).

## Agent checklist

Before convert:

1. Resolve `hui` (or repo entry).
2. Confirm input path exists (file or directory).
3. Pick format(s); ensure Chrome for png/pdf.
4. Pick theme if user cares; else default.
5. Choose `-o` (file/base for single; directory for batch).

After convert:

1. Echo absolute output paths and sizes if useful.
2. On failure, surface the CLI error (Chrome missing, path missing, etc.).
3. Do not leave orphaned headless Chrome processes intentionally; the CLI closes the browser after each non-batch/single session.

## Anti-patterns

- Hand-rolling HTML themes instead of `-t`.
- Using Playwright downloaders for this tool.
- Passing a file path as batch `-o` directory semantics incorrectly.
- Claiming success when CLI exit code ≠ 0 or output file missing.
- Running `sudo` for brew or codesign unless the user requires it.
