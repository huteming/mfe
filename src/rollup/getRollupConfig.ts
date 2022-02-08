import { extname, join } from 'path'
import {
  BuildRollupConfig,
  BuildRollupConfigOutput,
  TransformedRollupConfig,
} from '../types'
import { ScriptTarget } from 'typescript'
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
import getBabelConfig from '@/utils/getBabelConfig'
import produce from 'immer'

interface IGetRollupConfigOpts {
  cwd: string
  rollupConfig: TransformedRollupConfig
}

interface IPkg {
  dependencies?: Object
  peerDependencies?: Object
  name?: string
}

function getPkgNameByid(id: string) {
  const splitted = id.split('/')
  // @ 和 @tmp 是为了兼容 umi 的逻辑
  if (id.charAt(0) === '@' && splitted[0] !== '@' && splitted[0] !== '@tmp') {
    return splitted.slice(0, 2).join('/')
  } else {
    return id.split('/')[0]
  }
}

function testExternal(external: string[], excludes: string[]) {
  return function (id: string) {
    if (excludes.includes(id)) {
      return false
    }
    return external.includes(getPkgNameByid(id))
  }
}

export default function (opts: IGetRollupConfigOpts): BuildRollupConfig {
  const { cwd, rollupConfig } = opts
  const {
    input,
    output,
    plugins: extraRollupPlugins,
    extraBabelPlugins,
  } = rollupConfig
  const { target, format } = output
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

  const babelConfig = getBabelConfig({
    format,
    target: target || 'browser',
    typescript: true,
    plugins: extraBabelPlugins,
  })

  const plugins = [
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
        sass: {},
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
    ...extraRollupPlugins,
  ]

  const buildOutput: BuildRollupConfigOutput = produce(output, (draft: any) => {
    delete draft.target
  })

  return {
    input,
    output: buildOutput,
    plugins,
    external: testExternal(external, []),
  }
}
