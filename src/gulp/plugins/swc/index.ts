import { IGulpOutputOptions } from '../../../types'
import { transform as swcTransform } from '@swc/core'
import { extname, relative } from 'node:path'
import { Transform } from 'node:stream'
import PluginError from 'plugin-error'
import replaceExt from 'replace-ext'
import vinyl from 'vinyl'
import applySourceMap from 'vinyl-sourcemaps-apply'

function replaceExtension(fp: string) {
  return extname(fp) ? replaceExt(fp, '.js') : fp
}

export default function gulpSwc(outputOptions: IGulpOutputOptions) {
  const { sourcemap } = outputOptions

  return new Transform({
    objectMode: true,
    transform(file: vinyl, enc, cb) {
      if (file.isNull()) {
        cb(null, file)
        return
      }

      if (file.isStream()) {
        cb(new PluginError('gulp-swc', 'Streaming not supported'))
        return
      }

      const isTypeScript = file.path.endsWith('.ts')

      swcTransform(file.contents!.toString(), {
        jsc: {
          parser: {
            syntax: isTypeScript ? 'typescript' : 'ecmascript',
          },
        },
        sourceMaps: sourcemap,
      })
        .then((res) => {
          if (res) {
            // 源文件
            if (file.sourceMap && res.map) {
              const sourcemaps = JSON.parse(res.map)
              sourcemaps.file = replaceExtension(file.relative)
              sourcemaps.sources = sourcemaps.sources.map((filePath: any) => {
                return file.path === filePath
                  ? replaceExtension(file.relative)
                  : replaceExtension(relative(file.path, filePath))
              })
              applySourceMap(file, sourcemaps)
            }

            // swc 编译文件
            file.contents = Buffer.from(res.code)
            file.path = replaceExtension(file.path)
          }

          this.push(file)
        })
        .catch((error) => {
          this.emit(
            'error',
            new PluginError('gulp-swc', error, {
              fileName: file.path,
              showProperties: false,
            }),
          )
        })
        .then(
          () => cb(),
          () => cb(),
        )
    },
  })
}
