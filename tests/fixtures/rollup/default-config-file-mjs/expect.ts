export default (files) => {
  expect(files['index.js']).toContain(`hello world`)
  expect(files['index.js']).toContain(`export`)
}
