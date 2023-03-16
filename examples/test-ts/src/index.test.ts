import { optionalFunction, optionalKey, sum } from './index'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

test('optional-key', () => {
  expect(optionalKey({ key: 1 })).toEqual(1)
  expect(optionalKey()).toEqual(undefined)
})

test('optional-function', () => {
  expect(optionalFunction({ fn: jest.fn().mockReturnValue(1) })).toEqual(1)
  expect(optionalFunction()).toEqual(undefined)
})
