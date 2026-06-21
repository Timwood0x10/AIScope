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

// --- Additional utilities for interactive visualizations ---

export const layerNorm = (matrix: Matrix, eps: number = 1e-5): Matrix => {
  return matrix.map((row) => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length
    const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length
    const std = Math.sqrt(variance + eps)
    return row.map((val) => (val - mean) / std)
  })
}

export const addMatrices = (a: Matrix, b: Matrix): Matrix => {
  return a.map((row, i) => row.map((val, j) => val + b[i][j]))
}

export const elementwiseMultiply = (a: Matrix, b: Matrix): Matrix => {
  return a.map((row, i) => row.map((val, j) => val * b[i][j]))
}

// RoPE: Rotate Q/K vectors to encode position information
export const ropeRotate = (matrix: Matrix, base: number = 10000): Matrix => {
  const rows = matrix.length
  const cols = matrix[0].length
  const dim = cols

  return matrix.map((row, m) => {
    // m = position index
    const rotated = [...row]
    for (let i = 0; i < dim / 2; i++) {
      const theta = m / Math.pow(base, (2 * i) / dim)
      const cosVal = Math.cos(theta)
      const sinVal = Math.sin(theta)
      const x = row[2 * i]
      const y = row[2 * i + 1]
      rotated[2 * i] = x * cosVal - y * sinVal
      rotated[2 * i + 1] = x * sinVal + y * cosVal
    }
    return rotated
  })
}

// Generate simple causal mask (upper triangular = -inf)
export const causalMask = (length: number): Matrix => {
  const result: Matrix = []
  for (let i = 0; i < length; i++) {
    const row: number[] = []
    for (let j = 0; j < length; j++) {
      row.push(j <= i ? 1 : -Infinity)
    }
    result.push(row)
  }
  return result
}

// FFN: Linear -> ReLU -> Linear
export const relu = (matrix: Matrix): Matrix => {
  return matrix.map((row) => row.map((val) => Math.max(0, val)))
}

export const gelu = (matrix: Matrix): Matrix => {
  const c = Math.sqrt(2 / Math.PI)
  return matrix.map((row) =>
    row.map((x) => 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * Math.pow(x, 3)))))
  )
}

// FFN with GELU activation
export const ffn = (
  input: Matrix,
  hiddenDim: number
): { hidden: Matrix; output: Matrix } => {
  const rows = input.length
  const cols = input[0].length

  // W1: d_model x hidden_dim
  const W1 = randomMatrix(cols, hiddenDim, 0.5)
  // W2: hidden_dim x d_model
  const W2 = randomMatrix(hiddenDim, cols, 0.5)

  const hidden = gelu(matrixMultiply(input, W1))
  const output = matrixMultiply(hidden, W2)

  return { hidden, output }
}

// Softmax for a single row (for visualization)
export const softmax1D = (values: number[], temperature: number = 1): number[] => {
  const scaled = values.map((v) => v / temperature)
  const maxVal = Math.max(...scaled)
  const exps = scaled.map((v) => Math.exp(v - maxVal))
  const sumExp = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sumExp)
}

// Compute row and column statistics
export const rowMean = (matrix: Matrix): number[] => {
  return matrix.map((row) => row.reduce((a, b) => a + b, 0) / row.length)
}

export const rowStd = (matrix: Matrix): number[] => {
  return matrix.map((row) => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length
    const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length
    return Math.sqrt(variance)
  })
}

// Dot product of two vectors
export const dotProduct = (a: number[], b: number[]): number => {
  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

// Cosine similarity
export const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = dotProduct(a, b)
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0))
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0))
  return normA * normB === 0 ? 0 : dot / (normA * normB)
}

// Similarity matrix (all pairs)
export const similarityMatrix = (matrix: Matrix): Matrix => {
  const n = matrix.length
  const result: Matrix = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      row.push(cosineSimilarity(matrix[i], matrix[j]))
    }
    result.push(row)
  }
  return result
}

// Simple BPE tokenization simulation (merge-based)
export const bpeTokenize = (
  text: string,
  numMerges: number = 5
): { tokens: string[]; merges: { pair: string; result: string; step: number }[] } => {
  const chars = text.split('')
  const tokens = [...chars]
  const merges: { pair: string; result: string; step: number }[] = []

  for (let step = 0; step < numMerges; step++) {
    // Find most frequent pair
    const pairCounts: Record<string, number> = {}
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i] === ' ' || tokens[i + 1] === ' ') continue
      const pair = tokens[i] + tokens[i + 1]
      pairCounts[pair] = (pairCounts[pair] || 0) + 1
    }

    let bestPair = ''
    let bestCount = 0
    for (const [pair, count] of Object.entries(pairCounts)) {
      if (count > bestCount) {
        bestPair = pair
        bestCount = count
      }
    }

    if (bestCount === 0) break

    // Merge best pair
    const newTokens: string[] = []
    let i = 0
    while (i < tokens.length) {
      if (i < tokens.length - 1 && tokens[i] + tokens[i + 1] === bestPair) {
        newTokens.push(bestPair)
        i += 2
      } else {
        newTokens.push(tokens[i])
        i++
      }
    }

    merges.push({ pair: bestPair, result: bestPair, step: step + 1 })
    tokens.length = 0
    tokens.push(...newTokens)
  }

  return { tokens, merges }
}

// Fixed seed random for reproducibility
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const seededRandomMatrix = (rows: number, cols: number, seed: number): Matrix => {
  const result: Matrix = []
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      const r = seededRandom(seed * 131 + i * 17 + j * 7)
      row.push((r - 0.5) * 2)
    }
    result.push(row)
  }
  return result
}

// Visualization helpers
export const mapValueToColor = (
  value: number,
  minVal: number = -1,
  maxVal: number = 1,
  positiveColor: [number, number, number] = [99, 102, 241],
  negativeColor: [number, number, number] = [236, 72, 153],
  neutralColor: [number, number, number] = [15, 23, 42]
): string => {
  const range = maxVal - minVal
  const normalized = (value - minVal) / range
  const clamped = Math.max(0, Math.min(1, normalized))
  const midpoint = 0.5

  let r: number, g: number, b: number
  if (clamped < midpoint) {
    const t = clamped / midpoint
    r = Math.round(neutralColor[0] + (negativeColor[0] - neutralColor[0]) * t)
    g = Math.round(neutralColor[1] + (negativeColor[1] - neutralColor[1]) * t)
    b = Math.round(neutralColor[2] + (negativeColor[2] - neutralColor[2]) * t)
  } else {
    const t = (clamped - midpoint) / midpoint
    r = Math.round(neutralColor[0] + (positiveColor[0] - neutralColor[0]) * t)
    g = Math.round(neutralColor[1] + (positiveColor[1] - neutralColor[1]) * t)
    b = Math.round(neutralColor[2] + (positiveColor[2] - neutralColor[2]) * t)
  }

  return `rgb(${r}, ${g}, ${b})`
}

export const heatmapColor = (value: number): string => {
  const colors = [
    '#0F172A',
    '#1E3A5F',
    '#2B4A7F',
    '#3B5A9F',
    '#4B6ABF',
    '#5B7ADF',
    '#6366F1',
    '#8B5CF6',
    '#22D3EE',
    '#67E8F9',
  ]
  const index = Math.min(colors.length - 1, Math.max(0, Math.floor(value * colors.length)))
  return colors[index]
}
