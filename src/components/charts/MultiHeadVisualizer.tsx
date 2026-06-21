import { useEffect, useRef, useMemo, useState } from 'react'
import {
  Matrix,
  seededRandomMatrix,
  matrixMultiply,
  transpose,
  softmax,
  scale,
} from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface MultiHeadVisualizerProps {
  numHeads?: number
  seqLength?: number
}

const HEAD_COLORS = ['#6366F1', '#8B5CF6', '#22D3EE', '#4ADE80']

export default function MultiHeadVisualizer({
  numHeads: initialNumHeads = 3,
  seqLength: initialSeqLength = 4,
}: MultiHeadVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const [numHeads, setNumHeads] = useState(initialNumHeads)
  const [seqLength, setSeqLength] = useState(initialSeqLength)
  const [seed, setSeed] = useState(42)

  const headDim = 16
  const scaleFactor = 1 / Math.sqrt(headDim)

  const { headsWeights, concatOutput } = useMemo(() => {
    const heads: Matrix[] = []
    for (let h = 0; h < numHeads; h++) {
      const Wq = seededRandomMatrix(headDim, headDim, seed + h * 3 + 1)
      const Wk = seededRandomMatrix(headDim, headDim, seed + h * 3 + 2)
      const Wv = seededRandomMatrix(headDim, headDim, seed + h * 3 + 3)
      const X = seededRandomMatrix(seqLength, headDim, seed + 100 + h)

      const Q = matrixMultiply(X, Wq)
      const K = matrixMultiply(X, Wk)
      const V = matrixMultiply(X, Wv)

      const QK_T = matrixMultiply(Q, transpose(K))
      const scaled = scale(QK_T, scaleFactor)
      const weights = softmax(scaled)
      heads.push(weights)
    }

    const totalDim = numHeads * headDim
    const concatOutput = { rows: seqLength, cols: totalDim }

    return { headsWeights: heads, concatOutput }
  }, [numHeads, seqLength, seed])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || 600
    const containerHeight = container?.clientHeight || 400

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, containerWidth, containerHeight)

    const padding = 16
    const topTitleH = 30
    const gap = 12
    const concatTitleH = 24
    const concatBlockH = 60

    const availH = containerHeight - padding * 2 - topTitleH - concatTitleH - concatBlockH - gap
    const availW = containerWidth - padding * 2

    const colsPerRow = numHeads <= 2 ? numHeads : Math.min(numHeads, 2)
    const rowsLayout = Math.ceil(numHeads / colsPerRow)

    const maxHeadWidth = (availW - gap * (colsPerRow - 1)) / colsPerRow
    const maxHeadHeight = (availH - gap * (rowsLayout - 1)) / rowsLayout
    const headSize = Math.min(maxHeadWidth, maxHeadHeight, 220)

    const totalHeadsW = colsPerRow * headSize + (colsPerRow - 1) * gap
    const totalHeadsH = rowsLayout * headSize + (rowsLayout - 1) * gap
    const startX = (containerWidth - totalHeadsW) / 2
    const startY = padding + topTitleH

    ctx.fillStyle = '#F1F5F9'
    ctx.font = '14px "Space Grotesk", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const title = isZh
      ? `多头注意力 (${numHeads} 头 × ${seqLength} 序列)`
      : `Multi-Head (${numHeads} heads × seq ${seqLength})`
    ctx.fillText(title, containerWidth / 2, padding)

    for (let h = 0; h < numHeads; h++) {
      const col = h % colsPerRow
      const row = Math.floor(h / colsPerRow)
      const hx = startX + col * (headSize + gap)
      const hy = startY + row * (headSize + gap)

      drawHeadHeatmap(ctx, hx, hy, headSize, headsWeights[h], HEAD_COLORS[h], isZh ? `头 ${h + 1}` : `Head ${h + 1}`, seqLength)
    }

    const concatY = startY + totalHeadsH + gap
    drawConcatBlock(ctx, padding, concatY, containerWidth - padding * 2, concatBlockH, concatOutput, isZh, numHeads, seqLength, headDim)
  }

  useEffect(() => {
    draw()
  }, [headsWeights, numHeads, seqLength, isZh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const raf = requestAnimationFrame(() => draw())

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => draw())
      resizeObserver.observe(container)
    }
    const onResize = () => draw()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div ref={containerRef} className="relative flex-1 min-h-[250px]">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
          <span className="text-dark-400 text-sm">
            {isZh ? '注意力头数' : 'Attention Heads'}: <span className="text-primary font-bold">{numHeads}</span>
          </span>
          <input
            type="range"
            min={2}
            max={4}
            step={1}
            value={numHeads}
            onChange={(e) => setNumHeads(parseInt(e.target.value))}
            className="w-32 h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
          <span className="text-dark-400 text-sm">
            {isZh ? '序列长度' : 'Seq Length'}: <span className="text-secondary font-bold">{seqLength}</span>
          </span>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={seqLength}
            onChange={(e) => setSeqLength(parseInt(e.target.value))}
            className="w-32 h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-secondary"
          />
        </div>

        <button
          onClick={() => setSeed(Math.floor(Math.random() * 100000) + 1)}
          className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 glow-button text-white px-5 py-2.5 text-base rounded-xl text-sm"
        >
          {isZh ? '重新生成' : 'Regenerate'}
        </button>
      </div>

      <div className="text-center text-dark-400 text-sm max-w-2xl mx-auto">
        {isZh
          ? '不同的头可能学习到不同的注意力模式：句法依赖、语义相关、指代消解等'
          : 'Different heads may learn different attention patterns: syntactic dependencies, semantic similarity, coreference, etc.'}
      </div>
    </div>
  )
}

function drawHeadHeatmap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  weights: Matrix,
  headColor: string,
  title: string,
  n: number
) {
  const titleH = 22
  const hmSize = size - titleH

  ctx.fillStyle = headColor
  ctx.font = `600 13px "Space Grotesk", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(title, x + size / 2, y)

  const cellSize = hmSize / n
  const pad = 2
  const hmX = x + (size - hmSize) / 2
  const hmY = y + titleH

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const val = weights[i][j]
      ctx.fillStyle = getHeadHeatmapColor(val, headColor)
      ctx.fillRect(
        hmX + j * cellSize + pad,
        hmY + i * cellSize + pad,
        cellSize - pad * 2,
        cellSize - pad * 2
      )
    }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `${Math.max(8, cellSize / 3.5)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const val = weights[i][j]
      if (cellSize > 28) {
        ctx.fillStyle = val > 0.5 ? '#0F172A' : '#F1F5F9'
        ctx.fillText(
          val.toFixed(2),
          hmX + j * cellSize + cellSize / 2,
          hmY + i * cellSize + cellSize / 2
        )
      }
    }
  }
}

function getHeadHeatmapColor(value: number, headColor: string): string {
  const hex = headColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  if (value < 0.05) return '#0F172A'

  const t = Math.min(1, value / 0.8)
  const nr = Math.round(15 + (r - 15) * t)
  const ng = Math.round(23 + (g - 23) * t)
  const nb = Math.round(42 + (b - 42) * t)
  return `rgb(${nr}, ${ng}, ${nb})`
}

function drawConcatBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  _out: { rows: number; cols: number },
  isZh: boolean,
  numHeads: number,
  seqLength: number,
  headDim: number
) {
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  roundRect(ctx, x, y, w, h, 10)
  ctx.fill()

  ctx.fillStyle = '#F1F5F9'
  ctx.font = `500 12px "Space Grotesk", sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(isZh ? 'Concat(head1, head2, ...) · Output Projection' : 'Concat(head1, head2, ...) · Output Projection', x + 14, y + 10)

  ctx.fillStyle = '#94A3B8'
  ctx.font = `11px "JetBrains Mono", monospace`
  ctx.fillText(
    isZh
      ? `输出形状: [${seqLength}, ${numHeads} × ${headDim}] = [${seqLength}, ${numHeads * headDim}]`
      : `Output shape: [${seqLength}, ${numHeads} × ${headDim}] = [${seqLength}, ${numHeads * headDim}]`,
    x + 14,
    y + 30
  )

  const barY = y + 50
  const barH = 6
  const barPadding = 14
  const barW = w - barPadding * 2
  const segmentW = barW / numHeads
  for (let h2 = 0; h2 < numHeads; h2++) {
    ctx.fillStyle = HEAD_COLORS[h2]
    ctx.fillRect(x + barPadding + h2 * segmentW + 1, barY, segmentW - 2, barH)
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
