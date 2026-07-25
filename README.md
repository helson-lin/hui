# Hui (徽) CLI

English | [中文](README_ZH.md)

**Hui** — convert Markdown to **PNG / PDF / HTML** with multi-theme support.

Theme system matches the [md2png](../md2png) web app: GitHub Light/Dark, Notion, Academic, Terminal, Minimal, Solarized, Newspaper.

## Install

### Homebrew (recommended on macOS)

```bash
brew tap helson-lin/tap

# If the tap already exists: sync to remote main (do not untap — that would remove doke/of too)
git -C "$(brew --repo helson-lin/tap)" fetch origin
git -C "$(brew --repo helson-lin/tap)" reset --hard origin/main

brew reinstall helson-lin/tap/hui
hui --version
```

If you see `zsh: killed` (macOS SIGKILLs unsigned / broken-signature arm64 binaries):

```bash
# Option A: sync tap and reinstall (formula ad-hoc codesigns + runs hui --version)
git -C "$(brew --repo helson-lin/tap)" fetch origin
git -C "$(brew --repo helson-lin/tap)" reset --hard origin/main
brew reinstall helson-lin/tap/hui
hui --version

# Option B: re-sign the installed binary
xattr -cr "$(brew --prefix)/bin/hui"
codesign --force --sign - --timestamp=none \
  --identifier com.helsonlin.hui "$(brew --prefix)/bin/hui"
hui --version
```

PNG / PDF require **Google Chrome** or **Chromium** on the machine (`puppeteer-core` drives the system browser; no Playwright browser download).

```bash
# Optional: pin the browser path
export HUI_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

### From source

```bash
cd ~/project/hui
npm install
npm run build
npm link   # optional: register hui on PATH
# PNG/PDF: system Chrome/Chromium required
```

Dev mode (no build):

```bash
npm run hui -- convert examples/sample.md -f html
```

### Release binaries / GitHub Release

On a `v*.*.*` tag, [`.github/workflows/release.yml`](.github/workflows/release.yml) will:

1. Run `bash build.sh`: esbuild bundle + `@yao-pkg/pkg` multi-platform binaries  
2. Upload to GitHub Release: `hui-<tag>-darwin-arm64.tar.gz`, etc.  
3. Update [homebrew-tap](https://github.com/helson-lin/homebrew-tap) `hui.rb` (version / url / sha256, same approach as doke)

```bash
# Local package attempt (all platforms; slow)
bash build.sh v1.0.0
# Artifacts under release/

# Publish
git tag v1.0.0
git push origin v1.0.0
```

**Repo secrets (same as doke)**

| Secret | Purpose |
|--------|---------|
| `TOKEN` | GitHub PAT: write this repo’s Release + push `homebrew-tap` |

On first use, copy `homebrew/hui.rb` into the tap repo root (or let CI seed it when missing).

## Usage

```bash
# HTML (default)
hui convert note.md

# Theme + format
hui convert note.md -t notion -f png
hui convert note.md -t academic -f pdf -p A4
hui convert note.md -t terminal -f html,png,pdf -o dist/note

# Shortcut: omit the convert subcommand
hui note.md -t solarized -f png -o out/shot.png

# ── Batch directory ──
# All .md in the current directory → HTML next to each file by default
hui convert ./notes

# Recurse; export PNG under out/ (relative paths preserved)
hui convert ./notes -r -t notion -f png -o ./out

# Multi-format batch
hui convert ./docs -r -f html,pdf -t academic -o ./dist

# Stop on first error (default: skip failed files and continue)
hui convert ./notes -r -f png -o ./out --fail-fast

# List themes
hui themes
hui themes --json
```

### Batch behavior

| Input | Behavior |
|-------|----------|
| File `a.md` | Single-file convert |
| Dir `notes/` | Scan that level for `*.md` / `*.markdown` |
| Dir + `-r` | Recurse; skips `node_modules`, `.git`, `dist`, etc. |

- **`-o` is always an output directory in batch mode**, with relative path mirroring: `notes/a/b.md` → `out/a/b.png`
- Without `-o`, outputs sit next to each source file
- PNG/PDF batch jobs share one Chromium session (faster than one launch per file)
- Exit code `1` if any file failed; by default remaining files still run

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output` | Output path (file/base for single; directory for batch) | Same dir/name as input |
| `-f, --format` | `html` / `png` / `pdf`, comma-separated | From `-o` extension for single file, else `html` |
| `-t, --theme` | Theme id | `github-light` |
| `-p, --page` | `A4` or `Letter` | `A4` |
| `--title` | HTML document title (single file only) | Input filename |
| `--width` | PNG content width (px) | `794` |
| `--scale` | PNG device pixel ratio | `2` |
| `-r, --recursive` | Recurse when input is a directory | off |
| `--fail-fast` | Stop batch on first error | off |

### Theme ids

| id | Name | Notes |
|----|------|-------|
| `github-light` | GitHub Light | Classic docs look |
| `github-dark` | GitHub Dark | Dark code style |
| `notion` | Notion | Soft notes |
| `academic` | Academic | Paper layout |
| `terminal` | Terminal | Green-on-black |
| `minimal` | Minimal | Sparse whitespace |
| `solarized` | Solarized | Eye-friendly palette |
| `newspaper` | Newspaper | Editorial style |

Aliases: `light` → github-light, `dark` → github-dark, `paper` → newspaper.

### Theme previews

Sample: [`examples/sample.md`](examples/sample.md). Generate with:

```bash
hui convert examples/sample.md -t <theme-id> -f png -o docs/themes/<theme-id>.png
```

| GitHub Light (`github-light`) | GitHub Dark (`github-dark`) |
|:---:|:---:|
| ![github-light](docs/themes/github-light.png) | ![github-dark](docs/themes/github-dark.png) |

| Notion (`notion`) | Academic (`academic`) |
|:---:|:---:|
| ![notion](docs/themes/notion.png) | ![academic](docs/themes/academic.png) |

| Terminal (`terminal`) | Minimal (`minimal`) |
|:---:|:---:|
| ![terminal](docs/themes/terminal.png) | ![minimal](docs/themes/minimal.png) |

| Solarized (`solarized`) | Newspaper (`newspaper`) |
|:---:|:---:|
| ![solarized](docs/themes/solarized.png) | ![newspaper](docs/themes/newspaper.png) |

## Library usage

```ts
import { convertToFormats, buildHtmlDocument, listThemes } from 'hui'

const md = '# Hello\n\nFrom **Hui**.'

// HTML string only
const html = buildHtmlDocument({
  markdown: md,
  themeId: 'notion',
  title: 'Hello',
})

// Write files (png/pdf launch headless Chromium)
await convertToFormats(
  { markdown: md, themeId: 'github-dark' },
  ['html', 'png', 'pdf'],
  (fmt) => `./out/hello.${fmt}`,
)

// Batch: shared browser
import { convertMany, findMarkdownFiles, mapBatchOutputBase } from 'hui'
import { readFile } from 'node:fs/promises'

const root = './notes'
const files = await findMarkdownFiles(root, { recursive: true })
const jobs = await Promise.all(
  files.map(async (inputPath) => ({
    inputPath,
    markdown: await readFile(inputPath, 'utf8'),
    outputBase: mapBatchOutputBase(inputPath, root, './out'),
  })),
)
await convertMany(jobs, {
  themeId: 'notion',
  formats: ['png', 'pdf'],
})
```

## Agent skill

For AI agents (Grok / Claude / Codex, etc.), load the Hui skill:

- In this repo: [`.grok/skills/hui/SKILL.md`](.grok/skills/hui/SKILL.md)
- Slash (Grok): `/hui`
- Copy into a user skill dir if needed: `~/.agents/skills/hui/SKILL.md`

The skill documents binary resolution, convert/batch flags, themes, Chrome requirements, and anti-patterns so agents shell out to `hui` instead of re-implementing export.

## Stack

- Node.js ≥ 18 + TypeScript
- [marked](https://github.com/markedjs/marked) + [highlight.js](https://highlightjs.org/)
- [puppeteer-core](https://pptr.dev/) + system Chrome/Chromium (PNG / PDF)
- [commander](https://github.com/tj/commander.js)
- Release: esbuild + [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) → multi-platform binaries / Homebrew

## Relation to md2png

| | md2png (Web) | hui (CLI) |
|--|--------------|-----------|
| Use case | Live browser preview & export | Terminal / scripts / CI batch |
| Themes | 8 sets | Same theme CSS |
| Output | PNG / PDF / HTML | Same |

## License

MIT
