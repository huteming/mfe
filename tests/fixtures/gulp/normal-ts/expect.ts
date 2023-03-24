export default (files: Record<string, string>) => {
  expect(files['index.js']).toContain(`index`)
  expect('index.d.ts' in files).toBeTruthy()

  expect(files['utils.js']).toContain(`utils`)
  expect('utils.d.ts' in files).toBeTruthy()
}
