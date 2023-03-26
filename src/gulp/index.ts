import { IGulpOptions, IGulpOutputOptions } from '../types'
import gulpSwc from './plugins/swc'
import { safeArray } from '@/utils/helpers'
import gulp, { parallel, series } from 'gulp'
import gulpIf from 'gulp-if'
import gulpIgnore from 'gulp-ignore'
import sourcemaps from 'gulp-sourcemaps'
import gulpTs from 'gulp-typescript'
import { rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import vinyl from 'vinyl'

export default async function build(
  cwd: string,
  gulpOptions?: IGulpOptions | IGulpOptions[],
): Promise<any> {
  if (!gulpOptions) {
    return
  }

  const gulpOptionsArr = safeArray(gulpOptions)

  const compileTasks = gulpOptionsArr.map((option) => {
    return multipleOutputTask(cwd, option)
  })
  const compiler = series(
    cleanTask(cwd, gulpOptionsArr),
    parallel(...compileTasks),
  )

  return new Promise((resolve, reject) => {
    compiler((err) => {
      if (err) {
        return reject(new Error(err.message))
      }
      resolve('done')
    })
  })
}

function multipleOutputTask(cwd: string, gulpOptions: IGulpOptions) {
  const { output } = gulpOptions
  const empty: IGulpOutputOptions[] = []

  const tasks = empty.concat(output).map((out) => {
    return outputTask(cwd, out)
  })

  return parallel(...tasks)
}

function outputTask(cwd: string, outputOptions: IGulpOutputOptions) {
  const { dir, sourcemap = false } = outputOptions
  const dest = join(cwd, dir)

  const source = () => {
    return gulp.src(
      [
        'src/**/*',
        // 示例文件
        `!src/**/fixtures{,/**}`,
        `!src/**/demos{,/**}`,
        // markdown
        `!src/**/*.mdx`,
        `!src/**/*.md`,
        // 测试文件
        `!src/**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)`,
        `!src/**/__test__{,/**}`,
        `!src/**/__tests__{,/**}`,
        // storybook
        '!src/**/*.stories.mdx',
        '!src/**/*.stories.+(js|jsx|ts|tsx)',
        // tsconfig.json
        `!src/**/tsconfig{,.*}.json`,
      ],
      {
        cwd,
      },
    )
  }

  // 输出非 js 文件，如: css, d.ts 等
  const buildUnJSFile = () => {
    return source()
      .pipe(gulpIgnore.exclude(isJSFile))
      .pipe(
        gulpIf(
          isTSFile,
          gulpTs({
            noEmit: false,
            declaration: true,
            emitDeclarationOnly: true,
            isolatedModules: false,
          }),
        ),
      )
      .pipe(gulp.dest(dest))
  }

  // 编译 js、ts 并输出
  const buildJSFile = () => {
    return source()
      .pipe(gulpIgnore.exclude((f: vinyl) => !isJSFile(f) && !isTSFile(f)))
      .pipe(gulpIf(sourcemap, sourcemaps.init()))
      .pipe(gulpSwc())
      .pipe(gulpIf(sourcemap, sourcemaps.write('.')))
      .pipe(gulp.dest(dest))
  }

  return parallel(buildJSFile, buildUnJSFile)
}

function cleanTask(cwd: string, gulpOptions: IGulpOptions[]) {
  const dirs = new Set<string>()

  gulpOptions.forEach((options) => {
    const { output, clean } = options

    if (!clean) {
      return
    }

    safeArray(output).forEach((out) => {
      dirs.add(resolve(cwd, out.dir))
    })
  })

  return () => {
    return Promise.all(
      [...dirs].map((dir) => {
        return rm(dir, {
          force: true,
          recursive: true,
        })
      }),
    )
  }
}

function isTypeFile(f: vinyl) {
  return f.path.endsWith('.d.ts')
}

function isTSFile(f: vinyl) {
  return /\.tsx?$/.test(f.path) && !isTypeFile(f)
}

function isJSFile(f: vinyl) {
  return /\.jsx?$/.test(f.path)
}
