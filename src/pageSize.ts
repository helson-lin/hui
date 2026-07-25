export type PageSize = 'A4' | 'Letter'

export const PAGE_SPECS: Record<
  PageSize,
  {
    label: string
    widthMm: number
    heightMm: number
    pdfFormat: 'A4' | 'Letter'
    cssMaxWidth: string
  }
> = {
  A4: {
    label: 'A4',
    widthMm: 210,
    heightMm: 297,
    pdfFormat: 'A4',
    cssMaxWidth: '210mm',
  },
  Letter: {
    label: 'Letter',
    widthMm: 215.9,
    heightMm: 279.4,
    pdfFormat: 'Letter',
    cssMaxWidth: '215.9mm',
  },
}

export function isPageSize(v: string): v is PageSize {
  return v === 'A4' || v === 'Letter'
}

export function parsePageSize(v: string): PageSize {
  const normalized = v.trim()
  // allow a4 / letter case-insensitive
  if (/^a4$/i.test(normalized)) return 'A4'
  if (/^letter$/i.test(normalized)) return 'Letter'
  throw new Error(`Unknown page size: ${v}. Use A4 or Letter.`)
}
