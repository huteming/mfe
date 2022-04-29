import { IRollupOutputOptions } from '@/types'

export default function getOutputDir(output: IRollupOutputOptions) {
  const outPaths = output.file.split('/')
  return outPaths[outPaths.length - 2]
}
