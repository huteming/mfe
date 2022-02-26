import { copy, pathExists } from '@/utils/copy'
import { join } from 'path'

interface MfercOpts {
  cwd: string
}

export default function mferc(opts: MfercOpts) {
  const { cwd } = opts
  const filename = '.mferc.ts'
  const from = join(__dirname, `../static/${filename}`)
  const to = join(cwd, filename)
  const exists = pathExists(to)
  if (exists) {
    return
  }
  copy(from, to)
}
