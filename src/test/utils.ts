import getTsCompilerPaths from '@/utils/getTsCompilerPaths'
import { produce } from 'immer'

export function getAliasFromTsConfig(cwd: string): Record<string, string> {
  const paths = getTsCompilerPaths(cwd)
  if (!paths) {
    return {
      '^@/(.*)': '<rootDir>/src/$1',
    }
  }
  const alias: Record<string, string> = {}
  return Object.entries(paths).reduce((edit, [key, value]) => {
    return produce(edit, (draft) => {
      draft[`^${key}/(.*)`] = `<rootDir>/${value}/$1`
    })
  }, alias)
}
