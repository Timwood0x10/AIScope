import { useEffect, useRef, useState, useMemo } from 'react'
import { softmax1D } from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface SoftmaxVisualizerProps {
  initialValues?: number[]
  defaultSize?: number
}

function generateRandomScores(size: number): number[] {
  return Array(size)
    .fill(0)
    .map(() => Math.round((Math.random() * 10 - 2) * 10) / 10)
}

export default function SoftmaxVisualizer({
  initialValues,
  defaultSize = 6,
}: SoftmaxVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const size = Math.min(8, Math.max(4, defaultSize))
  const [scores, setScores] = useState<number[]>(
    initialValues && initialValues.length >= 4
      ? initialValues.slice(0, size)
      : generateRandomScores(size)
  )
  const [temperature, setTemperature] = useState<number>(1.0)

  const probabilities = useMemo(
    () => softmax1D(scores, temperature),
    [scores, temperature]
  )

  const maxScore = useMemo(
    () => Math.max(...scores.map((s) => Math.abs(s)), 1),
    [scores]
  )

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || 600
    const containerHeight = container?.clientHeight || 320
    const w = containerWidth
    const h = containerHeight
    if (w < 100 || h < 100) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, w, h)

    const halfW = w / 2
    const padding = 28
    const titleH = 26
    const labelH = 24
    const chartXLeft = padding
    const chartXRight = halfW + padding
    const chartW = halfW - padding * 2
    const chartY = titleH + 10
    const chartH = h - chartY - labelH - 10

    ctx.fillStyle = '#CBD5E1'
    ctx.font = '600 14px ui-sans-serif, system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(isZh ? '原始分数' : 'Raw Scores', chartXLeft, 6)
    ctx.fillText(isZh ? 'Softmax 概率' : 'Softmax Probability', chartXRight, 6)

    const n = scores.length
    const barGap = 10
    const barTotalSpace = chartW - barGap * (n - 1)
    const barWidth = barTotalSpace / n

    for (let i = 0; i < n; i++) {
      const sVal = scores[i]
      const pVal = probabilities[i]

      const sNorm = Math.abs(sVal) / maxScore
      const sHeight = sNorm * chartH
      const sX = chartXLeft + i * (barWidth + barGap)
      const sYBase = chartY + chartH
      const sYTop = sVal >= 0 ? sYBase - sHeight : sYBase
      const sColor =
        sVal >= 0
          ? `rgb(${Math.round(99 + (22 - 99) * (1 - sNorm))}, ${Math.round(
              102 + (211 - 102) * (1 - sNorm)
            )}, ${Math.round(241 + (238 - 241) * (1 - sNorm))})`
          : '#EC4899'
      if (Math.abs(sVal) > 0.0001) {
        ctx.fillStyle = sColor
        ctx.fillRect(sX, sYTop, barWidth, Math.max(2, Math.abs(sYBase - sYTop)))
      } else {
        ctx.fillStyle = '#1E293B'
        ctx.fillRect(sX, sYBase - 2, barWidth, 2)
      }

      ctx.fillStyle = '#E2E8F0'
      ctx.font = '11px ui-monospace, SFMono-Regular, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(sVal.toFixed(2), sX + barWidth / 2, sYBase + 6)

      const pHeight = pVal * chartH
      const pX = chartXRight + i * (barWidth + barGap)
      const pYTop = chartY + chartH - pHeight
      ctx.fillStyle = `rgb(${Math.round(139 + (34 - 139) * (1 - pVal))}, ${Math.round(
        92 + (211 - 92) * (1 - pVal)
      )}, ${Math.round(246 + (238 - 246) * (1 - pVal))})`
      ctx.fillRect(pX, pYTop, barWidth, Math.max(2, pHeight))

      ctx.fillStyle = '#E2E8F0'
      ctx.fillText(
        `${(pVal * 100).toFixed(1)}%`,
        pX + barWidth / 2,
        Math.max(chartY + 2, pYTop - 16)
      )
      ctx.fillStyle = '#94A3B8'
      ctx.font = '11px ui-monospace, SFMono-Regular, monospace'
      ctx.fillText(
        isZh ? `分数 ${i + 1}` : `Score ${i + 1}`,
        pX + barWidth / 2,
        chartY + chartH + 6
      )
    }

    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(halfW, titleH + 4)
    ctx.lineTo(halfW, h - 10)
    ctx.stroke()
  }

  useEffect(() => {
    draw()
  }, [scores, temperature, isZh])

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

  const handleScoreChange = (idx: number, val: number) => {
    const next = [...scores]
    next[idx] = val
    setScores(next)
  }

  const resetRandom = () => {
    setScores(generateRandomScores(size))
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">
          {isZh ? 'Softmax 归一化' : 'Softmax Normalization'}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {isZh
            ? 'Softmax 将任意实数值转换为和为 1 的概率分布'
            : 'Softmax converts arbitrary real values into a probability distribution summing to 1'}
        </p>
        <div className="mt-2 px-3 py-2 rounded-md bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 text-center">
          softmax(x_i / T) = exp(x_i / T) / Σ_j exp(x_j / T)
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-[300px] w-full rounded-lg border border-slate-800 bg-slate-950/40"
      >
        <canvas ref={canvasRef} className="block w-full h-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <label className="text-sm text-slate-300 w-28 shrink-0">
              {isZh ? '温度 T' : 'Temperature T'}
            </label>
            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="flex-1 accent-[#8B5CF6]"
            />
            <span className="text-sm font-mono text-slate-200 w-10 text-right">
              {temperature.toFixed(2)}
            </span>
          </div>
          <button
            onClick={resetRandom}
            className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity"
          >
            {isZh ? '重置随机' : 'Reset Random'}
          </button>
        </div>

        <div className="text-xs text-slate-400">
          {isZh
            ? 'T → 0：分布尖锐；T → ∞：分布均匀'
            : 'T → 0: Sharp distribution; T → ∞: Uniform distribution'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {scores.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-20 shrink-0">
                {isZh ? `分数 ${i + 1}` : `Score ${i + 1}`}
              </label>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={s}
                onChange={(e) => handleScoreChange(i, parseFloat(e.target.value))}
                className="flex-1 accent-[#22D3EE]"
              />
              <span className="text-xs font-mono text-slate-200 w-12 text-right">
                {s.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400 w-12 text-right">
                {(probabilities[i] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
