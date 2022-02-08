import { ModuleFormat } from 'rollup'

interface IGetBabelConfigOpts {
  target: 'browser' | 'node'
  format: ModuleFormat
  typescript: boolean
  plugins?: any[]
}

export default function (opts: IGetBabelConfigOpts) {
  const { target, typescript, format, plugins = [] } = opts
  const isBrowser = target === 'browser'

  const targets = isBrowser
    ? { browsers: ['last 2 versions', 'IE 10'] }
    : { node: 6 }

  return {
    presets: [
      ...(typescript ? [require.resolve('@babel/preset-typescript')] : []),
      [
        require.resolve('@babel/preset-env'),
        {
          targets,
          modules: format === 'esm' ? false : 'auto',
        },
      ],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      ...(format === 'cjs' && !isBrowser
        ? [[require.resolve('@babel/plugin-transform-modules-commonjs'), {}]]
        : []),
      ...(isBrowser ? [require.resolve('babel-plugin-react-require')] : []),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), {}],
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          useESModules: isBrowser && format === 'esm',
          // version: require('@babel/runtime/package.json').version,
        },
      ],
      ...plugins,
    ],
  }
}
