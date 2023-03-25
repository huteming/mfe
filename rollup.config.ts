import cleanBeforeWrite from './src/rollup/plugins/clean-before-write'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import { createRequire } from 'node:module'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import typescript from 'rollup-plugin-typescript2'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

export default defineConfig({
  input: 'src/footing.ts',

  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],

  plugins: [
    replace({
      values: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      preventAssignment: true,
    }),
    json(),
    typescript({
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: true,
        },
      },
    }),
    esbuild(),
    cleanBeforeWrite('dist'),
  ],

  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'fs',
    'path',
    'assert',
    'node:url',
    'node:path',
    'node:module',
    'node:stream',
    'node:fs',
    'node:fs/promises',
  ],
})
