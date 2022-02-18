import {
  BuildCommandOptions,
  TransformedBabelConfig,
  UserBabelConfig,
} from '../types'
import { join, extname, relative } from 'path'
import { existsSync, readFileSync, statSync } from 'fs'
import getTsconfigCompilerOptions from './getTsconfigCompilerOptions'
import getBabelConfig from '@/utils/getBabelConfig'
import vfs from 'vinyl-fs'
import through from 'through2'
import gulpIf from 'gulp-if'
import gulpTs from 'gulp-typescript'
import babel from 'gulp-babel'
import del from 'del'

interface BabelOpts {
  cwd: string
  userBabelConfig: UserBabelConfig
}

const babelTransformRegexp = /\.(t|j)sx?$/

function isTsFile(path: string) {
  return /\.tsx?$/.test(path) && !path.endsWith('.d.ts')
}

function isTransform(path: string) {
  return babelTransformRegexp.test(path) && !path.endsWith('.d.ts')
}

function transformBabelConfig(
  cwd: string,
  userBabelConfig: UserBabelConfig,
): TransformedBabelConfig[] {
  const { output, plugins = [] } = userBabelConfig
  return output.map((output) => {
    return {
      output,
      plugins,
    }
  })
}

export default function build(opts: BabelOpts, options: BuildCommandOptions) {
  const { cwd, userBabelConfig } = opts
  const babelConfigs = transformBabelConfig(cwd, userBabelConfig)

  babelConfigs.forEach((babelConfig) => {
    const { output, plugins } = babelConfig
    const { dir, target, format } = output
    const srcPath = join(cwd, 'src')
    const targetPath = join(cwd, dir)

    const tsCompilerOptions = ((): object => {
      const tsconfigPath = join(cwd, 'tsconfig.json')
      const templateTsconfigPath = join(
        __dirname,
        '../template/default-tsconfig.json',
      )

      if (existsSync(tsconfigPath)) {
        return getTsconfigCompilerOptions(tsconfigPath) || {}
      }
      return getTsconfigCompilerOptions(templateTsconfigPath) || {}
    })()

    const babelOpts = getBabelConfig({
      target,
      format,
      typescript: true,
      plugins,
    })

    // clean dir
    if (options.clean) {
      del.sync([`${dir}/*`])
    }

    vfs
      .src(
        [
          join(srcPath, '**/*'),
          `!${join(srcPath, '**/fixtures{,/**}')}`,
          `!${join(srcPath, '**/demos{,/**}')}`,
          `!${join(srcPath, '**/__test__{,/**}')}`,
          `!${join(srcPath, '**/__tests__{,/**}')}`,
          `!${join(srcPath, '**/*.mdx')}`,
          `!${join(srcPath, '**/*.md')}`,
          `!${join(srcPath, '**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)')}`,
          `!${join(srcPath, '**/tsconfig{,.*}.json')}`,
        ],
        {
          allowEmpty: true,
          base: srcPath,
        },
      )
      .pipe(through.obj())
      .pipe(gulpIf((f: any) => isTsFile(f.path), gulpTs(tsCompilerOptions)))
      .pipe(
        gulpIf(
          (f: any) => isTransform(f.path),
          babel({
            ...babelOpts,
            // configFile: false,
          }),
        ),
      )
      .pipe(vfs.dest(targetPath))
  })
}
