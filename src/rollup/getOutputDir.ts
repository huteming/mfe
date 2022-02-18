import { BuildRollupConfigOutput } from '@/types'

export default function getOutputDir(output: BuildRollupConfigOutput) {
  const outPaths = output.file.split('/')
  return outPaths[outPaths.length - 2]
}
