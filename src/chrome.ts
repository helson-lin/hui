import { accessSync, constants, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'

/**
 * Resolve a Chrome / Chromium executable for headless PNG/PDF export.
 */
export function resolveChromeExecutable(): string {
  const fromEnv =
    process.env.HUI_CHROME_PATH ||
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    process.env.GOOGLE_CHROME_BIN
  if (fromEnv && exists(fromEnv)) return fromEnv

  for (const candidate of platformCandidates()) {
    if (exists(candidate)) return candidate
  }

  for (const name of [
    'google-chrome-stable',
    'google-chrome',
    'chromium-browser',
    'chromium',
    'chrome',
  ]) {
    const found = which(name)
    if (found) return found
  }

  throw new Error(
    '未找到 Chrome/Chromium，PNG/PDF 导出需要浏览器引擎。\n' +
      '  macOS: 安装 Google Chrome\n' +
      '  Linux: sudo apt install chromium-browser  （或 google-chrome）\n' +
      '  或设置: export HUI_CHROME_PATH=/path/to/chrome',
  )
}

function platformCandidates(): string[] {
  const platform = process.platform
  const home = os.homedir()

  if (platform === 'darwin') {
    return [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      path.join(
        home,
        'Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ),
      ...scanBrowserCaches([
        path.join(home, 'Library/Caches/ms-playwright'),
        path.join(home, '.cache/ms-playwright'),
        path.join(home, '.cache/puppeteer'),
      ]),
    ]
  }

  if (platform === 'win32') {
    const pf = process.env.PROGRAMFILES || 'C:\\Program Files'
    const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'
    const local = process.env.LOCALAPPDATA || ''
    return [
      path.join(pf, 'Google/Chrome/Application/chrome.exe'),
      path.join(pf86, 'Google/Chrome/Application/chrome.exe'),
      path.join(local, 'Google/Chrome/Application/chrome.exe'),
      path.join(pf, 'Microsoft/Edge/Application/msedge.exe'),
      ...scanBrowserCaches([
        path.join(local, 'ms-playwright'),
        path.join(home, '.cache/ms-playwright'),
        path.join(home, '.cache/puppeteer'),
      ]),
    ]
  }

  return [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    '/usr/bin/microsoft-edge',
    ...scanBrowserCaches([
      path.join(home, '.cache/ms-playwright'),
      path.join(home, '.cache/puppeteer'),
    ]),
  ]
}

/** Scan Playwright / Puppeteer browser caches for a chrome binary. */
function scanBrowserCaches(roots: string[]): string[] {
  const found: string[] = []
  for (const root of roots) {
    let top: string[]
    try {
      top = readdirSync(root)
    } catch {
      continue
    }
    for (const name of top) {
      const base = path.join(root, name)
      const candidates = [
        path.join(base, 'chrome-linux64', 'chrome'),
        path.join(
          base,
          'chrome-headless-shell-linux64',
          'chrome-headless-shell',
        ),
        path.join(base, 'chrome-mac', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        path.join(base, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        path.join(base, 'chrome-win64', 'chrome.exe'),
      ]
      for (const c of candidates) {
        try {
          if (statSync(c).isFile()) found.push(c)
        } catch {
          /* skip */
        }
      }
    }
  }
  return found
}

function exists(p: string): boolean {
  try {
    accessSync(p, constants.X_OK)
    return true
  } catch {
    try {
      accessSync(p, constants.F_OK)
      return true
    } catch {
      return false
    }
  }
}

function which(cmd: string): string | null {
  try {
    const out = execSync(
      process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`,
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    )
      .trim()
      .split(/\r?\n/)[0]
    return out && exists(out) ? out : null
  } catch {
    return null
  }
}
