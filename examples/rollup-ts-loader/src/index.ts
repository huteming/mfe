import ace from 'ace-builds'
// @ts-ignore
import jsWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-javascript.js'
ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl)

export default (s: string) => {
  console.log('hello world', s)
}
