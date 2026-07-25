import puppeteer, { type Browser } from 'puppeteer-core'
import { resolveChromeExecutable } from './chrome.js'

let browserPromise: Promise<Browser> | null = null

/**
 * Launch system Chrome/Chromium via puppeteer-core (no bundled browser download).
 * Suitable for npm installs and pkg/homebrew binaries.
 */
export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launch()
  }
  return browserPromise
}

async function launch(): Promise<Browser> {
  const executablePath = resolveChromeExecutable()
  try {
    return await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--font-render-hinting=medium',
        '--disable-dev-shm-usage',
      ],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `无法启动浏览器 (${executablePath})。\n` +
        `设置 HUI_CHROME_PATH 指向 Chrome/Chromium 可执行文件。\n` +
        `原始错误: ${msg}`,
    )
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise
    browserPromise = null
    await browser.close()
  }
}
