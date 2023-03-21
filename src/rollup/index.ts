import { BuildCommandOptions, IRollupOptions } from '../types'
import getRollupConfig from './getRollupConfig'
import { getOutDir } from './utils'
import del from 'del'
import { RollupBuild, RollupOptions, rollup } from 'rollup'

async function bundler(rollupOptions: RollupOptions) {
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
      // 输出文件
      return bundle!.write(outOption)
    })

    await Promise.all(outPromises)
  } finally {
    await bundle?.close()
  }
}

export default async function build(
  cwd: string,
  rollupOptions: IRollupOptions | IRollupOptions[],
  options: BuildCommandOptions,
) {
  // // 清空目标文件夹。
  // if (options.clean) {
  //   const outDir = getOutDir(cwd, outOption)
  //   if (outDir) {
  //     await del([`${outDir}/*`])
  //   }
  // }

  const rollupInputs = Array.isArray(rollupOptions)
    ? rollupOptions
    : [rollupOptions]

  const bundlers = rollupInputs.map((input) => {
    const mergedRollupOptions = getRollupConfig(cwd, input)
    return bundler(mergedRollupOptions)
  })

  return Promise.all(bundlers)
}
