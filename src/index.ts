import babel from './babel'
import initCodeStyle from './code-style'
import mferc from './mferc'
import release from './release'
import rollup from './rollup'
import template, { TemplateFileType } from './template'
import test from './test'
import {
  BuildCommandOptions,
  CodeStyleCommandOptions,
  ReleaseCommandOptions,
  TestCommandOptions,
  UserConfig,
} from './types'
import loadConfigFile from './utils/loadConfigFile'
import registerBabel from './utils/registerBabel'
import { Command } from 'commander'
import { existsSync, readFileSync, statSync } from 'fs'
import { createRequire } from 'node:module'
import { extname, join, relative } from 'path'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

function getUserFile(cwd: string, filename?: string): string {
  const userFile = join(cwd, filename || '.mferc.ts')
  if (existsSync(userFile)) {
    return userFile
  }
  return join(__dirname, '../static/.mferc.ts')
}

function loadUserConfig(cwd: string, filename?: string): UserConfig {
  const userFile = getUserFile(cwd, filename)
  // 解析配置文件语法
  registerBabel(userFile)

  return require(userFile)
}

export async function run() {
  const program = new Command()
  program.version(pkg.version)
  // 根路径
  const cwd = process.cwd()

  // 接口文档: https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md
  program
    .command('build')
    .description('构建')
    .option('--clean', '清除目录文件夹')
    .option('--config <config>', '自定义配置文件')
    .action(async (options: BuildCommandOptions) => {
      const { babel: babelOptions, rollup: rollupOptions } =
        await loadConfigFile(options.config)

      // babel 编译
      if (babelOptions) {
        babel(
          {
            cwd,
            userBabelConfig: babelOptions,
          },
          options,
        )
      }
      // rollup 打包
      if (rollupOptions) {
        rollup(cwd, rollupOptions, options)
      }
      // process.exit(buildFailed ? 1 : 0)
    })

  program
    .command('test')
    .description('测试')
    .argument('[regexForTestFiles...]', '正则匹配文件')
    .option('--coverage', 'jest覆盖率')
    .action((regexForTestFiles: string[], options: TestCommandOptions) => {
      const { jest: userJestConfig } = loadUserConfig(cwd)
      test(
        {
          cwd,
          userJestConfig,
          regexForTestFiles,
        },
        options,
      )
    })

  program
    .command('release')
    .description('发布')
    .option('--dry', '测试发布')
    .option('--skipTests', '跳过测试')
    .option('--skipBuild', '跳过构建')
    .action((options: ReleaseCommandOptions) => {
      release({
        cwd,
        options,
      })
    })

  program
    .command('code-style')
    .description('eslint, prettier 等代码格式配置')
    .option('-ts, --typescript', 'ts类型')
    .action((options: CodeStyleCommandOptions) => {
      initCodeStyle({
        cwd,
        options,
      })
    })

  program
    .command('mferc')
    .description('生成配置文件')
    .action(() => {
      mferc({
        cwd,
      })
    })

  program
    .command('template')
    .argument('<type>', '生成模版文件')
    .action((type: TemplateFileType) => {
      template({
        cwd,
        type,
      })
    })

  await program.parseAsync(process.argv)
}

export * from './rollup/helpers'

export * from './types'
