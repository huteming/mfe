import { extname, join } from 'path'
import {
  BuildCommandOptions,
  BuildRollupConfig,
  BuildRollupConfigOutput,
  RollupOutputOptions,
  TransformedRollupConfig,
} from '../types'
import { CompilerOptions, ScriptTarget } from 'typescript'
import typescript from 'rollup-plugin-ts'
import json from '@rollup/plugin-json'
import url from '@rollup/plugin-url'
import svgr from '@svgr/rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import postcss from 'rollup-plugin-postcss'
import NpmImport from 'less-plugin-npm-import'
import autoprefixer from 'autoprefixer'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { visualizer } from 'rollup-plugin-visualizer'
import getBabelConfig from '@/utils/getBabelConfig'
import produce from 'immer'
import { existsSync, readFileSync, statSync } from 'fs'
import type { Plugin } from 'rollup'

interface IGetRollupConfigOpts {
  cwd: string
  rollupConfig: TransformedRollupConfig
}

interface IPkg {
  dependencies?: Object
  peerDependencies?: Object
  name?: string
}

// @ant-design/icons
// antd
// file-loader!ace-builds
function getPkgNameByid(id: string) {
  // 行内的 webpack-loader
  id = id.replace(/^file-loader!/, '')

  const splitted = id.split('/')
  // @ 和 @tmp 是为了兼容 umi 的逻辑
  if (id.charAt(0) === '@' && splitted[0] !== '@' && splitted[0] !== '@tmp') {
    return splitted.slice(0, 2).join('/')
  }
  return id.split('/')[0]
}

function testExternal(external: string[], excludes: string[]) {
  return function (id: string) {
    if (excludes.includes(id)) {
      return false
    }
    return external.includes(getPkgNameByid(id))
  }
}

function mergePlugins(
  defaultPlugins: Plugin[],
  extraPlugins: Plugin[],
  cannotOverridePlugins: Plugin[],
): Plugin[] {
  const sortedPlugins = [
    ...defaultPlugins,
    ...extraPlugins,
    ...cannotOverridePlugins,
  ]
  const pluginsMap: Record<string, Plugin> = sortedPlugins.reduce(
    (r, plugin) => ({ ...r, [plugin.name]: plugin }),
    {},
  )
  return Object.values(pluginsMap)
}

export default function getRollupConfig(
  opts: IGetRollupConfigOpts,
  options: BuildCommandOptions,
): BuildRollupConfig {
  const { cwd, rollupConfig } = opts
  const {
    input,
    output,
    plugins: extraRollupPlugins,
    extraBabelPlugins,
  } = rollupConfig
  const { target = 'browser', format, minify } = output
  const entryExt = extname(input)
  const isTypeScript = entryExt === '.ts' || entryExt === '.tsx'
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs']

  let pkg = {} as IPkg
  try {
    pkg = require(join(cwd, 'package.json'))
  } catch (e) {}

  // ref: https://rollupjs.org/guide/en#external
  // 潜在问题：引用包的子文件时会报 warning，比如 @babel/runtime/helpers/esm/createClass
  // * babel-plugin-import 就会引用包的子文件
  // 解决方案：可以用 function 处理
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]

  // umd 只要 external peerDependencies
  const externalPeerDeps = [...Object.keys(pkg.peerDependencies || {})]

  const babelConfig = getBabelConfig({
    format,
    target,
    typescript: true,
    plugins: extraBabelPlugins,
  })

  const extraUmdPlugins = [
    // A Rollup plugin to convert CommonJS modules to ES6
    commonjs({
      include: /node_modules/,
    }),
  ]

  const getTsConfig = () => {
    if (existsSync(join(cwd, 'tsconfig.json'))) {
      return (resolvedConfig: CompilerOptions) => ({
        ...resolvedConfig,
        declaration: true,
        target: ScriptTarget.ESNext,
      })
    }
    return {
      allowSyntheticDefaultImports: true,
      declaration: true,
      module: 'esnext',
      target: 'esnext',
      moduleResolution: 'node',
      jsx: 'react',
    }
  }

  const defaultPlugins: Plugin[] = [
    replace({
      values: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      preventAssignment: true,
    }),
    url(),
    svgr(),
    postcss({
      extract: false,
      inject: true,
      modules: false,
      minimize: false,
      use: {
        less: {
          plugins: [new NpmImport({ prefix: '~' })],
          javascriptEnabled: true,
        },
        sass: false,
        stylus: false,
      },
      plugins: [
        autoprefixer({
          // https://github.com/postcss/autoprefixer/issues/776
          remove: false,
        }),
      ],
    }),
    nodeResolve({
      mainFields: ['module', 'jsnext:main', 'main'],
      extensions,
    }),
    json(),
    isTypeScript
      ? typescript({
          transpiler: 'babel',
          babelConfig,
          tsconfig: getTsConfig(),
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
    ...(format === 'umd' ? extraUmdPlugins : []),
    ...(minify
      ? [
          terser({
            compress: {
              pure_getters: true,
              unsafe: true,
              unsafe_comps: true,
            },
          }),
        ]
      : []),
  ]
  // 有些插件必须放在最后，所以不能覆盖
  const cannotOverridePlugins: Plugin[] = [
    // https://github.com/btd/rollup-plugin-visualizer
    ...(options.stats
      ? [
          visualizer({
            gzipSize: true,
          }),
        ]
      : []),
  ]

  const buildOutput: BuildRollupConfigOutput = produce(
    output,
    (draft: Partial<RollupOutputOptions>) => {
      delete draft.target
      delete draft.minify
    },
  )

  return {
    input,
    output: buildOutput,
    plugins: mergePlugins(
      defaultPlugins,
      extraRollupPlugins,
      cannotOverridePlugins,
    ),
    external: testExternal(format === 'umd' ? externalPeerDeps : external, []),
  }
}
