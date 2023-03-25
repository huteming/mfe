import { run } from '../src/footing'
import { getDirCases } from './utils'
import { chdir } from 'node:process'
import path from 'path'

const CASES_DIR = path.join(__dirname, 'fixtures/test')

const cases = getDirCases(CASES_DIR)

describe('test', () => {
  for (let name of cases) {
    // if (name !== 'setupFiles') {
    //   continue
    // }
    it(name, async () => {
      const cwd = path.join(CASES_DIR, name)

      chdir(cwd)
      await run(['test', '--key', name])
    })
  }
})
