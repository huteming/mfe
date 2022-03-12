export function sum(a, b) {
  return a + b
}

export function optionalKey(obj?: any) {
  return obj?.key
}

export function optionalFunction(obj?: any) {
  return obj?.fn()
}
