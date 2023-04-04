import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'

export default function parseTsCompilerOptions(
  fileName?: string,
): ts.CompilerOptions | null {
  if (!fileName) {
    fileName = resolve(process.cwd(), 'tsconfig.json')
  }

  if (!existsSync(fileName)) {
    console.log(`tsconfig 文件不存在: ${fileName}`)
    return null
  }
  const configFile = ts.readConfigFile(fileName, ts.sys.readFile)

  const compilerOptions = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    dirname(fileName),
  )

  if (compilerOptions.errors && compilerOptions.errors.length) {
    console.log(`tsconfig 解析异常: ${fileName}`)
    console.log(compilerOptions.errors)
    return null
  }

  return compilerOptions.options
}
