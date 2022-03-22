export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomElement<T>(array: T[]) {
  return array[randomInteger(0, array.length - 1)]
}
