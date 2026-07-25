/** Injected at binary build time via esbuild --define; falls back for dev/tsc. */
declare const __HUI_VERSION__: string | undefined

export const VERSION =
  typeof __HUI_VERSION__ !== 'undefined' ? __HUI_VERSION__ : '1.0.0'
