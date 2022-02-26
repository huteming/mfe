import fs from 'fs'

export function pathExists(src: string) {
  try {
    fs.accessSync(src, fs.constants.F_OK)
    return true
  } catch (err) {
    return false
  }
}

/**
 * @example
 * copyFile('./a.txt', './aa.txt')
 */
function copyFile(from: string, to: string) {
  fs.writeFileSync(to, fs.readFileSync(from))
}

/**
 * @example
 * copyDir('./test', './new')
 */
function copyDir(from: string, to: string) {
  const exists = pathExists(to)
  if (!exists) {
    fs.mkdirSync(to)
  }
  const files = fs.readdirSync(from)
  files.forEach(function (file) {
    copy(`${from}/${file}`, `${to}/${file}`)
  })
}

export function copy(from: string, to: string) {
  const stat = fs.statSync(from)
  if (stat.isFile()) {
    copyFile(from, to)
    return
  }
  copyDir(from, to)
}
