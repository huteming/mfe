export default (files: Record<string, string>) => {
  expect('index.esm.js' in files).toBeTruthy()
  expect(files['index.esm.js']).toContain(`hello world`)

  expect('index.js' in files).toBeTruthy()
  expect(files['index.js']).toContain(`hello world`)
}
