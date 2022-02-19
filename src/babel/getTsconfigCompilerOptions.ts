import { relative } from 'path'
// Convert Windows backslash paths to slash paths: foo\\bar ➔ foo/bar
// https://www.npmjs.com/package/slash2
import ts from 'typescript'

// 主要难点在于如何处理 tsconfig 中的 extends
// https://github.com/umijs/father/blob/master/packages/father-build/src/babel.ts
function parseTsconfig(fileName: string): any {
  const result = ts.readConfigFile(fileName, ts.sys.readFile)
  if (result.error) {
    return
  }
  const pkgTsConfig = result.config
  if (pkgTsConfig.extends) {
    const rootTsConfigPath = relative(__dirname, pkgTsConfig.extends)
    const rootTsConfig = parseTsconfig(rootTsConfigPath)
    if (rootTsConfig) {
      const mergedConfig = {
        ...rootTsConfig,
        ...pkgTsConfig,
        compilerOptions: {
          ...rootTsConfig.compilerOptions,
          ...pkgTsConfig.compilerOptions,
        },
      }
      return mergedConfig
    }
  }
  return pkgTsConfig
}

// https://stackoverflow.com/questions/67956755/how-to-compile-tsconfig-json-into-a-config-object-using-typescript-api
export default function getTsconfigCompilerOptions(fileName: string) {
  const config = parseTsconfig(fileName)
  return config ? config.compilerOptions : undefined
}

// const tsCompilerOptions = ((): object => {
//   const tsconfigPath = join(cwd, 'tsconfig.json')
//   const templateTsconfigPath = join(
//     __dirname,
//     '../template/default-tsconfig.json',
//   )

//   if (existsSync(tsconfigPath)) {
//     return getTsconfigCompilerOptions(tsconfigPath) || {}
//   }
//   return getTsconfigCompilerOptions(templateTsconfigPath) || {}
// })()
