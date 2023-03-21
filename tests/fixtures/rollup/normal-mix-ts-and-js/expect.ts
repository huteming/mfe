export default (files: Record<string, string>) => {
  expect(files['index.js']).toContain(`parseInt`)
  expect(files['index.esm.js']).toContain(`parseInt`)

  expect('index.d.ts' in files).toBeFalsy()
  expect('index.esm.d.ts' in files).toBeFalsy()
  expect('utils.d.ts' in files).toBeTruthy()
}
