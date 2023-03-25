import { BuildCommandOptions, IRollupOptions } from '../types'
import getRollupConfig from './getRollupConfig'
import { getOutDir } from './utils'
import { rm } from 'node:fs/promises'
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
  rollupOptions?: IRollupOptions | IRollupOptions[],
): Promise<any> {
  if (!rollupOptions) {
    return
  }

  const rollupInputs = Array.isArray(rollupOptions)
    ? rollupOptions
    : [rollupOptions]

  // 清空目标文件夹。
  await delAllOutDir(cwd, rollupInputs)

  const bundlers = rollupInputs.map((input) => {
    const mergedRollupOptions = getRollupConfig(cwd, input)
    return bundler(mergedRollupOptions)
  })

  return Promise.all(bundlers)
}

async function delAllOutDir(
  cwd: string,
  rollupOptions: IRollupOptions[],
): Promise<any> {
  const dirs = new Set<string>()

  rollupOptions.forEach((options) => {
    const { extraOptions, output } = options

    if (!extraOptions?.clean || !output) {
      return
    }
    const outputs = Array.isArray(output) ? output : [output]
    outputs.forEach((out) => {
      const dir = getOutDir(cwd, out)
      dirs.add(dir)
    })
  })

  return Promise.all(
    [...dirs].map((dir) => {
      return rm(dir, {
        force: true,
        recursive: true,
      })
    }),
  )
}
