export default (files: Record<string, string>) => {
  expect(files['index.js'].includes(`require('ramda')`)).toBeFalsy()
}
