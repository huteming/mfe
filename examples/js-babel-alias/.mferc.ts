export const babel = {
  output: [
    {
      dir: 'dist',
      format: 'esm', // 'esm' | 'cjs'
      target: 'browser', // "node" | "browser"
    },
    {
      dir: 'lib',
      format: 'cjs', // 'esm' | 'cjs'
      target: 'browser', // "node" | "browser"
    },
  ],
}
