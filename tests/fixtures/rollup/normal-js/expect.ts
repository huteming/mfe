export default (files: Record<string, string>) => {
  expect(files['index.js']).toContain(`hello world`)
  expect('index.d.ts' in files).toBeFalsy()

  expect(files['index.esm.js']).toContain(`hello world`)
  expect('index.esm.d.ts' in files).toBeFalsy()
}
