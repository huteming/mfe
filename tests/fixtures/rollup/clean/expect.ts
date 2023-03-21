export default (files: Record<string, string>) => {
  expect(files['dir1/index.js']).toContain(`hello`)
  expect(files['dir2/index.js']).toContain(`hello`)

  expect('dir1/temp.txt' in files).toBeFalsy()
  expect('dir2/temp.txt' in files).toBeFalsy()
}
