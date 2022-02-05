import { extname, join } from 'path'
import { InternalRollupConfig } from '../types'
import { ScriptTarget } from 'typescript'
import typescript from 'rollup-plugin-ts'
import json from '@rollup/plugin-json'
import url from '@rollup/plugin-url'
import svgr from '@svgr/rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel'
import getBabelConfig from '@/utils/getBabelConfig'

interface IGetRollupConfigOpts {
  cwd: string
  internalRollupConfig: InternalRollupConfig
}

interface IPkg {
  dependencies?: Object
  peerDependencies?: Object
  name?: string
}

export default function (opts: IGetRollupConfigOpts): InternalRollupConfig {
  const { cwd, internalRollupConfig } = opts
  const { input, output } = internalRollupConfig
  const { target, format } = output
  const entryExt = extname(input)
  const isTypeScript = entryExt === '.ts' || entryExt === '.tsx'
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs']

  let pkg = {} as IPkg
  try {
    pkg = require(join(cwd, 'package.json'))
  } catch (e) {}

  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]

  const babelConfig = getBabelConfig({
    format,
    target: target || 'browser',
    typescript: true,
  })

  function getPlugins() {
    return [
      url(),
      svgr(),
      nodeResolve({
        mainFields: ['module', 'jsnext:main', 'main'],
        extensions,
      }),
      json(),
      isTypeScript
        ? typescript({
            transpiler: 'babel',
            babelConfig,
            tsconfig: (resolvedConfig) => {
              return {
                ...resolvedConfig,
                declaration: true,
                target: ScriptTarget.ESNext,
              }
            },
          })
        : babel({
            ...babelConfig,
            // ref: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
            babelHelpers: 'runtime',
            exclude: /\/node_modules\//,
            babelrc: false,
            // ref: https://github.com/rollup/rollup-plugin-babel#usage
            extensions,
          }),
      replace({
        values: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        },
        preventAssignment: true,
      }),
    ]
  }

  return {
    input,
    output,
    plugins: [...getPlugins()],
    external,
  }
}
