import ensureRelative from '@/utils/ensureRelative'
import { existsSync } from 'fs'
import { dirname, join, resolve } from 'node:path'
import { ModuleFormat, OutputOptions } from 'rollup'
import type { IOptions } from 'rollup-plugin-typescript2/dist/ioptions'
import { CompilerOptions } from 'typescript'

/**
 * 获取 rollup-plugin-typescript2 插件的配置
 */
export function getTS2Config(cwd: string): Partial<IOptions> {
  const opt: Partial<IOptions> = {
    clean: true,
    check: false,
  }

  // tsconfig.json 不存在，不能进行类型检查和配置覆盖，否则报错
  // 1. 当 tsconfig 不存在进行类型检查时
  //    error:  plugin: rpt2, hook: buildEnd -> triggerUncaughtException(err, true /* fromPromise */)
  // 2. 当 tsconfig 不存在进行配置覆盖时
  //    error:  plugin: rpt2, hook: generateBundle -> base = Object.assign(new Error(base.message), base)
  if (existsSync(resolve(cwd, 'tsconfig.json'))) {
    opt.check = true
    opt.tsconfigDefaults = {
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        allowJs: true,
        checkJs: true,
        declaration: true,
        // allowSyntheticDefaultImports: true,
      },
    }
    opt.tsconfigOverride = {
      compilerOptions: { emitDeclarationOnly: true },
    }
  }

  return opt
}

/**
 * 获取 rollup-plugin-ts 插件的 tsconfig 对象
 */
export function getTsConfig(cwd: string) {
  if (existsSync(join(cwd, 'tsconfig.json'))) {
    return (resolvedConfig: CompilerOptions) => ({
      ...resolvedConfig,
      // target: ScriptTarget.ESNext,
      allowJs: true,
      declaration: true,
    })
  }

  return {
    allowSyntheticDefaultImports: true,
    module: 'esnext',
    moduleResolution: 'node',
    jsx: 'react',
    target: 'esnext',

    allowJs: true,
    declaration: true,
  }
}

/**
 * 获取 rollup 最终输出的目录
 * https://github.com/wessberg/rollup-plugin-ts/blob/0945df3768c5f4533742bda2ebeda68db4833d7a/src/util/get-declaration-out-dir/get-declaration-out-dir.ts#L30
 */
export function getOutDir(
  cwd: string,
  options: Partial<OutputOptions>,
): string {
  let outDir: string | undefined

  if (options.dir) {
    outDir = options.dir
  } else if (options.file) {
    outDir = dirname(options.file)
  } else {
    outDir = cwd
  }

  const relativeToCwd = ensureRelative(cwd, outDir)
  return relativeToCwd
}

interface IPkg {
  dependencies?: Object
  peerDependencies?: Object
  name?: string
}

/**
 * 获取 rollup 中动态计算 external 的函数
 * 在 plugins 中使用
 */
export default function getExternal(
  cwd: string,
  format: ModuleFormat,
  excludes?: string[],
) {
  let pkg = {} as IPkg
  try {
    pkg = require(join(cwd, 'package.json'))
  } catch (e) {}

  // ref: https://rollupjs.org/guide/en#external
  // 潜在问题：引用包的子文件时会报 warning，比如 @babel/runtime/helpers/esm/createClass
  // * babel-plugin-import 就会引用包的子文件
  // 解决方案：可以用 function 处理
  const dep = Object.keys(pkg.dependencies || {})
  const peerDep = Object.keys(pkg.peerDependencies || {})

  // umd 只要 external peerDependencies
  const external = format === 'umd' ? [...peerDep] : [...dep, ...peerDep]

  return function (id: string) {
    if (excludes?.includes(id)) {
      return false
    }
    return external.includes(getPkgNameByid(id))
  }
}

/**
 * 示例
 * 1. @ant-design/icons
 * 2. antd
 * 3. file-loader!ace-builds
 */
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
