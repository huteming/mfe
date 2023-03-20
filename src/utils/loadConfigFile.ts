/**
 * https://github.com/rollup/rollup/blob/f049771dd0246cdbb461c70f85868d5402b4cd44/cli/run/loadConfigFile.ts#L85
 */
import typescript from '@rollup/plugin-typescript'
import { existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rollup } from 'rollup'

/**
 * 获取用户配置文件的导出内容
 * 1. 如果是 js 文件，直接 import
 * 2. 不是 js，通过 rollup 构建后，写入本地文件然后 import
 */
export default async function loadConfigFile(fileName?: string) {
  const safeFileName = getFileName(fileName)
  const ext = extname(safeFileName)

  if (ext === '.ts') {
    return loadTranspiledConfigFile(safeFileName)
  }
  return loadJSConfigFile(safeFileName)
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
    join(dirname(fileName), `rollup.config-${Date.now()}.mjs`),
    code,
  )
}

function getFileName(fileName?: string): string {
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

  throw new Error('缺少构建配置文件')
}

async function loadConfigFromWrittenFile(
  bundledFileName: string,
  bundledCode: string,
) {
  await writeFile(bundledFileName, bundledCode)
  try {
    return import(pathToFileURL(bundledFileName).href)
  } finally {
    unlink(bundledFileName)
  }
}
