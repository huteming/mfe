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
import { IJestOptions, TestCommandOptions } from '../types'
import mergeOptions from './mergeOptions'
import { runCLI } from 'jest'

export default async function test(
  cwd: string,
  jestOptions: IJestOptions | undefined,
  commandOptions: TestCommandOptions,
) {
  const mergedJestOptions = mergeOptions(cwd, jestOptions)
  const { key, ...validJestOptions } = commandOptions

  // 注: jest 并不提供编程的方式执行，这里只是模拟命令行参数
  const res = await runCLI(
    {
      //  _: Non-option arguments
      // $0: The script name or node command
      ...validJestOptions,
      config: JSON.stringify(mergedJestOptions),
    },
    [cwd],
  )
  if (!res?.results?.success) {
    throw new Error('测试失败')
  }
}
