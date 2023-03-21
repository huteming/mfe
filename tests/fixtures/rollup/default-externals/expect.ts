export default (files: Record<string, string>) => {
  expect(files['index.js']).toContain(`require('ramda')`)
}
