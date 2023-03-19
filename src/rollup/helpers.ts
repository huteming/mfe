import type { IRollupOptions } from '../types'
import logger from '@/utils/logger'
import { produce } from 'immer'
import { ModuleFormat } from 'rollup'

export function defineESMBuilds(options: IRollupOptions): IRollupOptions {
  return setOutputFormat('defineESMBuilds', options, 'es', (cur) => {
    return ['es'].includes(cur)
  })
}

export function defineCommonJSBuilds(options: IRollupOptions): IRollupOptions {
  return setOutputFormat('defineCommonJSBuilds', options, 'cjs', (cur) => {
    return ['cjs'].includes(cur)
  })
}

export function defineBrowserBuilds(options: IRollupOptions): IRollupOptions {
  return setOutputFormat('defineBrowserBuilds', options, 'umd', (cur) => {
    return ['umd', 'iife'].includes(cur)
  })
}

function setOutputFormat(
  context: string,
  options: IRollupOptions,
  targetFormat: 'es' | 'cjs' | 'umd',
  isValid: (cur: ModuleFormat) => boolean,
): IRollupOptions {
  return produce(options, (draft) => {
    if (!draft.output) {
      return
    }

    // 1. extraOptions.format
    if (!draft.extraOptions) {
      draft.extraOptions = {}
    }
    draft.extraOptions.format = targetFormat

    // 2. output.format
    const output = Array.isArray(draft.output) ? draft.output : [draft.output]

    output.forEach((out) => {
      if (!out.format) {
        out.format = 'es' // 这个是官方默认值
      }
      if (!isValid(out.format)) {
        logger.info(`${context} 中的 output.format 被改写为 ${targetFormat}`)
        out.format = targetFormat
      }
    })
  })
}
