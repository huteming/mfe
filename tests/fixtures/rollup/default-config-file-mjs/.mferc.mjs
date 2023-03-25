export const rollup = {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'es',
    },
  ],
  extraOptions: {
    clean: true,
  },
}
