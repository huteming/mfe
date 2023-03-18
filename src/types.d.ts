import type { Config } from '@jest/types'
import { ModuleFormat, OutputOptions, RollupOptions } from 'rollup'

export interface UserConfig {
  babel?: UserBabelConfig
  rollup?: IRollupOptions
  jest?: UserJestConfig
}

// ------------ command ------------

export interface BuildCommandOptions {
  config?: string
  clean?: boolean
  stats?: boolean
}

export interface TestCommandOptions extends Config.Argv {}

export interface ReleaseCommandOptions {
  dry?: boolean
  skipTests?: boolean
  skipBuild?: boolean
  preid?: string
}

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

export interface IRollupOptions extends RollupOptions {
  // 自定义新增, 需要手动删除
  extraOptions?: {
    /**
     * babel 参数
     * @default browser
     */
    target?: 'node' | 'browser'
    /**
     * 是否开启压缩
     * @default false
     */
    minify?: boolean
    /**
     * 自定义 babel 插件
     */
    babelPlugins?: any[]
    /**
     * 将依赖加入构建中。
     * 本来默认会将所有的依赖都加入 external 中，不参与构建
     * 这个属性就是将指定的库排除出 external，从而加入构建
     */
    externalsExclude?: string[]
  }
}

// ------------ jest ------------

export interface UserJestConfig extends Config.InitialOptions {
  extraBabelPlugins?: []
  // 同 setupFiles，用作合并，而不是覆盖
  _setupFiles?: Config.InitialOptions['setupFiles']
}
