import { readFileSync } from 'fs'
import { join } from 'path'

export default (files) => {
  expect(files['index.js']).toContain(`hello world`)
  expect('index.d.ts' in files).toBeFalsy()

  expect(files['index.esm.js']).toContain(`hello world`)
  expect('index.esm.d.ts' in files).toBeFalsy()
}
