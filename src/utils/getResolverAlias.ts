import parseTsCompilerOptions from './parseTsCompilerOptions'
import produce from 'immer'

type Resolver = Record<string, string>

/**
 * 从 tsconfig 中解析别名
 *
 * @example
 * tsconfig 中的 paths 配置如下:
 * "paths": {
 *   "*": ["types/*"],
 *   "@/*": ["./src/*"],
 *   "utils/*": ["src/utils/*"],
 * },
 *
 * 期望返回:
 * {
 *   "@": "src",
 *   "utils": "src/utils"
 * }
 */
export default function getResolverAlias(cwd: string): Resolver | null {
  const compilerOptions = parseTsCompilerOptions(cwd)
  if (!compilerOptions || !compilerOptions.paths) {
    return null
  }
  const { paths } = compilerOptions
  const ignores = ['*']
  const defaults: Resolver = {}

  return Object.entries(paths).reduce((resolver, [key, values]) => {
    if (ignores.includes(key)) {
      return resolver
    }
    const alias = key.replace('/*', '')
    const resolved = values[0].replace('./', '').replace('/*', '')

    return produce(resolver, (draft) => {
      draft[alias] = resolved
    })
  }, defaults)
}
