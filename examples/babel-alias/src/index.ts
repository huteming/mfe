import type { Args } from '@/types'
import utils from '@/utils'
import bb from '@/aa/bb'

export default (s: Args) => {
  console.log('hello world', s.a)
  utils()
  bb()
}
