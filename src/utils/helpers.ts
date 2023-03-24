export function safeArray<T>(data: T[] | T) {
  const empty: T[] = []
  return empty.concat(data)
}
