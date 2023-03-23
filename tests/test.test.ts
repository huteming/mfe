import { distToMap, getDirCases } from './utils'
import path from 'path'
import shell from 'shelljs'

const CASES_DIR = path.join(__dirname, 'fixtures/test')

const cases = getDirCases(CASES_DIR)

async function run(command: string) {
  return new Promise((resolve, reject) => {
    shell.exec(command, { silent: false }, function (code, stdout, stderr) {
      // console.log('Exit code:', code)
      // console.log('Program output:', stdout);
      // console.log('Program stderr:', stderr);
      if (code === 1) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}

describe('test', () => {
  for (let name of cases) {
    // if (name !== 'setupFiles') {
    //   continue
    // }
    it(name, async () => {
      const cwd = path.join(CASES_DIR, name)
      shell.cd(cwd)
      await run('npm run test')
    })
  }
})
