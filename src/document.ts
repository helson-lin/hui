import type { ThemeId } from './themes.js'
import { getThemeCss, getThemeMeta } from './themes.js'
import type { PageSize } from './pageSize.js'
import { PAGE_SPECS } from './pageSize.js'
import { renderMarkdown } from './markdown.js'

export interface BuildDocumentOptions {
  markdown: string
  themeId: ThemeId
  pageSize?: PageSize
  title?: string
  /** CSS content width for the page box (px). Used by PNG capture viewport. */
  widthPx?: number
  /** Extra padding around content (mm) for page layout. */
  paddingMm?: number
}

export function buildHtmlDocument(options: BuildDocumentOptions): string {
  const {
    markdown,
    themeId,
    pageSize = 'A4',
    title,
    widthPx,
    paddingMm = 16,
  } = options

  const theme = getThemeMeta(themeId)
  const css = getThemeCss(themeId)
  const page = PAGE_SPECS[pageSize]
  const htmlBody = renderMarkdown(markdown)
  const docTitle = title?.trim() || `徽 · ${theme.name}`
  const widthCss = widthPx ? `${widthPx}px` : `${page.widthMm}mm`
  const minHeightCss = widthPx ? 'auto' : `${page.heightMm}mm`

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeAttr(docTitle)}</title>
  <style>
    @page { size: ${pageSize === 'A4' ? 'A4' : 'letter'}; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: ${theme.previewBg};
    }
    .page {
      width: ${widthCss};
      min-height: ${minHeightCss};
      margin: 0 auto;
      padding: ${paddingMm}mm ${paddingMm}mm ${paddingMm + 4}mm;
      background: ${theme.previewBg};
    }
    @media print {
      body { background: ${theme.previewBg}; }
      .page {
        width: auto;
        min-height: auto;
        margin: 0;
        box-shadow: none;
      }
    }
    ${css}
    .hljs { display: block; overflow-x: auto; }
    .hljs-comment, .hljs-quote { opacity: 0.7; font-style: italic; }
    .hljs-keyword, .hljs-selector-tag, .hljs-literal { font-weight: 600; }
    .hljs-string, .hljs-attr { opacity: 0.95; }
  </style>
</head>
<body>
  <div class="page" id="hui-page">
    <div class="md-body">
${htmlBody}
    </div>
  </div>
</body>
</html>
`
}

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
