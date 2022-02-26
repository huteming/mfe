import { copy, pathExists } from '@/utils/copy'
import { join } from 'path'

const fileMap = {
  test: 'component.test.tsx',
}

export type TemplateFileType = keyof typeof fileMap

interface TemplateOpts {
  cwd: string
  type: TemplateFileType
}

export default function template(opts: TemplateOpts) {
  const { cwd, type } = opts
  const filename = fileMap[type]
  const from = join(__dirname, `../static/templates/${filename}`)
  const to = join(cwd, filename)
  const exists = pathExists(to)
  if (exists) {
    return
  }
  copy(from, to)
}
