import type { Args } from '@/types'
import utils from '@/utils'

export default (s: Args) => {
  console.log('hello world', s.a)
  utils()
}
