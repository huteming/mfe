import swc from '@swc/core'
import { extname } from 'node:path'
import { Transform } from 'node:stream'
import PluginError from 'plugin-error'
import replaceExt from 'replace-ext'
import vinyl from 'vinyl'

function replaceExtension(fp: string) {
  return extname(fp) ? replaceExt(fp, '.js') : fp
}

export default function gulpSwc() {
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

      swc
        .transform(file.contents!.toString(), {
          jsc: {
            parser: {
              syntax: isTypeScript ? 'typescript' : 'ecmascript',
            },
          },
        })
        .then((res) => {
          if (res) {
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
