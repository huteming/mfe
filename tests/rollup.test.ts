import path from 'path'
import shell from 'shelljs'
import { distToMap, getDirCases } from './utils'

const CASES_DIR = path.join(__dirname, 'fixtures/rollup')

const cases = getDirCases(CASES_DIR)

async function run(command: string) {
  return new Promise((resolve) => {
    shell.exec(command, function(code, stdout, stderr) {
      console.log('Exit code:', code);
      console.log('Program output:', stdout);
      console.log('Program stderr:', stderr);
      resolve(code)
    })
  })
}

for (let name of cases) {
    test(`rollup: ${name}`, async () => {
        const cwd = path.join(CASES_DIR, name)
        shell.cd(cwd)
        await run('npm run build')

        const fileMap = distToMap(path.join(CASES_DIR, name, 'lib'))
        console.log('filemap', fileMap)

        require(`${CASES_DIR}/${name}/expect`).default(fileMap)
    })
}
