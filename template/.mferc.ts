export const babel = {
  output: [
    {
      dir: 'dist',
      format: '', // 'esm' | 'cjs'
      target: '', // "node" | "browser"
      // 对于工具来说推荐开启，可加速命令行执行速度，同时减少依赖和耦合。
      lazy: false, // false | true
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
    },
  ],
  plugins: [],
  external: [],
  extraBabelPlugins: [],
}
