export default (files) => {
  expect('index.esm.js' in files).toBeTruthy()
  expect(files['index.esm.js']).toContain(`hello world`)
  expect(files['index.esm.js']).toContain(`export`)

  expect('index.js' in files).toBeTruthy()
  expect(files['index.js']).toContain(`hello world`)
  expect(files['index.js']).toContain(`export`)
}
