import { useEffect, useRef, useState, useMemo } from 'react'
import { useI18n } from '../../i18n/context'

interface LayerNormVisualizerProps {
  dim?: number
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function normalize(vec: number[], eps: number): { out: number[]; mean: number; var: number } {
  const n = vec.length
  const mean = vec.reduce((a, b) => a + b, 0) / n
  const varS = vec.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  const std = Math.sqrt(varS + eps)
  const out = vec.map((v) => (v - mean) / std)
  return { out, mean, var: varS }
}

export default function LayerNormVisualizer({ dim: initialDim = 8 }: LayerNormVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const dim = initialDim

  const [inputs, setInputs] = useState<number[]>(() =>
    Array.from({ length: dim }, (_, i) => (seededRandom(i + 42) - 0.5) * 8)
  )
  const [eps, setEps] = useState(1e-5)

  const { out, mean, var: varS } = useMemo(() => normalize(inputs, eps), [inputs, eps])

  const outMean = out.reduce((a, b) => a + b, 0) / out.length
  const outVar = out.reduce((a, b) => a + (b - outMean) ** 2, 0) / out.length

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || 600
    const containerHeight = container?.clientHeight || 500

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, containerWidth, containerHeight)

    const chartAreaH = (containerHeight - 40) / 2
    const chartAreaW = containerWidth - 60

    drawBarChart(
      ctx,
      30,
      20,
      chartAreaW,
      chartAreaH - 10,
      inputs,
      isZh ? '输入向量' : 'Input Vector',
      '#6366F1',
      '#EC4899'
    )
    drawBarChart(
      ctx,
      30,
      20 + chartAreaH,
      chartAreaW,
      chartAreaH - 10,
      out,
      isZh ? 'LayerNorm 输出 (归一化)' : 'LayerNorm Output (Normalized)',
      '#22D3EE',
      '#EC4899'
    )
  }

  useEffect(() => {
    draw()
  }, [inputs, eps, isZh])

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

  const handleRandom = () => {
    setInputs(Array.from({ length: dim }, (_, i) => (seededRandom(Date.now() + i) - 0.5) * 10))
  }

  const handleValueChange = (idx: number, val: number) => {
    const next = [...inputs]
    next[idx] = val
    setInputs(next)
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div ref={containerRef} className="relative flex-1 min-h-[250px]">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
          <span className="text-dark-400 text-sm">
            ε: <span className="text-primary font-mono font-bold">{eps.toExponential(0)}</span>
          </span>
          <input
            type="range"
            min={-8}
            max={-2}
            step={1}
            value={Math.round(Math.log10(eps))}
            onChange={(e) => setEps(Math.pow(10, parseInt(e.target.value)))}
            className="w-24 h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <button
          onClick={handleRandom}
          className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 glow-button text-white px-5 py-2.5 text-base rounded-xl text-sm"
        >
          {isZh ? '随机输入' : 'Random Input'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <StatCard title={isZh ? '输入均值' : 'Input Mean'} value={mean.toFixed(3)} color="#6366F1" />
        <StatCard title={isZh ? '输入方差' : 'Input Variance'} value={varS.toFixed(3)} color="#8B5CF6" />
        <StatCard title={isZh ? '输出均值' : 'Output Mean'} value={outMean.toFixed(3)} color="#22D3EE" />
        <StatCard title={isZh ? '输出方差' : 'Output Variance'} value={outVar.toFixed(3)} color="#4ADE80" />
      </div>

      <div className="flex flex-col gap-2 bg-white/5 rounded-xl p-4">
        <div className="text-xs text-dark-400 text-center">
          {isZh ? '调节每个元素的值' : 'Adjust each element value'}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {inputs.map((v, i) => (
            <div key={i} className="flex flex-col gap-1 bg-white/5 rounded-lg p-2">
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">
                  {isZh ? `元素 ${i}` : `Element ${i}`}
                </span>
                <span className="font-mono font-bold text-primary">{v.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.1}
                value={v}
                onChange={(e) => handleValueChange(i, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-dark-100 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-dark-400 text-sm max-w-2xl mx-auto">
        {isZh
          ? 'LayerNorm 对每个样本的特征维度做归一化，稳定训练并加快收敛'
          : 'LayerNorm normalizes feature dimensions per sample, stabilizing training and accelerating convergence'}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
      <div className="text-xs text-dark-400 mb-1">{title}</div>
      <div className="font-mono font-bold text-base" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  values: number[],
  title: string,
  posColor: string,
  negColor: string
) {
  const titleH = 20
  const chartY = y + titleH
  const chartH = h - titleH

  ctx.fillStyle = '#F1F5F9'
  ctx.font = `600 13px "Space Grotesk", sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(title, x, y)

  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 1)
  const scaleVal = (chartH / 2 - 6) / maxAbs

  const zeroY = chartY + chartH / 2
  const barPad = 4
  const n = values.length
  const barW = (w - barPad * (n - 1)) / n

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(x, zeroY)
  ctx.lineTo(x + w, zeroY)
  ctx.stroke()
  ctx.setLineDash([])

  for (let i = 0; i < n; i++) {
    const v = values[i]
    const bx = x + i * (barW + barPad)
    const barH2 = Math.abs(v) * scaleVal
    let by: number
    if (v >= 0) {
      by = zeroY - barH2
    } else {
      by = zeroY
    }
    ctx.fillStyle = v >= 0 ? posColor : negColor
    ctx.globalAlpha = 0.85
    ctx.fillRect(bx, by, barW, Math.max(2, barH2))
    ctx.globalAlpha = 1

    ctx.strokeStyle = v >= 0 ? posColor : negColor
    ctx.lineWidth = 1
    ctx.strokeRect(bx, by, barW, Math.max(2, barH2))

    ctx.fillStyle = '#94A3B8'
    ctx.font = `10px "JetBrains Mono", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    if (barW > 18) {
      ctx.fillText(v.toFixed(1), bx + barW / 2, by - 12)
    }
  }
}
