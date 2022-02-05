import { RollupOptions, OutputOptions, ModuleFormat } from 'rollup'

export interface CommandOptions {
  config?: string
}

// ------------ 用户配置 ------------

export interface UserConfig {
  babel?: UserBabelConfig
  rollup?: UserRollupConfig
}

export interface UserBabelConfig {
  output: IBabelOutputOptions[]
}

export interface UserRollupConfig extends RollupOptions {
  input: string[]
  output: IOutputOptions[]
}

// ------------ 内部转化后配置 ------------

export interface InternalBabelConfig {
  output: IBabelOutputOptions
}

// 在内部将 input/output 转化为 1 对 1，类型在这里共享
export interface InternalRollupConfig extends RollupOptions {
  input: string
  output: IOutputOptions
}

// ------------ 单个配置对象 ------------

interface IOutputOptions extends OutputOptions {
  file: string
  format: ModuleFormat
  target?: 'node' | 'browser'
}

interface IBabelOutputOptions {
  dir: string
  format: 'esm' | 'cjs'
  target: 'node' | 'browser'
}
