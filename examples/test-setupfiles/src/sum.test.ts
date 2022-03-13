import sum from './sum'

test('adds 1 + 2 to equal 3', () => {
  expect(window.matchMedia).toBeTruthy()
  expect((window as any).hello).toEqual('hello')
  expect(sum(1, 2)).toBe(3)
})

// test('adds 1 + 2 to equal 3', () => {
//   expect(window.matchMedia).toBeFalsy()
//   expect((window as any).hello).toEqual('hello')
//   expect(sum(1, 2)).toBe(3)
// })
