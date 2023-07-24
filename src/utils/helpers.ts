import { join } from 'node:path'

export function safeArray<T>(data: T[] | T) {
  const empty: T[] = []
  return empty.concat(data)
}

export function isTest(): boolean {
  // 'test' 是 jest 下的默认值
  const env: any = process.env.NODE_ENV
  return env === 'test'
}

/**
 * 获取静态文件目录
 */
export function getStaticDirPath(): string {
  const dirName = 'static'

  if (isTest()) {
    return join(__dirname, '../../', dirName)
  }

  return join(__dirname, '../', dirName)
}
