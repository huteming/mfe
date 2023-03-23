import type { Config } from '@jest/types'
import { RollupOptions } from 'rollup'

export interface IConfigFileExports {
  gulp?: IGulpOptions | IGulpOptions[]
  rollup?: IRollupOptions | IRollupOptions[]
  jest?: IJestOptions
}

// ------------ gulp ------------

export interface IGulpOptions {
  output: IGulpOutputOptions | IGulpOutputOptions[]
}

export interface IGulpOutputOptions {
  dir: string
  /**
   * @default 'es'
   */
  format?: 'es' | 'cjs'
  /**
   * 是否清空输出目录
   * @default false
   */
  clean?: boolean
}

// ------------ rollup ------------

export interface IRollupOptions extends RollupOptions {
  /**
   * 新增的自定义对象, 最后会手动删除
   */
  extraOptions?: {
    /**
     * 是否清空输出目录
     * @default false
     */
    clean?: boolean
    /**
     * 用于指定生成的 bundle 的格式。对应 output.format。
     * 和 babelTarget 不同！这个是指文件自身的格式。
     * 这里简单将浏览器直接使用的格式统一定义为 umd
     * @default 'es'
     */
    format?: 'es' | 'cjs' | 'umd'
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

export interface IJestOptions extends Config.InitialOptions {
  /**
   * 新增的自定义对象, 最后会手动删除
   */
  extraOptions?: {
    // 同 setupFiles，用作合并，而不是覆盖
    setupFiles?: Config.InitialOptions['setupFiles']
  }
}

// ------------ command ------------

export interface BuildCommandOptions {
  config?: string
}

export interface TestCommandOptions extends Config.Argv {
  /** Non-option arguments */
  // _: Array<string | number>
  //
  /** The script name or node command */
  // $0: string
  //
  /** All remaining options */
  // [argName: string]: unknown
}

export interface ReleaseCommandOptions {
  dry?: boolean
  skipTests?: boolean
  skipBuild?: boolean
  preid?: string
}

export interface CodeStyleCommandOptions {
  typescript?: boolean
}
