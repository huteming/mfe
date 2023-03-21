export default (files: Record<string, string>) => {
  expect(files['index.js']).toContain(
    `require('file-loader!ace-builds/src-noconflict/worker-javascript.js')`,
  )
}
