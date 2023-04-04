import parseTsCompilerOptions from './parseTsCompilerOptions'
import { produce } from 'immer'

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
export default function getTsCompilerPaths(
  cwd: string,
): Record<string, string> | null {
  const compilerOptions = parseTsCompilerOptions()
  if (!compilerOptions || !compilerOptions.paths) {
    return null
  }
  const { paths } = compilerOptions
  const ignores = ['*']
  const defaults: Record<string, string> = {}

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
