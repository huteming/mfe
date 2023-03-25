/**
 * https://github.com/rollup/rollup/blob/f049771dd0246cdbb461c70f85868d5402b4cd44/cli/run/loadConfigFile.ts#L85
 */
import { IConfigFileExports } from '../types'
import json from '@rollup/plugin-json'
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
  cwd: string,
  fileName?: string,
): Promise<IConfigFileExports> {
  const normalizedFileName = relativeFileName(cwd, fileName)
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
      json(),
      typescript({
        clean: true,
        check: false,
      }),
    ],
  }

  const bundle = await rollup(inputOptions)
  const {
    output: [{ code }],
  } = await bundle.generate({
    exports: 'named',
    format: 'cjs',
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
    join(dirname(fileName), `rollup.config-${Date.now()}.js`),
    code,
  )
}

function relativeFileName(cwd: string, fileName?: string): string | null {
  if (fileName) {
    return resolve(cwd, fileName)
  }

  const name = '.mferc'
  const exts = ['.ts', '.mjs', '.js']
  for (let i = 0; i < exts.length; i++) {
    const filePath = resolve(cwd, name + exts[i])
    if (existsSync(filePath)) {
      return filePath
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
    // error: segmentation fault in jest
    // 相关链接: https://github.com/nodejs/node/issues/35889
    // return await import(pathToFileURL(bundledFileName).href)
    return require(bundledFileName)
  } finally {
    unlink(bundledFileName)
  }
}
