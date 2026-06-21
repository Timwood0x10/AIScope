import { useEffect, useRef, useMemo, useState } from 'react'
import {
  Matrix,
  seededRandomMatrix,
  matrixMultiply,
} from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface FFNVisualizerProps {
  dModel?: number
  seqLength?: number
  expansionRatio?: number
}

function geluActivation(x: number): number {
  const c = Math.sqrt(2 / Math.PI)
  return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * Math.pow(x, 3))))
}

function reluActivation(x: number): number {
  return Math.max(0, x)
}

function applyActivation(matrix: Matrix, fn: 'gelu' | 'relu'): Matrix {
  const act = fn === 'gelu' ? geluActivation : reluActivation
  return matrix.map((row) => row.map((v) => act(v)))
}

export default function FFNVisualizer({
  dModel: initialDModel = 4,
  seqLength: initialSeqLength = 3,
  expansionRatio: initialExpansion = 4,
}: FFNVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const [dModel] = useState(initialDModel)
  const [seqLength, setSeqLength] = useState(initialSeqLength)
  const [expansionRatio, setExpansionRatio] = useState(initialExpansion)
  const [activation, setActivation] = useState<'gelu' | 'relu'>('gelu')
  const [seed, setSeed] = useState(7)

  const dFF = dModel * expansionRatio

  const { inputMatrix, hiddenMatrix, outputMatrix } = useMemo(() => {
    const X = seededRandomMatrix(seqLength, dModel, seed)
    const W1 = seededRandomMatrix(dModel, dFF, seed + 10)
    const W2 = seededRandomMatrix(dFF, dModel, seed + 20)

    const linear1 = matrixMultiply(X, W1)
    const hidden = applyActivation(linear1, activation)
    const output = matrixMultiply(hidden, W2)

    return { inputMatrix: X, hiddenMatrix: hidden, outputMatrix: output }
  }, [seqLength, dModel, expansionRatio, activation, seed])

  const paramCount = dModel * dFF + dFF * dModel

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || 700
    const containerHeight = container?.clientHeight || 450

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, containerWidth, containerHeight)

    const mainH = containerHeight - 80

    const matW1 = 120
    const matW3 = 120
    const labelGap = 40
    const allGap = matW1 + labelGap + labelGap + matW3 + labelGap * 2
    const maxW3 = Math.max(80, (containerWidth - allGap - 40))
    const matW2 = Math.min(220, maxW3)
    const totalW = matW1 + matW2 + matW3 + labelGap * 4
    const startX = (containerWidth - totalW) / 2

    const matH = Math.min(160, mainH - 40)
    const startY = (containerHeight - matH - 60) / 2

    ctx.fillStyle = '#F1F5F9'
    ctx.font = `600 13px "Space Grotesk", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    // Input matrix
    drawMatrixBlock(
      ctx,
      startX,
      startY + 25,
      matW1,
      matH,
      inputMatrix,
      isZh ? `输入 X [${seqLength}, ${dModel}]` : `Input X [${seqLength}, ${dModel}]`,
      'linear'
    )

    // Arrow 1
    drawArrow(ctx, startX + matW1 + 8, startY + 25 + matH / 2, matW2 / 2 - 8, '#6366F1')
    ctx.fillStyle = '#6366F1'
    ctx.font = `11px "JetBrains Mono", monospace`
    ctx.fillText(`W1 [${dModel}, ${dFF}]`, startX + matW1 + labelGap, startY)

    // Hidden matrix
    drawMatrixBlock(
      ctx,
      startX + matW1 + labelGap,
      startY + 25,
      matW2,
      matH,
      hiddenMatrix,
      isZh ? `${activation.toUpperCase()}(X·W1) [${seqLength}, ${dFF}]` : `${activation.toUpperCase()}(X·W1) [${seqLength}, ${dFF}]`,
      activation
    )

    // Arrow 2
    drawArrow(ctx, startX + matW1 + labelGap + matW2 + 8, startY + 25 + matH / 2, matW3 / 2 - 8, '#8B5CF6')
    ctx.fillStyle = '#8B5CF6'
    ctx.font = `11px "JetBrains Mono", monospace`
    ctx.fillText(`W2 [${dFF}, ${dModel}]`, startX + matW1 + labelGap + matW2 + labelGap, startY)

    // Output matrix
    drawMatrixBlock(
      ctx,
      startX + matW1 + matW2 + labelGap * 2,
      startY + 25,
      matW3,
      matH,
      outputMatrix,
      isZh ? `输出 Y [${seqLength}, ${dModel}]` : `Output Y [${seqLength}, ${dModel}]`,
      'linear'
    )

    // GELU/RELU curve small
    drawActivationCurve(ctx, containerWidth - 150, containerHeight - 80, 130, 70, activation)
  }

  useEffect(() => {
    draw()
  }, [inputMatrix, hiddenMatrix, outputMatrix, activation, isZh, seqLength, expansionRatio])

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

      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
          <span className="text-dark-400 text-sm">
            {isZh ? '扩展倍率' : 'Expansion Ratio'}: <span className="text-primary font-bold">{expansionRatio}×</span>
          </span>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={expansionRatio}
            onChange={(e) => setExpansionRatio(parseInt(e.target.value))}
            className="w-24 h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
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
            className="w-24 h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-secondary"
          />
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActivation('gelu')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activation === 'gelu'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            GELU
          </button>
          <button
            onClick={() => setActivation('relu')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activation === 'relu'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            ReLU
          </button>
        </div>

        <button
          onClick={() => setSeed(Math.floor(Math.random() * 100000) + 1)}
          className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 glow-button text-white px-5 py-2.5 text-base rounded-xl text-sm"
        >
          {isZh ? '重新生成' : 'Regenerate'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
          <div className="text-xs text-dark-400 mb-1">{isZh ? '参数数量' : 'Parameter Count'}</div>
          <div className="font-mono font-bold text-base text-accent">
            W1: {dModel}×{dFF} + W2: {dFF}×{dModel} = {paramCount.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="text-center text-dark-400 text-sm max-w-2xl mx-auto">
        {isZh
          ? 'FFN 是一个两层 MLP：先扩展维度再压缩回去，配合非线性激活函数引入表达能力'
          : 'FFN is a two-layer MLP: expand then compress, using non-linear activation for expressiveness'}
      </div>
    </div>
  )
}

function drawMatrixBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  matrix: Matrix,
  title: string,
  mode: 'linear' | 'gelu' | 'relu'
) {
  const titleH = 20
  const subH = h - titleH
  const rows = matrix.length
  const cols = matrix[0].length

  ctx.fillStyle = '#F1F5F9'
  ctx.font = `500 11px "Space Grotesk", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(title, x + w / 2, y - 2)

  const cellW = w / cols
  const cellH = subH / rows
  const pad = 1

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const val = matrix[i][j]
      const cx = x + j * cellW + pad
      const cy = y + titleH + i * cellH + pad
      const cw = cellW - pad * 2
      const ch = cellH - pad * 2

      if (mode === 'relu' && val <= 0) {
        ctx.fillStyle = '#334155'
      } else if (mode === 'gelu' && val < 0) {
        ctx.fillStyle = getColorForValue(val, '#22D3EE', '#0F172A')
      } else if (val >= 0) {
        ctx.fillStyle = getColorForValue(val, '#6366F1', '#0F172A')
      } else {
        ctx.fillStyle = getColorForValue(val, '#22D3EE', '#0F172A')
      }
      ctx.fillRect(cx, cy, cw, ch)

      if (cellW > 22 && cellH > 22) {
        ctx.fillStyle = Math.abs(val) > 0.5 ? '#F1F5F9' : 'rgba(241, 245, 249, 0.6)'
        ctx.font = `${Math.min(9, cellW / 3)}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(val.toFixed(1), cx + cw / 2, cy + ch / 2)
      }
    }
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + titleH + 0.5, w - 1, subH - 1)
}

function getColorForValue(val: number, posColor: string, baseColor: string): string {
  const hex = posColor.replace('#', '')
  const pr = parseInt(hex.substring(0, 2), 16)
  const pg = parseInt(hex.substring(2, 4), 16)
  const pb = parseInt(hex.substring(4, 6), 16)

  const baseR = 15
  const baseG = 23
  const baseB = 42

  const absV = Math.min(1, Math.abs(val) / 3)
  const t = 0.15 + absV * 0.85

  const r = Math.round(baseR + (pr - baseR) * t)
  const g = Math.round(baseG + (pg - baseG) * t)
  const b = Math.round(baseB + (pb - baseB) * t)
  return `rgb(${r}, ${g}, ${b})`
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  color: string
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - len / 2, y)
  ctx.lineTo(x + len / 2, y)
  ctx.stroke()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + len / 2, y)
  ctx.lineTo(x + len / 2 - 6, y - 4)
  ctx.lineTo(x + len / 2 - 6, y + 4)
  ctx.closePath()
  ctx.fill()
}

function drawActivationCurve(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  activation: 'gelu' | 'relu'
) {
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  roundRectFFN(ctx, x, y, w, h, 8)
  ctx.fill()

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + h / 2)
  ctx.lineTo(x + w, y + h / 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + w / 2, y)
  ctx.lineTo(x + w / 2, y + h)
  ctx.stroke()

  const color = activation === 'gelu' ? '#22D3EE' : '#8B5CF6'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  const fn = activation === 'gelu' ? geluActivation : reluActivation
  const scaleX = 4
  const scaleY = 2.5
  for (let i = 0; i <= 50; i++) {
    const xi = -scaleX + (i / 50) * (scaleX * 2)
    const yi = fn(xi)
    const px = x + (xi + scaleX) / (scaleX * 2) * w
    const py = y + h / 2 - (yi / scaleY) * (h / 2)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()

  ctx.fillStyle = color
  ctx.font = `600 11px "Space Grotesk", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(activation.toUpperCase(), x + w / 2, y + 4)
}

function roundRectFFN(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
