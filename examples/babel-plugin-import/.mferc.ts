export const rollup = {
  input: ['src/index.tsx'],
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
  extraBabelPlugins: [
    [
      'import',
      { libraryName: 'antd', libraryDirectory: 'es', style: 'css' },
      'antd',
    ],
  ],
}

export const babel = {
  output: [
    {
      dir: 'dist-cjs',
      format: 'cjs', // 'esm' | 'cjs'
      target: 'browser', // "node" | "browser"
    },
    {
      dir: 'dist-esm',
      format: 'esm', // 'esm' | 'cjs'
      target: 'browser', // "node" | "browser"
    },
  ],
  plugins: [
    [
      'import',
      { libraryName: 'antd', libraryDirectory: 'es', style: 'css' },
      'antd',
    ],
  ],
}
