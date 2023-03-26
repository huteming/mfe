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
    extraOptions: {
      clean: true,
    },
  }),
  defineCommonJSBuilds({
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
      },
    ],
    extraOptions: {
      clean: true,
    },
  }),
]

export const gulp = {
  output: {
    dir: 'dist',
    sourcemap: false,
  },
  clean: true,
}

export const jest = {
  extraOptions: {
    setupFiles: ['./tests/setupFiles.js'],
  },
}
