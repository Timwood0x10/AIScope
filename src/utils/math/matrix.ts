// Matrix operations for attention mechanism

export type Matrix = number[][]

export const createMatrix = (rows: number, cols: number, fill: number = 0): Matrix => {
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(fill))
}

export const randomMatrix = (rows: number, cols: number, scale: number = 0.1): Matrix => {
  return Array(rows)
    .fill(0)
    .map(() =>
      Array(cols)
        .fill(0)
        .map(() => (Math.random() - 0.5) * 2 * scale)
    )
}

export const matrixMultiply = (a: Matrix, b: Matrix): Matrix => {
  const rowsA = a.length
  const colsA = a[0].length
  const colsB = b[0].length

  const result = createMatrix(rowsA, colsB)

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }

  return result
}

export const transpose = (matrix: Matrix): Matrix => {
  const rows = matrix.length
  const cols = matrix[0].length
  const result = createMatrix(cols, rows)

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j]
    }
  }

  return result
}

export const softmax = (matrix: Matrix): Matrix => {
  return matrix.map((row) => {
    const maxVal = Math.max(...row)
    const exps = row.map((val) => Math.exp(val - maxVal))
    const sumExp = exps.reduce((sum, exp) => sum + exp, 0)
    return exps.map((exp) => exp / sumExp)
  })
}

export const scale = (matrix: Matrix, factor: number): Matrix => {
  return matrix.map((row) => row.map((val) => val * factor))
}

export const attention = (
  Q: Matrix,
  K: Matrix,
  V: Matrix,
  scaleFactor: number = 1
): { output: Matrix; attentionWeights: Matrix } => {
  const K_T = transpose(K)
  const QK_T = matrixMultiply(Q, K_T)
  const scaledQK_T = scale(QK_T, scaleFactor)
  const attentionWeights = softmax(scaledQK_T)
  const output = matrixMultiply(attentionWeights, V)

  return { output, attentionWeights }
}

export const multiHeadAttention = (
  Q: Matrix,
  K: Matrix,
  V: Matrix,
  numHeads: number,
  headDim: number
): { output: Matrix; attentionWeights: Matrix[] } => {
  const { output, attentionWeights } = attention(Q, K, V, 1 / Math.sqrt(headDim))

  const headSize = Math.floor(output.length / numHeads)
  const heads: Matrix[] = []
  const weightsPerHead: Matrix[] = []

  for (let h = 0; h < numHeads; h++) {
    const startRow = h * headSize
    heads.push(output.slice(startRow, startRow + headSize))
    weightsPerHead.push(attentionWeights.slice(startRow, startRow + headSize))
  }

  const concatenated = heads.reduce((acc, head) => acc.concat(head), [])

  return { output: concatenated, attentionWeights: weightsPerHead }
}
