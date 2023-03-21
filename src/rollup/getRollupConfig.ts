import type { IRollupOptions } from '../types'
import getExternal, { getTS2Config } from './utils'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'
import autoprefixer from 'autoprefixer'
import NpmImport from 'less-plugin-npm-import'
import type { InputPluginOption } from 'rollup'
import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript2'

const { default: esbuild } = require('rollup-plugin-esbuild')

export default function getRollupConfig(
  cwd: string,
  rollupOptions: IRollupOptions,
): IRollupOptions {
  const {
    plugins: rollupPlugins = [],
    extraOptions,
    ...restRollupOptions
  } = rollupOptions

  const { format = 'es', minify = false, externalsExclude } = extraOptions || {}

  const plugins: InputPluginOption[] = [
    replace({
      values: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      preventAssignment: true,
    }),
    url(),
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
    // 解析依赖的第三方库，加入构建结果中
    nodeResolve({
      mainFields: ['module', 'jsnext:main', 'main'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    json(),
    typescript(getTS2Config(cwd)),
    esbuild(),

    (minify || format === 'umd') &&
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),

    ...(Array.isArray(rollupPlugins) ? rollupPlugins : [rollupPlugins]),
  ]

  return {
    ...restRollupOptions,
    plugins,
    external: getExternal(cwd, format, externalsExclude),
    // fix warn: The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten
    // https://github.com/rollup/rollup/issues/4022
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return
      warn(warning) // this requires Rollup 0.46
    },
  }
}
