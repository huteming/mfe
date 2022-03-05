import { RollupOptions, OutputOptions, ModuleFormat } from 'rollup'
import type { Config } from '@jest/types'

export interface BuildCommandOptions {
  config?: string
  clean?: boolean
  stats?: boolean
}

export interface TestCommandOptions extends Config.Argv {}

export interface UserConfig {
  babel?: UserBabelConfig
  rollup?: UserRollupConfig
  jest?: UserJestConfig
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

export interface UserRollupConfig extends RollupOptions {
  input: string
  output: RollupOutputOptions[]
  plugins?: any[]
  extraBabelPlugins?: any[]
}

export interface TransformedRollupConfig extends RollupOptions {
  input: string
  output: RollupOutputOptions
  plugins: any[]
  extraBabelPlugins: any[]
}

export interface BuildRollupConfig extends RollupOptions {
  input: string
  output: BuildRollupConfigOutput
  plugins: any[]
}

export type BuildRollupConfigOutput = Omit<
  RollupOutputOptions,
  'target' | 'minify'
>

interface RollupOutputOptions extends OutputOptions {
  file: string
  format: ModuleFormat
  target?: 'node' | 'browser'
  minify?: boolean
}

// ------------ jest ------------

export interface UserJestConfig extends Config.InitialOptions {
  extraBabelPlugins?: []
}
