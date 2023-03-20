import { readFileSync } from 'fs'
import { join } from 'path'

export default (files) => {
  expect(files['index.js']).toContain(`hello world`)
}
