import { sum } from '@/utils'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

test('expect window.hello exists', () => {
  expect(window.matchMedia).toBeTruthy()
  expect((window as any).hello).toEqual('hello')
})
