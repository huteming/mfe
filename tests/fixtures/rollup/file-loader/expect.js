import { readFileSync } from 'fs'
import { join } from 'path'

export default (files) => {
  expect(files['index.js']).toContain(
    `require('file-loader!ace-builds/src-noconflict/worker-javascript.js')`,
  )
}
