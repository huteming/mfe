import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { createRequire } from 'node:module'

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
    plugins: [json(), typescript()],
    external,
  },
]
