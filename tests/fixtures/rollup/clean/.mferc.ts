import fs, { existsSync } from 'node:fs'

const dir1 = './lib/dir1'
const dir2 = './lib/dir2'

createTempFile(dir1)
createTempFile(dir2)

function createTempFile(dir) {
  if (!existsSync('./lib')) {
    fs.mkdirSync('./lib')
  }
  if (!existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  if (!existsSync(`${dir}/temp.txt`)) {
    fs.writeFileSync(`${dir}/temp.txt`, 'hello world', 'utf-8')
  }
}

export const rollup = [
  {
    input: 'src/index.js',
    output: [
      {
        file: `${dir1}/index.js`,
        format: 'es',
      },
    ],
    extraOptions: {
      clean: true,
    },
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: `${dir2}/index.js`,
        format: 'es',
      },
    ],
    extraOptions: {
      clean: true,
    },
  },
]
