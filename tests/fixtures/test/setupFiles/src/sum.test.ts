// const sum = require('./sum');
import sum from './sum'

test('expect window.hello exists', () => {
  expect(sum(1, 2)).toBe(3)

  expect(window.matchMedia).toBeTruthy()
  expect((window as any).hello).toEqual('hello')
})
