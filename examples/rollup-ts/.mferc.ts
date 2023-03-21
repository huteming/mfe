import {
  defineBrowserBuilds,
  defineCommonJSBuilds,
  defineESMBuilds,
} from '@hutm/footing'

export const rollup = [
  // {
  //   input: 'src/index.ts',
  //   output: [
  //     {
  //       file: 'lib/index.esm.js',
  //       format: 'es',
  //     },
  //   ],
  // },
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
