import { Command } from 'commander'
import { version } from '../package.json'
import babel from './babel'
import rollup from './rollup'
import { BuildCommandOptions, TestCommandOptions, UserConfig } from './types'
import registerBabel from './utils/registerBabel'
import { existsSync, readFileSync, statSync } from 'fs'
import { join, extname, relative } from 'path'
import test from './test'

export default async function main() {
  const program = new Command()
  program.version(version)

  // 根路径
  const cwd = process.cwd()
  // 配置文件路径
  const configFile = (() => {
    const userFile = join(cwd, '.mferc.ts')
    const defaultFile = join(__dirname, '../static/.mferc.ts')
    if (existsSync(userFile)) {
      return userFile
    }
    return defaultFile
  })()
  // 解析配置文件语法
  registerBabel(configFile)
  const userConfig: UserConfig = require(configFile)

  program
    .command('build')
    .description('构建')
    .option('--clean', '清除目录文件夹')
    .option('--stats', '生成构建分析文件')
    .action((options: BuildCommandOptions) => {
      // babel 编译
      if (userConfig.babel) {
        babel(
          {
            cwd,
            userBabelConfig: userConfig.babel,
          },
          options,
        )
      }
      // rollup 打包
      if (userConfig.rollup) {
        rollup(
          {
            cwd,
            userRollupConfig: userConfig.rollup,
          },
          options,
        )
      }
    })

  program
    .command('test')
    .description('测试')
    .option('--coverage', 'jest覆盖率')
    .action((options: TestCommandOptions) => {
      test(
        {
          cwd,
          userJestConfig: userConfig.jest,
        },
        options,
      )
    })

  await program.parseAsync(process.argv)
}
