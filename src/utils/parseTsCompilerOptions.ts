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
  // console.log('configFile', configFile)
  const compilerOptions = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    './',
  )
  // console.log('compilerOptions', compilerOptions)
  return compilerOptions.options
}
