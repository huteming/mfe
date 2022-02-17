export const rollup = {
  input: ['src/index.tsx'],
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'auto',
      target: 'browser',
    },
  ],
}
