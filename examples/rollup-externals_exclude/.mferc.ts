export const rollup = {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'auto',
    },
    {
      file: 'lib/index.esm.js',
      format: 'esm',
    },
  ],
  externalsExclude: ['ramda'],
}
