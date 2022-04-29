import { rollup } from 'rollup'
import getRollupConfig from './getRollupConfig'
import {
  BuildCommandOptions,
  TransformedRollupConfig,
  UserRollupConfig,
} from '../types'
import { join, extname, relative } from 'path'
import produce from 'immer'
import del from 'del'
import getOutputDir from './getOutputDir'

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
  const { input, output, ...rest } = userConfig
  return output.map((out) => {
    return {
      input: join(cwd, input),
      output: produce(out, (draft) => {
        draft.file = join(cwd, draft.file)
      }),
      ...rest,
    }
  })
}

export default async function build(
  opts: RollupOpts,
  options: BuildCommandOptions,
) {
  const { cwd, userRollupConfig } = opts
  const rollupConfigs = transformRollupConfig(cwd, userRollupConfig)

  await Promise.all(
    rollupConfigs.map(async (rollupConfig) => {
      let bundle
      try {
        const { output, ...input } = getRollupConfig(
          {
            cwd,
            rollupConfig,
          },
          options,
        )
        // clean dir
        if (options.clean) {
          await del([`${getOutputDir(output)}/*`])
        }

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
