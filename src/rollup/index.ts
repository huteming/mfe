import { rollup } from 'rollup'
import getRollupConfig from './getRollupConfig'
import { InternalRollupConfig, UserRollupConfig } from '../types'
import { join, extname, relative } from 'path'
import produce from 'immer'

interface RollupOpts {
  cwd: string
  userRollupConfig: UserRollupConfig
}

/**
 * 铺平用户配置文件中的 input => output, 变为 1 对 1 的形式
 */
function flatUserRollupConfig(
  cwd: string,
  userConfig: UserRollupConfig,
): InternalRollupConfig[] {
  return userConfig.input.flatMap((input) => {
    return userConfig.output.map((output) => {
      return {
        input: join(cwd, input),
        output: produce(output, (draft) => {
          draft.file = join(cwd, draft.file)
        }),
      }
    })
  })
}

export default async function build(opts: RollupOpts) {
  const { cwd, userRollupConfig } = opts
  const rollupConfigs = flatUserRollupConfig(cwd, userRollupConfig).map(
    (config) =>
      getRollupConfig({
        cwd,
        internalRollupConfig: config,
      }),
  )

  await Promise.all(
    rollupConfigs.map(async (rollupConfig) => {
      let bundle
      try {
        const { output, ...input } = rollupConfig
        bundle = await rollup(input)
        // 删除一些自定义的属性
        const allowedOutput = produce(output, (draft) => {
          delete draft.target
        })

        await bundle.write(allowedOutput)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        await bundle?.close()
      }
    }),
  )
}
