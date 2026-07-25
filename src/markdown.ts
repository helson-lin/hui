import { Marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import yaml from 'highlight.js/lib/languages/yaml'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)

const marked = new Marked({
  gfm: true,
  breaks: false,
})

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      // marked may leave trailing newlines; normalize for stable highlight
      const source = text.replace(/\n$/, '')
      const language = (lang || '').trim().split(/\s+/)[0]?.toLowerCase() || ''
      let highlighted: string
      try {
        if (language && hljs.getLanguage(language)) {
          highlighted = hljs.highlight(source, {
            language,
            ignoreIllegals: true,
          }).value
        } else if (language) {
          // Unknown fence lang: still escape, don't auto-guess wrong grammar
          highlighted = escapeHtml(source)
        } else {
          highlighted = hljs.highlightAuto(source).value
        }
      } catch {
        highlighted = escapeHtml(source)
      }
      const langClass = language ? ` language-${escapeAttr(language)}` : ''
      return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>\n`
    },
  },
})

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9_+#-]/g, '')
}

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string
}
