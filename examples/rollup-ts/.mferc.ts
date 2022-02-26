export const rollup = {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'auto',
      target: 'browser',
    },
    {
      file: 'lib/index.esm.js',
      format: 'esm',
      target: 'browser',
    },
  ],
}
