import {
  BuildCommandOptions,
  TransformedBabelConfig,
  UserBabelConfig,
} from '../types'
import getBabelConfig from '@/utils/getBabelConfig'
import parseTsCompilerOptions from '@/utils/parseTsCompilerOptions'
import { parallel, series } from 'bach'
import del from 'del'
import { existsSync, readFileSync, statSync } from 'fs'
import gulp from 'gulp'
import babel from 'gulp-babel'
import gulpIf from 'gulp-if'
import gulpTs from 'gulp-typescript'
import produce from 'immer'
import { extname, join, relative } from 'path'

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
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    // 2022-04-07: 该配置导致不输出类型文件，暂不知道原因
    isolatedModules: false,
  }

  // 用户的 tsconfig.json 文件
  if (existsSync(userTsconfig)) {
    return gulpTs.createProject(userTsconfig, mustOverwriteOptions)
  }

  return gulpTs.createProject({
    allowSyntheticDefaultImports: true,
    module: 'esnext',
    target: 'esnext',
    moduleResolution: 'node',
    jsx: 'react',
    ...mustOverwriteOptions,
  })
}

// TODO: 基于 utils/getResolverAlias 做转换
const getResolverAlias = (cwd: string) => {
  const resolver: { cwd: string; alias: Record<string, any> } = {
    // 重要: 会用于解析最后生成的相对路径
    cwd: 'src',
    alias: {
      '^@/(.+)': ([, name]: string[]) => {
        return `./${name}`
      },
    },
  }
  const compilerOptions = parseTsCompilerOptions(cwd)
  if (!compilerOptions || !compilerOptions.paths) {
    return resolver
  }
  const { paths } = compilerOptions
  // "paths": {
  //   "*": ["types/*"],
  //   "@/*": ["src/*"]
  // },
  return Object.entries(paths).reduce((editResolver, [key, values]) => {
    const alias = key.replace('/*', '/')
    const resolved = values[0].replace('src', '.').replace('/*', '')

    return produce(editResolver, (draft) => {
      draft.alias[`^${alias}(.+)`] = ([, name]: string[]) => {
        return `./${resolved}/${name}`
      }
    })
  }, resolver)
}

export default function build(opts: BabelOpts, options: BuildCommandOptions) {
  const { cwd, userBabelConfig } = opts
  const babelConfigs = transformBabelConfig(cwd, userBabelConfig)

  const tasks = babelConfigs.map((babelConfig) => {
    const { output, plugins } = babelConfig
    const { dir, target = 'browser', format } = output

    const babelOpts = getBabelConfig({
      target,
      format,
      typescript: true,
      plugins: [
        // https://github.com/tleunen/babel-plugin-module-resolver/blob/HEAD/DOCS.md#cwd
        [
          require.resolve('babel-plugin-module-resolver'),
          {
            ...getResolverAlias(cwd),
          },
        ],
        ...plugins,
      ],
    })

    const src = [
      'src/**/*',
      `!src/**/fixtures{,/**}`,
      `!src/**/demos{,/**}`,
      `!src/**/__test__{,/**}`,
      `!src/**/__tests__{,/**}`,
      `!src/**/*.mdx`,
      `!src/**/*.md`,
      // 测试文件
      `!src/**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)`,
      // storybook
      '!src/**/*.stories.mdx',
      '!src/**/*.stories.+(js|jsx|ts|tsx)',
      // tsconfig.json
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
        // console.error(err.message)
        return reject(new Error(err.message))
      }
      resolve('done')
    })
  })
}
