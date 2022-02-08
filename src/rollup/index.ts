import { rollup } from 'rollup'
import getRollupConfig from './getRollupConfig'
import { TransformedRollupConfig, UserRollupConfig } from '../types'
import { join, extname, relative } from 'path'
import produce from 'immer'

interface RollupOpts {
  cwd: string
  userRollupConfig: UserRollupConfig
}

/**
 * 铺平用户配置文件中的 input => output, 变为 1 对 1 的形式
 */
function transformRollupConfig(
  cwd: string,
  userConfig: UserRollupConfig,
): TransformedRollupConfig[] {
  const { input, output, plugins = [], extraBabelPlugins = [] } = userConfig
  return input.flatMap((inp) => {
    return output.map((out) => {
      return {
        input: join(cwd, inp),
        output: produce(out, (draft) => {
          draft.file = join(cwd, draft.file)
        }),
        plugins,
        extraBabelPlugins,
      }
    })
  })
}

export default async function build(opts: RollupOpts) {
  const { cwd, userRollupConfig } = opts
  const rollupConfigs = transformRollupConfig(cwd, userRollupConfig)

  await Promise.all(
    rollupConfigs.map(async (rollupConfig) => {
      let bundle
      try {
        const { output, ...input } = getRollupConfig({
          cwd,
          rollupConfig,
        })
        bundle = await rollup(input)
        await bundle.write(output)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        await bundle?.close()
      }
    }),
  )
}
