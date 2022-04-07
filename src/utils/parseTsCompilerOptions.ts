import ts from 'typescript'
import { existsSync } from 'fs'
import { join } from 'path'

export default function parseTsCompilerOptions(
  cwd: string,
): ts.CompilerOptions | null {
  // 会自动向上查找
  // const configFileName = ts.findConfigFile(
  //   cwd,
  //   ts.sys.fileExists,
  //   'tsconfig.json',
  // )
  const configFileName = join(cwd, 'tsconfig.json')
  if (!existsSync(configFileName)) {
    return null
  }
  // console.log('configFileName', configFileName)
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile)

  const compilerOptions = ts.parseJsonConfigFileContent(
    // tsconfig.json 完整配置，包括 include 等
    configFile.config,
    ts.sys,
    './',
  )

  // 错误处理，没找到官方的处理方式，暂时忽略
  // 注意返回的是个数组。没有错误的时候，是个空数组？有待研究
  // if (compilerOptions.errors && compilerOptions.errors.length) {
  //   return null
  // }

  // console.log('compilerOptions', compilerOptions)
  return compilerOptions.options
}
