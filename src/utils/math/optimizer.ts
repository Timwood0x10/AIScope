// Optimizer implementations

import type { Vector } from './vector'
import { scaleVector, subtract, add } from './vector'

export interface OptimizerState {
  position: Vector
  velocity?: Vector
  m?: Vector // First moment estimate
  v?: Vector // Second moment estimate
  t: number // Timestep
}

export const sgd = (
  position: Vector,
  gradient: Vector,
  learningRate: number
): Vector => {
  return subtract(position, scaleVector(gradient, learningRate))
}

export const momentum = (
  position: Vector,
  gradient: Vector,
  velocity: Vector,
  learningRate: number,
  momentumFactor: number = 0.9
): { position: Vector; velocity: Vector } => {
  const newVelocity = scaleVector(
    add(scaleVector(velocity, momentumFactor), gradient),
    learningRate
  )
  return {
    position: subtract(position, newVelocity),
    velocity: newVelocity,
  }
}

export const adam = (
  position: Vector,
  gradient: Vector,
  state: OptimizerState,
  learningRate: number = 0.001,
  beta1: number = 0.9,
  beta2: number = 0.999,
  epsilon: number = 1e-8
): OptimizerState => {
  const t = state.t + 1

  const m = state.m
    ? state.m.map((val, i) => beta1 * val + (1 - beta1) * gradient[i])
    : gradient.map((val) => (1 - beta1) * val)

  const v = state.v
    ? state.v.map((val, i) => beta2 * val + (1 - beta2) * gradient[i] * gradient[i])
    : gradient.map((val) => (1 - beta2) * val * val)

  const mHat = m.map((val) => val / (1 - Math.pow(beta1, t)))
  const vHat = v.map((val) => val / (1 - Math.pow(beta2, t)))

  const update = mHat.map((val, i) =>
    (learningRate * val) / (Math.sqrt(vHat[i]) + epsilon)
  )

  return {
    position: subtract(position, update),
    m,
    v,
    t,
  }
}

// Loss functions
export const sphere = (x: number, y: number): number => {
  return x * x + y * y
}

export const rosenbrock = (x: number, y: number): number => {
  return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2)
}

export const rastrigin = (x: number, y: number): number => {
  return 20 + x * x + y * y - 10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))
}

export const beale = (x: number, y: number): number => {
  const term1 = 1.5 - x + x * y
  const term2 = 2.25 - x + x * y * y
  const term3 = 2.625 - x + x * Math.pow(y, 3)
  return term1 * term1 + term2 * term2 + term3 * term3
}

export type LossFunction = (x: number, y: number) => number

export const lossFunctions: Record<string, { fn: LossFunction; bounds: [number, number, number, number] }> = {
  sphere: { fn: sphere, bounds: [-5, 5, -5, 5] },
  rosenbrock: { fn: rosenbrock, bounds: [-2, 2, -1, 3] },
  rastrigin: { fn: rastrigin, bounds: [-5, 5, -5, 5] },
  beale: { fn: beale, bounds: [-4.5, 4.5, -4.5, 4.5] },
}
