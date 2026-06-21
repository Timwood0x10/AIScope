import { useEffect, useRef, useState, useMemo } from 'react'
import {
  matrixMultiply,
  transpose,
  randomMatrix,
  mapValueToColor,
  Matrix,
} from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface QKVProjectionVisualizerProps {
  seqLength?: number
  dim?: number
  seed?: number
}

function makeMatrix(rows: number, cols: number, seedOffset: number): Matrix {
  const m: Matrix = []
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      const r = Math.sin(seedOffset + i * 131 + j * 7) * 10000
      const frac = r - Math.floor(r)
      row.push((frac - 0.5) * 2)
    }
    m.push(row)
  }
  return m
}

export default function QKVProjectionVisualizer({
  seqLength = 3,
  dim = 4,
  seed = 42,
}: QKVProjectionVisualizerProps) {
  const seq = Math.min(6, Math.max(2, Math.round(seqLength)))
  const d = Math.min(6, Math.max(3, Math.round(dim)))
  const [seedState, setSeedState] = useState<number>(seed)
  const [sliders, setSliders] = useState<number[]>(
    Array.from({ length: 3 }, (_, i) => i * 0.2 + 0.4)
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const { X, Wq, Wk, Wv, Q, K, V, sim } = useMemo(() => {
    const X = makeMatrix(seq, d, seedState + 1)
    const WqRaw = makeMatrix(d, d, seedState + 2)
    const WkRaw = makeMatrix(d, d, seedState + 3)
    const WvRaw = makeMatrix(d, d, seedState + 4)
    const Wq = WqRaw.map((row) => row.map((v) => v * sliders[0]))
    const Wk = WkRaw.map((row) => row.map((v) => v * sliders[1]))
    const Wv = WvRaw.map((row) => row.map((v) => v * sliders[2]))
    const Q = matrixMultiply(X, Wq)
    const K = matrixMultiply(X, Wk)
    const V = matrixMultiply(X, Wv)
    const Kt = transpose(K)
    const QKt = matrixMultiply(Q, Kt)
    const scale = 1 / Math.sqrt(d)
    const scaled = QKt.map((row) => row.map((v) => v * scale))
    const maxAbs = scaled.reduce(
      (acc, row) => Math.max(acc, ...row.map((v) => Math.abs(v))),
      0.0001
    )
    const sim: Matrix = scaled.map((row) => row.map((v) => v / maxAbs))
    return { X, Wq, Wk, Wv, Q, K, V, sim }
  }, [seq, d, seedState, sliders])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const w = container?.clientWidth || 800
    const h = container?.clientHeight || 480
    if (w < 200 || h < 200) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, w, h)

    const pad = 18
    const titleH = 22
    const rowTitleExtra = 6
    const availableW = w - pad * 2
    const availableH = h - pad * 2 - titleH * 3 - rowTitleExtra * 3

    const drawMatrix = (
      mx: number,
      my: number,
      m: Matrix,
      title: string,
      cellMin: number = 20,
      minVal: number = -1,
      maxVal: number = 1
    ) => {
      const rows = m.length
      const cols = m[0].length
      const cellSize = Math.max(
        cellMin,
        Math.floor(Math.min((availableW * 0.45) / cols, (availableH / 3) / rows))
      )
      const totalW = cellSize * cols
      const totalH = cellSize * rows

      ctx.fillStyle = '#CBD5E1'
      ctx.font = '600 12px ui-sans-serif, system-ui'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(title, mx, my - titleH + 4)

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const v = m[i][j]
          ctx.fillStyle = mapValueToColor(v, minVal, maxVal)
          ctx.fillRect(mx + j * cellSize, my + i * cellSize, cellSize - 2, cellSize - 2)
          const textSize = Math.max(9, Math.min(13, Math.floor(cellSize / 3)))
          ctx.fillStyle = Math.abs(v) > (maxVal - minVal) * 0.25 ? '#F8FAFC' : '#94A3B8'
          ctx.font = `${textSize}px ui-monospace, SFMono-Regular, monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            v.toFixed(2),
            mx + j * cellSize + cellSize / 2 - 1,
            my + i * cellSize + cellSize / 2
          )
        }
      }
      return { totalW, totalH }
    }

    const row0Y = pad + titleH
    const xInfo = drawMatrix(pad + availableW * 0.02, row0Y, X, isZh ? '输入 X' : 'Input X')
    const simInfo = drawMatrix(
      pad + availableW * 0.52,
      row0Y,
      sim,
      isZh ? '相似度 QK^T' : 'Similarity QK^T'
    )

    const row1Y = row0Y + (simInfo.totalH || 80) + titleH + rowTitleExtra
    const wqInfo = drawMatrix(pad + availableW * 0.02, row1Y, Wq, 'W_Q', 22)
    drawMatrix(
      pad + availableW * 0.02 + wqInfo.totalW + 14,
      row1Y,
      Wk,
      'W_K',
      22
    )
    drawMatrix(
      pad + availableW * 0.02 + wqInfo.totalW * 2 + 28,
      row1Y,
      Wv,
      'W_V',
      22
    )

    const row2Y = row1Y + (wqInfo.totalH || 80) + titleH + rowTitleExtra
    const qInfo = drawMatrix(pad + availableW * 0.02, row2Y, Q, 'Q')
    drawMatrix(pad + availableW * 0.02 + qInfo.totalW + 14, row2Y, K, 'K')
    drawMatrix(pad + availableW * 0.02 + qInfo.totalW * 2 + 28, row2Y, V, 'V')

    ctx.fillStyle = '#475569'
    ctx.font = '14px ui-sans-serif, system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const arrowY = row0Y + (simInfo.totalH || 80) / 2
    const arrowX = pad + xInfo.totalW + 24
    ctx.fillText('·', arrowX, arrowY)
  }

  useEffect(() => {
    draw()
  }, [X, Wq, Wk, Wv, Q, K, V, sim, isZh])

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

  const resetRandom = () => {
    setSeedState(Math.floor(Math.random() * 100000))
    setSliders([
      Math.random() * 0.8 + 0.2,
      Math.random() * 0.8 + 0.2,
      Math.random() * 0.8 + 0.2,
    ])
  }

  const handleSliderChange = (idx: number, val: number) => {
    const next = [...sliders]
    next[idx] = val
    setSliders(next)
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">
          {isZh ? 'Q/K/V 线性投影' : 'Q/K/V Linear Projection'}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {isZh
            ? '输入通过三个独立线性变换，产生查询、键、值三个不同的语义空间表示'
            : 'Input goes through three independent linear transforms, producing three distinct semantic representations: Query, Key, Value'}
        </p>
        <div className="mt-2 px-3 py-2 rounded-md bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 text-center">
          Q = X·W_Q &nbsp;&nbsp; K = X·W_K &nbsp;&nbsp; V = X·W_V &nbsp;&nbsp; Sim = Q·K^T
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-[300px] w-full rounded-lg border border-slate-800 bg-slate-950/40"
      >
        <canvas ref={canvasRef} className="block w-full h-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-xs text-slate-400">
              {isZh ? '序列长度' : 'Seq'}: <span className="text-slate-200 font-mono">{seq}</span>
            </div>
            <div className="text-xs text-slate-400">
              {isZh ? '维度' : 'Dim'}: <span className="text-slate-200 font-mono">{d}</span>
            </div>
          </div>
          <button
            onClick={resetRandom}
            className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity"
          >
            {isZh ? '重置随机' : 'Reset Random'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['W_Q', 'W_K', 'W_V'].map((name, i) => (
            <div key={name} className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10 shrink-0 font-mono">{name}</label>
              <input
                type="range"
                min={0.1}
                max={1.5}
                step={0.05}
                value={sliders[i]}
                onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                className="flex-1 accent-[#22D3EE]"
              />
              <span className="text-xs font-mono text-slate-200 w-10 text-right">
                {sliders[i].toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
