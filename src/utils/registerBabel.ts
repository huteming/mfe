export default function registerBabel(file: string) {
  require('@babel/register')({
    presets: [
      require.resolve('@babel/preset-typescript'),
      [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
    ],
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
    only: [file],
    babelrc: false,
    cache: false,
  })
}
