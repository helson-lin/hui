# Hui · Sample Document

**Hui** is a multi-theme Markdown export tool: **PNG / PDF / HTML**.

## Highlights

- 8 curated themes, aligned with the md2png web app
- One-shot CLI conversion for scripts and CI
- GFM: tables, task lists, syntax highlighting

## Code

```ts
import { convertToFormats } from 'hui'

await convertToFormats(
  { markdown: '# Hello', themeId: 'notion' },
  ['png', 'pdf'],
  (fmt) => `out/hello.${fmt}`,
)
```

## Table

| Theme | Style | Best for |
|-------|-------|----------|
| github-light | Classic docs | README, technical docs |
| notion | Soft notes | Meeting notes, wikis |
| terminal | Green terminal | Command cheatsheets |

## Quote

> Ship the output. Chrome is only there to help you get a good-looking file fast.

## Lists

1. Write Markdown
2. Pick a theme: `hui themes`
3. Export: `hui convert note.md -t academic -f png,pdf`

- [x] HTML export
- [x] PNG export
- [x] PDF export
- [ ] Custom theme files (later)

---

`inline code` · **bold** · *italic* · [link](https://example.com)
