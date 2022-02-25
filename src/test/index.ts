/**
 * 问题记录
 * 1. jest@27.5有问题:
 *       Package subpath './build/cli/args' is not defined by "exports
 *    安装 jest@26.x jest-cli@26.x 可以解决。
 * 2. jest 安装 26.x 时，记得同步 babel-jest 版本到 26.x，否则报错
 *       TypeError: Cannot read property 'cwd' of undefined
 *    相关链接: https://github.com/facebook/jest/issues/7868#issuecomment-463642113
 * 3. babel-jest 26 => 27 用法有改动
 *    相关链接: https://www.babeljs.cn/docs/config-files#jest
 */
import { runCLI } from 'jest'
import mergeConfig from '@/utils/mergeConfig'
import createDefaultConfig from './createDefaultConfig'
import { existsSync } from 'fs'
import { join } from 'path'
import { options as cliOptions } from 'jest-cli/build/cli/args'
import { TestCommandOptions, UserJestConfig } from '@/types'
import produce from 'immer'

interface TestOpts {
  cwd: string
  userJestConfig?: UserJestConfig
  regexForTestFiles: string[]
}

export default async function test(
  opts: TestOpts,
  options: TestCommandOptions,
) {
  const { cwd, userJestConfig, regexForTestFiles } = opts

  const packageJSONPath = join(cwd, 'package.json')
  const packageJestConfig =
    existsSync(packageJSONPath) && require(packageJSONPath).jest

  const config = mergeConfig(
    createDefaultConfig({
      cwd,
      userJestConfig,
    }),
    packageJestConfig,
    produce(userJestConfig, (draft) => {
      // 删除自定义属性
      delete draft?.extraBabelPlugins
    }),
  )

  // cliOptions 包含 jest 所有的配置属性
  // 这里是获取命令行中 jest 的配置
  const argsConfig = Object.keys(cliOptions).reduce((prev, name) => {
    if (options[name]) {
      prev[name] = options[name]
    }

    // @ts-ignore
    const { alias } = cliOptions[name]
    if (alias && options[alias]) {
      prev[name] = options[alias]
    }
    return prev
  }, {} as any)

  try {
    await runCLI(
      {
        // jest 命令行中的正则
        _: regexForTestFiles || [],
        // 2022-02-26: 暂时不知道是哪个参数
        $0: argsConfig.$0 || '',
        // 必须是单独的 config 配置，值为 string，否则不生效
        config: JSON.stringify(config),
        ...argsConfig,
      },
      [cwd],
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
