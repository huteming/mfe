import { Command } from 'commander'
import { version } from '../package.json'
import babel from './babel'
import rollup from './rollup'
import { CommandOptions, UserConfig } from './types'
import registerBabel from './utils/registerBabel'
import { existsSync, readFileSync, statSync } from 'fs'
import { join, extname, relative } from 'path'

export default async function main() {
  const program = new Command()
  program.version(version)

  program
    .command('build')
    .description('构建')
    .option('-c --config <config>', '配置文件')
    .action((options: CommandOptions) => {
      const cwd = process.cwd()
      // 配置文件路径
      const configFile = (() => {
        const defaultFile = join(cwd, '.mferc.ts')
        if (!options.config) {
          return defaultFile
        }
        const customFile = join(cwd, options.config)
        if (existsSync(customFile)) {
          return customFile
        }
        return defaultFile
      })()

      registerBabel(configFile)
      const userConfig: UserConfig = require(configFile)

      // babel 编译
      if (userConfig.babel) {
        babel({
          cwd,
          userBabelConfig: userConfig.babel,
        })
      }
      // rollup 打包
      if (userConfig.rollup) {
        rollup({
          cwd,
          userRollupConfig: userConfig.rollup,
        })
      }
    })

  await program.parseAsync(process.argv)
}
