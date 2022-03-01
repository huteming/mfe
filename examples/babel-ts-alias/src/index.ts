import type { Args } from '@/types'
import utils from '@/utils'
import aa from '@/aa/aa'
import bb from 'bb/bb'

export default (s: Args) => {
  console.log('hello world', s.a)
  utils()
  aa()
  bb()
}
