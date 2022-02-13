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
import { TestCommandOptions } from '@/types'

interface TestOpts {
  cwd: string
  args: TestCommandOptions
}

export default async function test(opts: TestOpts) {
  const { cwd, args } = opts

  const packageJSONPath = join(cwd, 'package.json')
  const packageJestConfig =
    existsSync(packageJSONPath) && require(packageJSONPath).jest

  const userJestConfigFile = join(cwd, 'jest.config.js')
  const userJestConfig =
    existsSync(userJestConfigFile) && require(userJestConfigFile)

  const config = mergeConfig(
    createDefaultConfig(cwd),
    packageJestConfig,
    userJestConfig,
  )

  const argsConfig = Object.keys(cliOptions).reduce((prev, name) => {
    if (args[name]) {
      prev[name] = args[name]
    }

    // @ts-ignore
    const { alias } = cliOptions[name]
    if (alias && args[alias]) {
      prev[name] = args[alias]
    }
    return prev
  }, {} as any)

  try {
    await runCLI(
      {
        // _: args._ || [],
        // $0: args.$0 || '',
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
