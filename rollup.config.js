import typescript from 'rollup-plugin-ts'
import pkg from './package.json'
import json from '@rollup/plugin-json'

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'fs',
  'path',
  'typescript',
]

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs', // 输出的文件类型 (amd, cjs, esm, iife, umd)
        exports: 'auto',
      },
    ],
    plugins: [
      json(),
      typescript({
        transpiler: 'babel',
      }),
    ],
    external,
  },
]
