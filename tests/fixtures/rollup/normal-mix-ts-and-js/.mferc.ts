export const rollup = {
  input: 'src/index.js',
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
}
