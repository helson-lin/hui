#!/usr/bin/env node
/**
 * Bundle CLI into a single CJS file for @yao-pkg/pkg.
 * puppeteer-core is bundled; system Chrome is used at runtime (no browser download).
 */
import * as esbuild from 'esbuild'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const version = process.env.HUI_VERSION || pkg.version

await esbuild.build({
  entryPoints: [path.join(root, 'src/bin-entry.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: path.join(root, 'dist/bundle.cjs'),
  // Optional native / platform stubs
  external: ['fsevents'],
  define: {
    __HUI_VERSION__: JSON.stringify(version),
  },
  logLevel: 'info',
  minify: false,
  sourcemap: false,
  legalComments: 'none',
})

console.log(`bundled dist/bundle.cjs (version ${version})`)
