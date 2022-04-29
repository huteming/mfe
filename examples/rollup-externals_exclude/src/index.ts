import { always, curry } from 'ramda'

export default curry(function add(a: number, b: number) {
  return a + b
})
