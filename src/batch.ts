import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const MD_EXTS = new Set(['.md', '.markdown', '.mdown', '.mkd'])

/** Directories skipped while walking (case-sensitive basenames). */
const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.hg',
  '.svn',
  'dist',
  'build',
  'output',
  '.hui',
  '.next',
  '.cache',
  'coverage',
])

export interface FindMarkdownOptions {
  /** Recurse into subdirectories. Default false. */
  recursive?: boolean
  /** Extra directory basenames to ignore. */
  ignoreDirs?: string[]
}

/**
 * Collect Markdown files under `root`.
 * Non-recursive: only immediate children.
 * Recursive: walk tree, skipping common junk dirs.
 */
export async function findMarkdownFiles(
  root: string,
  options: FindMarkdownOptions = {},
): Promise<string[]> {
  const recursive = options.recursive ?? false
  const ignore = new Set([
    ...DEFAULT_IGNORE_DIRS,
    ...(options.ignoreDirs ?? []),
  ])
  const absRoot = path.resolve(root)
  const results: string[] = []

  async function walk(dir: string): Promise<void> {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch (err) {
      throw new Error(
        `无法读取目录: ${dir}${err instanceof Error ? ` (${err.message})` : ''}`,
      )
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.') continue
      const full = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (!recursive) continue
        if (ignore.has(entry.name)) continue
        await walk(full)
        continue
      }

      if (!entry.isFile()) continue
      const ext = path.extname(entry.name).toLowerCase()
      if (MD_EXTS.has(ext)) {
        results.push(full)
      }
    }
  }

  const rootStat = await stat(absRoot)
  if (!rootStat.isDirectory()) {
    throw new Error(`不是目录: ${absRoot}`)
  }

  await walk(absRoot)
  results.sort((a, b) => a.localeCompare(b))
  return results
}

export function isMarkdownPath(filePath: string): boolean {
  return MD_EXTS.has(path.extname(filePath).toLowerCase())
}

/**
 * Map a source md path under `inputRoot` to an output base path
 * (no extension) under `outputRoot`, preserving relative structure.
 */
export function mapBatchOutputBase(
  inputFile: string,
  inputRoot: string,
  outputRoot: string,
): string {
  const rel = path.relative(path.resolve(inputRoot), path.resolve(inputFile))
  const withoutExt = rel.slice(0, rel.length - path.extname(rel).length)
  return path.join(path.resolve(outputRoot), withoutExt)
}
