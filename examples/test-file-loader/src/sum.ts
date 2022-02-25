import ace from 'ace-builds'
// @ts-ignore
import jsWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-javascript.js'
ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl)

export default function sum(a, b) {
  return a + b
}
