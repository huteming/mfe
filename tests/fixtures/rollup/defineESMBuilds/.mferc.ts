import { defineESMBuilds } from '../../../../src/rollup/helpers'

export const rollup = defineESMBuilds({
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.esm.js',
      format: 'es',
    },
    {
      file: 'lib/index.js',
      format: 'cjs', // 会被改写为 es
    },
  ],
})
