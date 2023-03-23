import { IGulpOptions, IGulpOutputOptions } from '../types'
import gulpSwc from './plugins/swc'
import gulp, { parallel } from 'gulp'
import gulpIf from 'gulp-if'
import gulpIgnore from 'gulp-ignore'
import gulpTs from 'gulp-typescript'
import { join } from 'path'
import vinyl from 'vinyl'

export default function build(
  cwd: string,
  gulpOptions: IGulpOptions | IGulpOptions[],
) {
  const empty: IGulpOptions[] = []

  const tasks = empty.concat(gulpOptions).map((option) => {
    return multipleOutputTask(cwd, option)
  })
  const compiler = parallel(...tasks)

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
  const { dir, format = 'es' } = outputOptions
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

  const buildTypes = () => {
    return source()
      .pipe(gulpIgnore.exclude((f: vinyl) => !isTSFile(f)))
      .pipe(
        gulpTs({
          noEmit: false,
          declaration: true,
          emitDeclarationOnly: true,
          isolatedModules: false,
        }),
      )
      .pipe(gulp.dest(dest))
  }

  const compileFiles = () => {
    return source()
      .pipe(gulpIf((f: vinyl) => isTSFile(f) || isJSFile(f), gulpSwc()))
      .pipe(gulp.dest(dest))
  }

  return parallel(compileFiles, buildTypes)
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
