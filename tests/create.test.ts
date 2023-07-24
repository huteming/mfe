import { run } from '../src/footing'
import { distToMap } from './utils'
import { chdir } from 'node:process'
import path from 'path'

describe('create', () => {
  it('create a project', async () => {
    const cwd = path.join(__dirname, 'fixtures/create')
    const name = 'default-project'

    chdir(cwd)
    await run(['create', name])

    const fileMap = distToMap(path.join(cwd, name))

    expect('package.json' in fileMap).toBeTruthy()
    expect(fileMap['package.json']).toContain(name)
  })
})
