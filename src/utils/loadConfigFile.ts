/**
 * https://github.com/rollup/rollup/blob/f049771dd0246cdbb461c70f85868d5402b4cd44/cli/run/loadConfigFile.ts#L85
 */
import typescript from '@rollup/plugin-typescript'
import { unlink, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rollup } from 'rollup'

export default async function loadConfigFile(fileName?: string) {
  const safeFileName = getFileName(fileName)

  const inputOptions = {
    // 忽略 node_module 和 json 文件
    external: (id: string) => {
      const inNodeModule = id[0] !== '.' && !isAbsolute(id)
      const isJson = id.slice(-5, id.length) === '.json'
      return inNodeModule || isJson
    },
    input: safeFileName,
    plugins: [typescript()],
    treeshake: false,
  }

  const bundle = await rollup(inputOptions)
  const {
    output: [{ code }],
  } = await bundle.generate({
    exports: 'named',
    format: 'es',
    plugins: [
      {
        name: 'transpile-import-meta',
        resolveImportMeta(property, { moduleId }) {
          if (property === 'url') {
            return `'${pathToFileURL(moduleId).href}'`
          }
          if (property == null) {
            return `{url:'${pathToFileURL(moduleId).href}'}`
          }
        },
      },
    ],
  })
  return loadConfigFromWrittenFile(
    join(dirname(safeFileName), `rollup.config-${Date.now()}.mjs`),
    code,
  )
}

function getFileName(fileName?: string): string {
  const cwd = process.cwd()
  const defaults = '.mferc.ts'
  return resolve(cwd, fileName || defaults)
}

async function loadConfigFromWrittenFile(
  bundledFileName: string,
  bundledCode: string,
) {
  await writeFile(bundledFileName, bundledCode)
  try {
    return await import(pathToFileURL(bundledFileName).href)
  } finally {
    unlink(bundledFileName)
  }
}
