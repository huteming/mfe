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
