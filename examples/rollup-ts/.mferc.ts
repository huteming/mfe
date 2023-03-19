import {
  defineBrowserBuilds,
  defineCommonJSBuilds,
  defineESMBuilds,
} from '../..'

export const rollup = [
  defineCommonJSBuilds({
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
      },
    ],
  }),
  defineESMBuilds({
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.esm.js',
        format: 'es',
      },
    ],
  }),
  defineBrowserBuilds({
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.umd.js',
        name: 'hello',
        format: 'umd',
      },
    ],
  }),
]
