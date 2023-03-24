import { distToMap, getDirCases } from './utils'
import execa from 'execa'
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
      await execa('npm', ['run', 'build'], { cwd })

      const fileMap = distToMap(path.join(CASES_DIR, name, 'dist'))

      require(`${CASES_DIR}/${name}/expect`).default(fileMap)
    })
  }
})
