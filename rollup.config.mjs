import pkg from './package.json' assert { type: 'json' }
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-ts'

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'fs',
  'path',
  'typescript',
  'assert',
  'jest',
  'jest-cli/build/cli/args',
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
        browserslist: false,
        tsconfig: (resolvedConfig) => ({
          ...resolvedConfig,
          allowJs: false,
          declaration: true,
        }),
      }),
    ],
    external,
  },
]
