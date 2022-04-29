import { RollupOptions, OutputOptions, ModuleFormat } from 'rollup'
import type { Config } from '@jest/types'

export interface UserConfig {
  babel?: UserBabelConfig
  rollup?: UserRollupConfig
  jest?: UserJestConfig
}

// ------------ command ------------

export interface BuildCommandOptions {
  config?: string
  clean?: boolean
  stats?: boolean
}

export interface TestCommandOptions extends Config.Argv {}

export interface CodeStyleCommandOptions {
  typescript?: boolean
}

// ------------ babel ------------

export interface UserBabelConfig {
  output: IBabelOutputOptions[]
  plugins?: any[]
}

export interface TransformedBabelConfig {
  output: IBabelOutputOptions
  plugins: any[]
}

interface IBabelOutputOptions {
  dir: string
  format: ModuleFormat
  target?: 'node' | 'browser'
}

// ------------ rollup ------------

// 这是自定义的输出配置对象
export interface IRollupOutputOptions extends OutputOptions {
  file: string
  format: ModuleFormat

  // 自定义新增, 需要手动删除
  target?: 'node' | 'browser'
  minify?: boolean
}

interface IRollupOptions extends RollupOptions {
  plugins?: any[]
  extraBabelPlugins?: any[]
  externalsExclude?: any[]
}

export interface UserRollupConfig extends IRollupOptions {
  input: string
  output: IRollupOutputOptions[]
}

export interface TransformedRollupConfig extends IRollupOptions {
  input: string
  output: IRollupOutputOptions
}

export interface BuildRollupConfig extends RollupOptions {
  input: string
  output: IRollupOutputOptions
}

// ------------ jest ------------

export interface UserJestConfig extends Config.InitialOptions {
  extraBabelPlugins?: []
  // 同 setupFiles，用作合并，而不是覆盖
  _setupFiles?: Config.InitialOptions['setupFiles']
}
