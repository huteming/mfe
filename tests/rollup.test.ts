import { run } from '../src/footing'
import { distToMap, getDirCases } from './utils'
import { chdir } from 'node:process'
import path from 'path'

const CASES_DIR = path.join(__dirname, 'fixtures/rollup')

const cases = getDirCases(CASES_DIR)

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
      chdir(cwd)
      await run(['build', '--key', name])

      const fileMap = distToMap(path.join(CASES_DIR, name, 'lib'))

      require(`${CASES_DIR}/${name}/expect`).default(fileMap)
    })
  }
})
