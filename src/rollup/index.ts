import { BuildCommandOptions, IRollupOptions } from '../types'
import getRollupConfig from './getRollupConfig'
import del from 'del'
import { RollupBuild, rollup } from 'rollup'
import { getOutDir } from './utils'

export default async function build(
  cwd: string,
  rollupOptions: IRollupOptions,
  options: BuildCommandOptions,
) {
  let bundle: RollupBuild | null = null
  let buildFailed = false

  try {
    // 一个 output 对象对应一个输出
    if (!rollupOptions.output) {
      throw new Error('缺少 output 配置')
    }

    const normalizedRollupOptions = getRollupConfig(cwd, rollupOptions, options)
    bundle = await rollup(normalizedRollupOptions)

    const outOptions = Array.isArray(rollupOptions.output)
      ? rollupOptions.output
      : [rollupOptions.output]
    const outPromises = outOptions.map(async (outOption) => {
      // 清空目标文件夹
      if (options.clean) {
        const outDir = getOutDir(cwd, outOption)
        if (outDir) {
          await del([`${outDir}/*`])
        }
      }
      // 输出文件
      return bundle!.write(outOption)
    })

    await Promise.all(outPromises)
  } catch (err) {
    buildFailed = true
    console.error(err)
  } finally {
    await bundle?.close()
  }

  process.exit(buildFailed ? 1 : 0)
}
