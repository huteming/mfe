/**
 * https://github.com/rollup/rollup/blob/f049771dd0246cdbb461c70f85868d5402b4cd44/cli/run/loadConfigFile.ts#L85
 */
import { IConfigFileExports } from '../types'
import { existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rollup } from 'rollup'
import typescript from 'rollup-plugin-typescript2'

/**
 * 获取用户配置文件的导出内容
 * 1. 如果是 js 文件，直接 import
 * 2. 不是 js，通过 rollup 构建后，写入本地文件然后 import
 */
export default async function loadConfigFile(
  fileName?: string,
): Promise<IConfigFileExports> {
  const normalizedFileName = relativeFileName(fileName)
  if (!normalizedFileName) {
    return {}
  }
  const ext = extname(normalizedFileName)

  if (ext === '.ts') {
    return loadTranspiledConfigFile(normalizedFileName)
  }
  return loadJSConfigFile(normalizedFileName)
}

async function loadJSConfigFile(fileName: string) {
  if (extname(fileName) === '.mjs') {
    const fileUrl = pathToFileURL(fileName)
    return import(fileUrl.href)
  }

  return require(fileName)
}

async function loadTranspiledConfigFile(fileName: string) {
  const inputOptions = {
    // 忽略 node_module 和 json 文件
    external: (id: string) => {
      const inNodeModule = id[0] !== '.' && !isAbsolute(id)
      const isJson = id.slice(-5, id.length) === '.json'
      return inNodeModule || isJson
    },
    input: fileName,
    plugins: [
      typescript({
        clean: true,
        check: false,
      }),
    ],
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
    join(dirname(fileName), `rollup.config-${Date.now()}.mjs`),
    code,
  )
}

function relativeFileName(fileName?: string): string | null {
  const cwd = process.cwd()

  if (fileName) {
    return resolve(cwd, fileName)
  }

  const name = '.mferc'
  const exts = ['.ts', '.mjs', '.js']
  for (let i = 0; i < exts.length; i++) {
    const expectFile = name + exts[i]
    if (existsSync(expectFile)) {
      return resolve(cwd, expectFile)
    }
  }

  return null
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
