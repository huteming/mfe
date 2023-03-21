export default (files: Record<string, string>) => {
  expect(files['index.js']).toContain(`hello world`)
  expect(files['index.esm.js']).toContain(`hello world`)

  expect('index.d.ts' in files).toBeTruthy()
  expect('index.esm.d.ts' in files).toBeFalsy()
  expect('utils.d.ts' in files).toBeTruthy()
}
