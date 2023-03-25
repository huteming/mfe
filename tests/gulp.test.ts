import { run } from '../src/footing'
import { distToMap, getDirCases } from './utils'
import { chdir } from 'node:process'
import path from 'path'

const CASES_DIR = path.join(__dirname, 'fixtures/gulp')

const cases = getDirCases(CASES_DIR)

describe('test', () => {
  for (let name of cases) {
    // if (name !== 'alias') {
    //   continue
    // }
    it(name, async () => {
      const cwd = path.join(CASES_DIR, name)

      chdir(cwd)
      await run(['build', '--key', name])

      const fileMap = distToMap(path.join(CASES_DIR, name, 'dist'))

      require(`${CASES_DIR}/${name}/expect`).default(fileMap)
    })
  }
})
