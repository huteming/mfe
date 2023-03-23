import cleanBeforeWrite from './src/rollup/plugins/clean-before-write'
import json from '@rollup/plugin-json'
import { createRequire } from 'node:module'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import typescript from 'rollup-plugin-typescript2'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const clean = cleanBeforeWrite('dist')

function commonBuild(declaration) {
  const compiler = {
    declaration,
  }
  if (declaration) {
    // @ts-ignore
    compiler.emitDeclarationOnly = true
  }

  return {
    plugins: [
      json(),
      typescript({
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            ...compiler,
          },
        },
      }),
      esbuild(),
      clean,
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
  }
}

const footingBuilds = defineConfig({
  ...commonBuild(true),
  input: 'src/footing.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
})

const helpersBuild = defineConfig({
  ...commonBuild(false),
  input: 'src/helpers.ts',
  output: [
    {
      file: 'dist/helpers.js',
      format: 'cjs',
    },
    {
      file: 'dist/helpers.esm.mjs',
      format: 'es',
    },
  ],
})

export default [footingBuilds, helpersBuild]
