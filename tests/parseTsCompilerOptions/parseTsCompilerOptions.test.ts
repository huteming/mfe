import parse from '../../src/utils/parseTsCompilerOptions'
import { fileURLToPath } from 'node:url'

describe('parseTsCompilerOptions', () => {
  let spyLog

  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log').mockImplementation(jest.fn())
  })

  afterEach(() => {
    spyLog.mockRestore()
  })

  it('不传参数默认解析 process.cwd 下的 tsconfig.json', () => {
    const options = parse()

    expect(options?.strict).toBe(true)
  })

  it('能够解析 extends', () => {
    const options = parse(
      fileURLToPath(new URL('./config.json', import.meta.url)),
    )

    expect(options?.strict).toBe(false)
  })

  it('文件不存在时返回 null', () => {
    const options = parse(
      fileURLToPath(new URL('../config.json', import.meta.url)),
    )

    expect(options).toBe(null)
    expect(spyLog).toBeCalledTimes(1)
  })
})
