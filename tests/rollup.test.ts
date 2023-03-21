import { distToMap, getDirCases } from './utils'
import path from 'path'
import shell from 'shelljs'

const CASES_DIR = path.join(__dirname, 'fixtures/rollup')

const cases = getDirCases(CASES_DIR)

async function run(command: string) {
  return new Promise((resolve) => {
    shell.exec(command, { silent: false }, function (code, stdout, stderr) {
      // console.log('Exit code:', code);
      // console.log('Program output:', stdout);
      // console.log('Program stderr:', stderr);
      resolve(code)
    })
  })
}

describe('rollup', () => {
  let spyLog

  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log').mockImplementation(jest.fn())
  })

  afterEach(() => {
    spyLog.mockRestore()
  })

  for (let name of cases) {
    // if (name !== 'clean') {
    //   continue
    // }
    it(name, async () => {
      const cwd = path.join(CASES_DIR, name)
      shell.cd(cwd)
      await run('npm run build')

      const fileMap = distToMap(path.join(CASES_DIR, name, 'lib'))

      require(`${CASES_DIR}/${name}/expect`).default(fileMap)
    })
  }
})
