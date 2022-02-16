export const rollup = {
  input: ['src/index.ts'],
  output: [
    {
      file: 'lib/index.js',
      format: 'umd',
      target: 'browser',
    },
    {
      file: 'lib/index.min.js',
      format: 'umd',
      target: 'browser',
      minify: true,
    },
  ],
}
