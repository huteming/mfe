import {
  BuildCommandOptions,
  TransformedBabelConfig,
  UserBabelConfig,
} from '../types'
import { join, extname, relative } from 'path'
import { existsSync, readFileSync, statSync } from 'fs'
import getBabelConfig from '@/utils/getBabelConfig'
import gulp from 'gulp'
import gulpIf from 'gulp-if'
import gulpTs from 'gulp-typescript'
import babel from 'gulp-babel'
import del from 'del'
import { series, parallel } from 'bach'

interface BabelOpts {
  cwd: string
  userBabelConfig: UserBabelConfig
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

const createTsProject = (cwd: string) => {
  const userTsconfig = join(cwd, 'tsconfig.json')
  const mustOverwriteOptions = {
    declaration: true,
    emitDeclarationOnly: true,
  }
  if (existsSync(userTsconfig)) {
    return gulpTs.createProject(userTsconfig, mustOverwriteOptions)
  }
  return gulpTs.createProject({
    ...mustOverwriteOptions,
    allowSyntheticDefaultImports: true,
    module: 'esnext',
    target: 'esnext',
    moduleResolution: 'node',
    jsx: 'react',
  })
}

export default function build(opts: BabelOpts, options: BuildCommandOptions) {
  const { cwd, userBabelConfig } = opts
  const babelConfigs = transformBabelConfig(cwd, userBabelConfig)

  const tasks = babelConfigs.map((babelConfig) => {
    const { output, plugins } = babelConfig
    const { dir, target, format } = output

    const babelOpts = getBabelConfig({
      target,
      format,
      typescript: true,
      plugins,
    })

    const src = [
      'src/**/*',
      `!src/**/fixtures{,/**}`,
      `!src/**/demos{,/**}`,
      `!src/**/__test__{,/**}`,
      `!src/**/__tests__{,/**}`,
      `!src/**/*.mdx`,
      `!src/**/*.md`,
      `!src/**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)`,
      `!src/**/tsconfig{,.*}.json`,
    ]
    const srcOptions = {
      cwd,
      allowEmpty: true,
    }
    const dest = join(cwd, dir)

    const tsProject = createTsProject(cwd)

    const clean = async () => {
      if (options.clean) {
        await del([`${dir}/*`])
      }
    }

    const buildTypes = () => {
      return gulp
        .src(src, srcOptions)
        .pipe(
          gulpIf(
            (f: any) => /\.tsx?$/.test(f.path) && !f.path.endsWith('.d.ts'),
            tsProject(),
          ),
        )
        .pipe(gulp.dest(dest))
    }

    const buildFiles = () => {
      return gulp
        .src(src, srcOptions)
        .pipe(
          gulpIf(
            (f: any) => /\.(t|j)sx?$/.test(f.path) && !f.path.endsWith('.d.ts'),
            babel({
              ...babelOpts,
              babelrc: false,
              configFile: false,
            }),
          ),
        )
        .pipe(gulp.dest(dest))
    }

    return series(clean, parallel(buildTypes, buildFiles))
  })

  return new Promise((resolve, reject) => {
    parallel(...tasks)((err: Error) => {
      if (err) {
        console.error(err)
        return reject(err)
      }
      resolve('done')
    })
  })
}
