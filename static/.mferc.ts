// export const babel = {
//   output: [
//     {
//       dir: 'dist',
//       format: 'esm', // 'esm' | 'cjs'
//       target: 'browser', // "node" | "browser"
//     },
//   ],
//   plugins: [],
// }

export const rollup = {
  input: ['src/index.ts'],
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs', // 输出的文件类型 (amd, cjs, esm, iife, umd)
      exports: 'auto',
      target: 'browser', // "node" | "browser"
      // minify: false, // boolean
    },
    {
      file: 'lib/index.esm.js',
      format: 'esm', // 输出的文件类型 (amd, cjs, esm, iife, umd)
      // exports: 'auto',
      target: 'browser', // "node" | "browser"
      // minify: false, // boolean
    },
  ],
  plugins: [],
  external: [],
  extraBabelPlugins: [],
}

// export const jest = {
//   extraBabelPlugins: [],
// }
