import { defineESMBuilds } from '../../../..'

export const rollup = defineESMBuilds({
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.esm.js',
      format: 'es',
    },
    {
      file: 'lib/index.js',
      format: 'cjs',
    },
  ],
})
