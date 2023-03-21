/**
 * https://github.com/rollup/rollup/blob/f049771dd0246cdbb461c70f85868d5402b4cd44/build-plugins/clean-before-write.ts
 */
import { rm } from 'node:fs/promises'
import type { Plugin } from 'rollup'

export default function cleanBeforeWrite(directory: string): Plugin {
  let removePromise: Promise<void>
  return {
    generateBundle(_options, _bundle, isWrite) {
      if (isWrite) {
        // Only remove before first write, but make all writes wait on the removal
        removePromise ??= rm(directory, {
          force: true,
          recursive: true,
        })
        return removePromise
      }
    },
    name: 'clean-before-write',
  }
}
