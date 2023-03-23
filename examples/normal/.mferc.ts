import { defineCommonJSBuilds, defineESMBuilds } from '@hutm/footing'

export const rollup = [
  defineESMBuilds({
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.esm.js',
        format: 'es',
      },
    ],
  }),
  defineCommonJSBuilds({
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
      },
    ],
  }),
]

export const gulp = {
  output: {
    dir: 'dist',
  },
}

export const jest = {
  extraOptions: {
    setupFiles: ['./tests/setupFiles.js'],
  },
}
