import json from '@rollup/plugin-json'
import { createRequire } from 'node:module'
import typescript from 'rollup-plugin-typescript2'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'fs',
  'path',
  'typescript',
  'assert',
  'jest',
  'jest-cli/build/cli/args',
  'node:url',
  'node:path',
  'node:module',
  'node:fs/promises',
  'rollup-plugin-typescript2',
]

export default [
  {
    input: 'src/index.ts',
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
    plugins: [
      json(),
      typescript({
        tsconfigOverride: { compilerOptions: { declaration: true } },
      }),
    ],
    external,
  },
]
