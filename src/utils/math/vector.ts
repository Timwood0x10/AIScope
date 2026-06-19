// Vector operations

export type Vector = number[]

export const createVector = (size: number, fill: number = 0): Vector => {
  return Array(size).fill(fill)
}

export const randomVector = (size: number, scale: number = 1): Vector => {
  return Array(size)
    .fill(0)
    .map(() => (Math.random() - 0.5) * 2 * scale)
}

export const dotProduct = (a: Vector, b: Vector): number => {
  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

export const magnitude = (v: Vector): number => {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0))
}

export const cosineSimilarity = (a: Vector, b: Vector): number => {
  const dot = dotProduct(a, b)
  const magA = magnitude(a)
  const magB = magnitude(b)

  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

export const euclideanDistance = (a: Vector, b: Vector): number => {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
  )
}

export const normalize = (v: Vector): Vector => {
  const mag = magnitude(v)
  if (mag === 0) return v
  return v.map((val) => val / mag)
}

export const add = (a: Vector, b: Vector): Vector => {
  return a.map((val, i) => val + b[i])
}

export const subtract = (a: Vector, b: Vector): Vector => {
  return a.map((val, i) => val - b[i])
}

export const scaleVector = (v: Vector, factor: number): Vector => {
  return v.map((val) => val * factor)
}
