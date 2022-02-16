export const babel = {
  output: [
    {
      dir: 'dist',
      format: '', // 'esm' | 'cjs'
      target: '', // "node" | "browser"
    },
  ],
  plugins: [],
}

export const rollup = {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs', // 输出的文件类型 (amd, cjs, esm, iife, umd)
      exports: 'auto',
      target: '', // "node" | "browser"
      minify: false, // boolean
    },
  ],
  plugins: [],
  external: [],
  extraBabelPlugins: [],
}
