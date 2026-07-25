import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import type { ThemeId } from './themes.js'
import type { PageSize } from './pageSize.js'
import { PAGE_SPECS } from './pageSize.js'
import { buildHtmlDocument } from './document.js'
import { getBrowser, closeBrowser } from './browser.js'

export type OutputFormat = 'html' | 'png' | 'pdf'

export interface ConvertOptions {
  markdown: string
  themeId: ThemeId
  pageSize?: PageSize
  title?: string
  /** Device scale for PNG (default 2). */
  scale?: number
  /** Content width in px for PNG (default ~794 ≈ A4 @ 96dpi). */
  width?: number
  /** Full-page PNG vs first viewport only. Default true. */
  fullPage?: boolean
}

export interface ConvertResult {
  format: OutputFormat
  outputPath: string
  bytes: number
}

export async function exportHtml(
  options: ConvertOptions,
  outputPath: string,
): Promise<ConvertResult> {
  const html = buildHtmlDocument({
    markdown: options.markdown,
    themeId: options.themeId,
    pageSize: options.pageSize ?? 'A4',
    title: options.title,
  })
  await ensureDir(outputPath)
  await writeFile(outputPath, html, 'utf8')
  return {
    format: 'html',
    outputPath,
    bytes: Buffer.byteLength(html, 'utf8'),
  }
}

export async function exportPng(
  options: ConvertOptions,
  outputPath: string,
): Promise<ConvertResult> {
  const scale = options.scale ?? 2
  const width = options.width ?? 794
  const pageSize = options.pageSize ?? 'A4'
  const html = buildHtmlDocument({
    markdown: options.markdown,
    themeId: options.themeId,
    pageSize,
    title: options.title,
    widthPx: width,
  })

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewport({
      width,
      height: 600,
      deviceScaleFactor: scale,
    })
    await page.setContent(html, { waitUntil: 'load' })
    // Give layout / webfonts a brief moment (no external network expected)
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
    )

    const el = await page.$('#hui-page')
    if (!el) {
      throw new Error('渲染失败：未找到页面根节点 #hui-page')
    }

    await ensureDir(outputPath)
    const buffer = Buffer.from(
      await el.screenshot({
        type: 'png',
        omitBackground: false,
      }),
    )
    await writeFile(outputPath, buffer)
    return {
      format: 'png',
      outputPath,
      bytes: buffer.byteLength,
    }
  } finally {
    await page.close()
  }
}

export async function exportPdf(
  options: ConvertOptions,
  outputPath: string,
): Promise<ConvertResult> {
  const pageSize = options.pageSize ?? 'A4'
  const spec = PAGE_SPECS[pageSize]
  const html = buildHtmlDocument({
    markdown: options.markdown,
    themeId: options.themeId,
    pageSize,
    title: options.title,
  })

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
    )

    await ensureDir(outputPath)
    await page.pdf({
      path: outputPath,
      format: spec.pdfFormat,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    })

    const s = await stat(outputPath)
    return {
      format: 'pdf',
      outputPath,
      bytes: s.size,
    }
  } finally {
    await page.close()
  }
}

export interface ConvertToFormatsOptions {
  /** Keep Chromium open after conversion (batch mode). Default false. */
  keepBrowser?: boolean
}

/**
 * Convert one markdown payload to one or more formats.
 * For batch jobs prefer {@link convertMany} so the browser is shared.
 */
export async function convertToFormats(
  options: ConvertOptions,
  formats: OutputFormat[],
  resolveOutput: (format: OutputFormat) => string,
  extra: ConvertToFormatsOptions = {},
): Promise<ConvertResult[]> {
  const needsBrowser = formats.some((f) => f === 'png' || f === 'pdf')
  try {
    return await convertToFormatsInner(options, formats, resolveOutput)
  } finally {
    if (needsBrowser && !extra.keepBrowser) {
      await closeBrowser()
    }
  }
}

async function convertToFormatsInner(
  options: ConvertOptions,
  formats: OutputFormat[],
  resolveOutput: (format: OutputFormat) => string,
): Promise<ConvertResult[]> {
  const results: ConvertResult[] = []
  for (const format of formats) {
    const out = resolveOutput(format)
    if (format === 'html') {
      results.push(await exportHtml(options, out))
    } else if (format === 'png') {
      results.push(await exportPng(options, out))
    } else if (format === 'pdf') {
      results.push(await exportPdf(options, out))
    }
  }
  return results
}

export interface BatchFileJob {
  /** Absolute path to source .md */
  inputPath: string
  markdown: string
  title?: string
  /** Base path without extension for outputs */
  outputBase: string
}

export interface BatchConvertOptions {
  themeId: ThemeId
  pageSize?: PageSize
  formats: OutputFormat[]
  width?: number
  scale?: number
  /** Called before each file (1-based index). */
  onStart?: (job: BatchFileJob, index: number, total: number) => void
  /** Called after each file succeeds. */
  onFile?: (
    job: BatchFileJob,
    results: ConvertResult[],
    index: number,
    total: number,
  ) => void
  /** Called when a file fails; return true to continue, false to abort. Default: continue. */
  onError?: (
    job: BatchFileJob,
    error: unknown,
    index: number,
    total: number,
  ) => boolean | void
}

export interface BatchConvertResult {
  jobs: number
  succeeded: number
  failed: number
  results: Array<{
    inputPath: string
    outputBase: string
    outputs: ConvertResult[]
    error?: string
  }>
}

/**
 * Convert many markdown files with a single shared browser session.
 */
export async function convertMany(
  jobs: BatchFileJob[],
  options: BatchConvertOptions,
): Promise<BatchConvertResult> {
  const formats = options.formats
  const needsBrowser = formats.some((f) => f === 'png' || f === 'pdf')
  const total = jobs.length
  const results: BatchConvertResult['results'] = []
  let succeeded = 0
  let failed = 0

  try {
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      options.onStart?.(job, i + 1, total)
      try {
        const outputs = await convertToFormatsInner(
          {
            markdown: job.markdown,
            themeId: options.themeId,
            pageSize: options.pageSize,
            title: job.title,
            width: options.width,
            scale: options.scale,
          },
          formats,
          (format) => `${job.outputBase}.${format}`,
        )
        succeeded++
        results.push({
          inputPath: job.inputPath,
          outputBase: job.outputBase,
          outputs,
        })
        options.onFile?.(job, outputs, i + 1, total)
      } catch (err) {
        failed++
        const message = err instanceof Error ? err.message : String(err)
        results.push({
          inputPath: job.inputPath,
          outputBase: job.outputBase,
          outputs: [],
          error: message,
        })
        const cont = options.onError?.(job, err, i + 1, total)
        if (cont === false) break
      }
    }
  } finally {
    if (needsBrowser) {
      await closeBrowser()
    }
  }

  return { jobs: total, succeeded, failed, results }
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(path.dirname(path.resolve(filePath)), { recursive: true })
}

export function parseFormats(input: string): OutputFormat[] {
  const parts = input
    .split(/[,+\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  if (parts.length === 0) {
    throw new Error('No format specified. Use html, png, and/or pdf.')
  }

  const formats: OutputFormat[] = []
  for (const p of parts) {
    if (p === 'html' || p === 'png' || p === 'pdf') {
      if (!formats.includes(p)) formats.push(p)
    } else {
      throw new Error(`Unknown format: ${p}. Use html, png, or pdf.`)
    }
  }
  return formats
}

export function inferFormatFromPath(filePath: string): OutputFormat | null {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.html' || ext === '.htm') return 'html'
  if (ext === '.png') return 'png'
  if (ext === '.pdf') return 'pdf'
  return null
}
