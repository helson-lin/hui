import { readFile, access, stat } from 'node:fs/promises'
import path from 'node:path'
import { Command } from 'commander'
import {
  convertToFormats,
  convertMany,
  inferFormatFromPath,
  parseFormats,
  type BatchFileJob,
  type OutputFormat,
} from './export.js'
import { findMarkdownFiles, mapBatchOutputBase } from './batch.js'
import { listThemes, parseThemeId, type ThemeId } from './themes.js'
import { parsePageSize, type PageSize } from './pageSize.js'
import { VERSION } from './version.js'

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command()

  program
    .name('hui')
    .description('徽 CLI — Markdown → PNG / PDF / HTML，多主题切换')
    .version(VERSION)
    .showHelpAfterError()

  program
    .command('convert')
    .description(
      '将 Markdown 文件或目录转换为 PNG、PDF 或 HTML（目录即批量）',
    )
    .argument('<input>', '输入的 .md 文件或目录路径')
    .option(
      '-o, --output <path>',
      '输出路径：单文件可为文件/基名；目录批量时为输出目录',
    )
    .option(
      '-f, --format <formats>',
      '输出格式，逗号分隔：html,png,pdf（默认根据 -o 扩展名，否则 html）',
    )
    .option('-t, --theme <id>', '主题 id（见 hui themes）', 'github-light')
    .option('-p, --page <size>', '页面尺寸：A4 | Letter', 'A4')
    .option('--title <title>', '文档标题（仅单文件；批量时用各文件名）')
    .option('--width <px>', 'PNG 内容宽度（像素）', '794')
    .option('--scale <n>', 'PNG 设备像素比', '2')
    .option(
      '-r, --recursive',
      '目录批量时递归子目录（跳过 node_modules、.git 等）',
      false,
    )
    .option(
      '--fail-fast',
      '批量时遇错即停（默认跳过失败文件继续）',
      false,
    )
    .action(async (input: string, opts: ConvertCliOpts) => {
      await runConvert(input, opts)
    })

  program
    .command('themes')
    .description('列出可用主题')
    .option('--json', '以 JSON 输出')
    .action((opts: { json?: boolean }) => {
      const themes = listThemes()
      if (opts.json) {
        console.log(JSON.stringify(themes, null, 2))
        return
      }
      console.log('可用主题：\n')
      const idWidth = Math.max(...themes.map((t) => t.id.length))
      for (const t of themes) {
        console.log(
          `  ${t.id.padEnd(idWidth)}  ${t.name.padEnd(14)}  ${t.description}`,
        )
      }
      console.log('\n用法示例：  hui convert notes/ -r -t notion -f png -o out/')
    })

  // Shortcut: `hui note.md|dir ...` → convert
  const args = argv.slice(2)
  const first = args[0]
  const isFlag = first?.startsWith('-')
  const isSub =
    first === 'convert' ||
    first === 'themes' ||
    first === 'help' ||
    first === 'completion' ||
    first === undefined

  if (!isSub && !isFlag && first) {
    await program.parseAsync(['node', 'hui', 'convert', ...args])
    return
  }

  if (args.length === 0) {
    program.help()
    return
  }

  await program.parseAsync(argv)
}

interface ConvertCliOpts {
  output?: string
  format?: string
  theme?: string
  page?: string
  title?: string
  width?: string
  scale?: string
  recursive?: boolean
  failFast?: boolean
}

async function runConvert(input: string, opts: ConvertCliOpts): Promise<void> {
  const inputPath = path.resolve(input)
  await assertReadable(inputPath)

  const st = await stat(inputPath)
  if (st.isDirectory()) {
    await runBatchConvert(inputPath, opts)
    return
  }

  await runSingleConvert(inputPath, opts)
}

async function runSingleConvert(
  inputPath: string,
  opts: ConvertCliOpts,
): Promise<void> {
  const markdown = await readFile(inputPath, 'utf8')
  const themeId: ThemeId = parseThemeId(opts.theme ?? 'github-light')
  const pageSize: PageSize = parsePageSize(opts.page ?? 'A4')
  const width = parsePositiveInt(opts.width ?? '794', 'width')
  const scale = parsePositiveNumber(opts.scale ?? '2', 'scale')
  const formats = resolveFormats(opts, false)
  const base = resolveBaseName(inputPath, opts.output)

  const results = await convertToFormats(
    {
      markdown,
      themeId,
      pageSize,
      title: opts.title ?? path.basename(inputPath, path.extname(inputPath)),
      width,
      scale,
    },
    formats,
    (format) => resolveOutputPath(base, opts.output, format, formats),
  )

  for (const r of results) {
    printResult(r.format, r.outputPath, r.bytes)
  }
}

async function runBatchConvert(
  inputDir: string,
  opts: ConvertCliOpts,
): Promise<void> {
  const themeId: ThemeId = parseThemeId(opts.theme ?? 'github-light')
  const pageSize: PageSize = parsePageSize(opts.page ?? 'A4')
  const width = parsePositiveInt(opts.width ?? '794', 'width')
  const scale = parsePositiveNumber(opts.scale ?? '2', 'scale')
  const formats = resolveFormats(opts, true)
  const recursive = Boolean(opts.recursive)
  const failFast = Boolean(opts.failFast)

  const files = await findMarkdownFiles(inputDir, { recursive })
  if (files.length === 0) {
    const hint = recursive
      ? ''
      : '（未加 -r 时只扫当前层；需要子目录请加 --recursive）'
    throw new Error(`目录中未找到 Markdown 文件: ${inputDir}${hint}`)
  }

  const outputRoot = resolveBatchOutputRoot(inputDir, opts.output)

  const jobs: BatchFileJob[] = []
  for (const file of files) {
    const markdown = await readFile(file, 'utf8')
    const outputBase = opts.output
      ? mapBatchOutputBase(file, inputDir, outputRoot)
      : path.join(
          path.dirname(file),
          path.basename(file, path.extname(file)),
        )
    jobs.push({
      inputPath: file,
      markdown,
      title: path.basename(file, path.extname(file)),
      outputBase,
    })
  }

  console.log(
    `批量转换 ${jobs.length} 个文件 → ${formats.join(',')} · 主题 ${themeId}${recursive ? ' · 递归' : ''}`,
  )
  if (opts.output) {
    console.log(`输出目录: ${outputRoot}`)
  }
  console.log('')

  const summary = await convertMany(jobs, {
    themeId,
    pageSize,
    formats,
    width,
    scale,
    onStart: (job, index, total) => {
      const rel = path.relative(process.cwd(), job.inputPath) || job.inputPath
      process.stdout.write(`[${index}/${total}] ${rel} ... `)
    },
    onFile: (_job, results) => {
      const parts = results.map(
        (r) => `${r.format} ${(r.bytes / 1024).toFixed(1)}KB`,
      )
      console.log(`✓ ${parts.join(', ')}`)
    },
    onError: (_job, err) => {
      const message = err instanceof Error ? err.message : String(err)
      console.log(`✗ ${message}`)
      return !failFast
    },
  })

  console.log('')
  console.log(
    `完成: ${summary.succeeded} 成功` +
      (summary.failed ? `, ${summary.failed} 失败` : '') +
      ` / 共 ${summary.jobs}`,
  )

  if (summary.failed > 0) {
    process.exitCode = 1
  }
}

function resolveBatchOutputRoot(
  inputDir: string,
  output?: string,
): string {
  if (!output) return inputDir
  // Strip trailing slash; always treat as directory for batch
  return path.resolve(output)
}

function resolveFormats(
  opts: ConvertCliOpts,
  isBatch: boolean,
): OutputFormat[] {
  if (opts.format) {
    return parseFormats(opts.format)
  }
  // Batch: -o is always a directory, never infer format from it
  if (!isBatch && opts.output) {
    const inferred = inferFormatFromPath(opts.output)
    if (inferred) return [inferred]
  }
  return ['html']
}

function resolveBaseName(inputPath: string, output?: string): string {
  const inputBase = path.basename(inputPath, path.extname(inputPath))
  if (!output) {
    return path.join(path.dirname(inputPath), inputBase)
  }

  const resolved = path.resolve(output)
  if (output.endsWith('/') || output.endsWith(path.sep)) {
    return path.join(resolved, inputBase)
  }

  const ext = path.extname(resolved).toLowerCase()
  if (ext === '.html' || ext === '.htm' || ext === '.png' || ext === '.pdf') {
    return path.join(path.dirname(resolved), path.basename(resolved, ext))
  }

  return resolved
}

function resolveOutputPath(
  base: string,
  output: string | undefined,
  format: OutputFormat,
  formats: OutputFormat[],
): string {
  if (formats.length === 1 && output) {
    const inferred = inferFormatFromPath(output)
    if (inferred === format) {
      return path.resolve(output)
    }
  }
  return `${base}.${format}`
}

function printResult(
  format: OutputFormat,
  outputPath: string,
  bytes: number,
): void {
  const kb = (bytes / 1024).toFixed(1)
  console.log(
    `✓ ${format.toUpperCase().padEnd(4)}  ${outputPath}  (${kb} KB)`,
  )
}

async function assertReadable(filePath: string): Promise<void> {
  try {
    await access(filePath)
  } catch {
    throw new Error(`找不到输入路径: ${filePath}`)
  }
}

function parsePositiveInt(v: string, name: string): number {
  const n = Number.parseInt(v, 10)
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid --${name}: ${v}`)
  }
  return n
}

function parsePositiveNumber(v: string, name: string): number {
  const n = Number.parseFloat(v)
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid --${name}: ${v}`)
  }
  return n
}
