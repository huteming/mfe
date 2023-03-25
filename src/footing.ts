import initCodeStyle from './code-style'
import gulp from './gulp'
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
} from './types'
import loadConfigFile from './utils/loadConfigFile'
import { Command, ParseOptions } from 'commander'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

/**
 * @param argv
 * https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md#parse-%E5%92%8C-parseasync
 */
export async function run(argv?: string[]) {
  const program = new Command()
  program.version(pkg.version)
  // 根路径。自定义的话，内部其他工具（如: rollup）在解析配置的时候可能会出错，所以还是只能依赖从 process 获取
  const cwd = process.cwd()

  // 接口文档: https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md
  program
    .command('build')
    .description('构建')
    .option('--key', '标志符')
    .option('--clean', '清除目录文件夹')
    .option('--config <config>', '自定义配置文件')
    .action(async (options: BuildCommandOptions) => {
      const { gulp: gulpOptions, rollup: rollupOptions } = await loadConfigFile(
        cwd,
        options.config,
      )

      await Promise.all([gulp(cwd, gulpOptions), rollup(cwd, rollupOptions)])
    })

  program
    .command('test')
    .description('测试')
    .argument('[regexForTestFiles...]', '正则匹配文件')
    .option('--key', '标志符')
    .option('--coverage', 'jest覆盖率')
    .action(
      async (regexForTestFiles: string[], options: TestCommandOptions) => {
        const configFileExports = await loadConfigFile(cwd)
        options._ = regexForTestFiles

        // 测试环境下 jest 被注入到全局，配置文件声明 jest 会报错
        // fix: SyntaxError: Identifier 'jest' has already been declared
        await test(
          cwd,
          configFileExports.jest || configFileExports.jestOptions,
          options,
        )
      },
    )

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

  const args: [string[], ParseOptions | undefined] = argv
    ? [argv, { from: 'user' }]
    : [process.argv, undefined]
  await program.parseAsync(...args)
}

export * from './rollup/helpers'
