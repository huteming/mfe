import { BuildCommandOptions, IRollupOptions } from '../types'
import getRollupConfig from './getRollupConfig'
import { getOutDir } from './utils'
import del from 'del'
import { RollupBuild, RollupOptions, rollup } from 'rollup'

async function bundler(
  cwd: string,
  rollupOptions: RollupOptions,
  options: BuildCommandOptions,
) {
  let bundle: RollupBuild | null = null

  try {
    if (!rollupOptions.output) {
      throw new Error('缺少 output 配置')
    }

    bundle = await rollup(rollupOptions)

    const outOptions = Array.isArray(rollupOptions.output)
      ? rollupOptions.output
      : [rollupOptions.output]

    const outPromises = outOptions.map(async (outOption) => {
      // 清空目标文件夹。
      // 每个 output 单独输出，清理变得困难了
      // if (options.clean) {
      //   const outDir = getOutDir(cwd, outOption)
      //   if (outDir) {
      //     await del([`${outDir}/*`])
      //   }
      // }
      // 输出文件
      return bundle!.write(outOption)
    })

    await Promise.all(outPromises)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    await bundle?.close()
  }
}

export default async function build(
  cwd: string,
  rollupOptions: IRollupOptions | IRollupOptions[],
  options: BuildCommandOptions,
) {
  const rollupInputs = Array.isArray(rollupOptions)
    ? rollupOptions
    : [rollupOptions]

  const bundlers = rollupInputs.map((input) => {
    const opt = getRollupConfig(cwd, input, options)
    return bundler(cwd, opt, options)
  })

  return Promise.all(bundlers)
}
