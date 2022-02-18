import { RollupOptions, OutputOptions, ModuleFormat } from 'rollup'
import { runCLI } from 'jest'

export interface BuildCommandOptions {
  config?: string
  clean?: boolean
}

export interface TestCommandOptions
  extends Partial<ArgsType<typeof runCLI>['0']> {
  config?: string
}

// ------------ 用户配置 ------------

export interface UserConfig {
  babel?: UserBabelConfig
  rollup?: UserRollupConfig
}

interface RollupOutputOptions extends OutputOptions {
  file: string
  format: ModuleFormat
  target: 'node' | 'browser'
  minify?: boolean
}

interface IBabelOutputOptions {
  dir: string
  format: ModuleFormat
  target: 'node' | 'browser'
}

export interface UserBabelConfig {
  output: IBabelOutputOptions[]
  plugins?: any[]
}

export interface UserRollupConfig extends RollupOptions {
  input: string[]
  output: RollupOutputOptions[]
  plugins?: any[]
  extraBabelPlugins?: any[]
}

// ------------ 转换后的用户对象 ------------

export interface TransformedBabelConfig {
  output: IBabelOutputOptions
  plugins: any[]
}

// 在内部将 input/output 转化为 1 对 1，类型在这里共享
export interface TransformedRollupConfig extends RollupOptions {
  input: string
  output: RollupOutputOptions
  plugins: any[]
  extraBabelPlugins: any[]
}

// ------------ 用于构建的配置对象 ------------

export interface BuildRollupConfig extends RollupOptions {
  input: string
  output: BuildRollupConfigOutput
  plugins: any[]
}

export type BuildRollupConfigOutput = Omit<
  RollupOutputOptions,
  'target' | 'minify'
>

// ------------ 其他 ------------

type ArgsType<T extends (...args: any[]) => any> = T extends (
  ...args: infer U
) => any
  ? U
  : never
