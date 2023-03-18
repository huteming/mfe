import { isAbsolute, normalize, relative } from 'path'

export default function ensureRelative(root: string, p: string): string {
  if (!isAbsolute(p)) {
    return normalize(p)
  }

  return relative(root, p)
}
