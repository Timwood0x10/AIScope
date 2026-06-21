import { useEffect, useRef, useState, useMemo } from 'react'
import { layerNorm, addMatrices, seededRandomMatrix, softmax1D, Matrix } from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface ResidualVisualizerProps {
  dim?: number
  noiseStrength?: number
}

const GELU = (x: number): number => {
  const c = Math.sqrt(2 / Math.PI)
  return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * Math.pow(x, 3))))
}

function computeStats(vec: number[]): { mean: number; std: number } {
  const mean = vec.reduce((a, b) => a + b, 0) / vec.length
  const variance = vec.reduce((a, b) => a + (b - mean) ** 2, 0) / vec.length
  return { mean, std: Math.sqrt(variance) }
}

export default function ResidualVisualizer({
  dim = 10,
  noiseStrength: defaultNoise = 0.3,
}: ResidualVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const [noise, setNoise] = useState(defaultNoise)
  const [useResidual, setUseResidual] = useState(true)

  const inputMatrix: Matrix = useMemo(() => seededRandomMatrix(1, dim, 42), [dim])
  const inputVec = inputMatrix[0]

  const { fOutVec, sumVec, outputVec } = useMemo(() => {
    const noiseMat: Matrix = seededRandomMatrix(1, dim, 777)
    const perturbed: Matrix = [inputVec.map((v, i) => v + noiseMat[0][i] * noise * 3)]
    const fMatrix: Matrix = [perturbed[0].map((v) => GELU(v))]
    const fArr = fMatrix[0]

    const sumMat: Matrix = useResidual ? addMatrices(inputMatrix, fMatrix) : fMatrix
    const outMat = layerNorm(sumMat)
    return { fOutVec: fArr, sumVec: sumMat[0], outputVec: outMat[0] }
  }, [inputVec, inputMatrix, noise, useResidual, dim])

  const statsInput = useMemo(() => computeStats(inputVec), [inputVec])
  const statsF = useMemo(() => computeStats(fOutVec), [fOutVec])
  const statsSum = useMemo(() => computeStats(sumVec), [sumVec])
  const statsOut = useMemo(() => computeStats(outputVec), [outputVec])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || 700
    const containerHeight = container?.clientHeight || 380
    const size = Math.min(containerWidth, 1000)
    const height = Math.min(containerHeight, 420)
    if (size < 50 || height < 50) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = height * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, size, height)

    const sections = 4
    const gap = 24
    const totalGap = gap * (sections + 1)
    const sectionW = (size - totalGap) / sections
    const titleH = 38
    const statsH = 46
    const plotTop = titleH
    const plotH = height - titleH - statsH - 12

    const sectionsData = [
      {
        label: isZh ? '输入 x' : 'Input x',
        vec: inputVec,
        colorPos: '#6366F1',
        colorNeg: '#EC4899',
        stats: statsInput,
      },
      {
        label: isZh ? 'F(x) 变换' : 'F(x) transform',
        vec: fOutVec,
        colorPos: '#8B5CF6',
        colorNeg: '#EC4899',
        stats: statsF,
      },
      {
        label: useResidual ? (isZh ? 'x + F(x)' : 'x + F(x)') : (isZh ? '仅 F(x)' : 'F(x) only'),
        vec: sumVec,
        colorPos: '#22D3EE',
        colorNeg: '#EC4899',
        stats: statsSum,
      },
      {
        label: isZh ? 'LayerNorm 输出' : 'LayerNorm output',
        vec: outputVec,
        colorPos: '#10B981',
        colorNeg: '#EC4899',
        stats: statsOut,
      },
    ]

    for (let s = 0; s < sections; s++) {
      const sectionX = gap + s * (sectionW + gap)
      const data = sectionsData[s]

      ctx.fillStyle = '#F1F5F9'
      ctx.font = '13px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(data.label, sectionX + sectionW / 2, 22)

      ctx.strokeStyle = '#1E293B'
      ctx.lineWidth = 1
      const baselineY = plotTop + plotH / 2
      ctx.beginPath()
      ctx.moveTo(sectionX, baselineY)
      ctx.lineTo(sectionX + sectionW, baselineY)
      ctx.stroke()

      const maxAbs = Math.max(...data.vec.map((v) => Math.abs(v)), 0.5)
      const barW = Math.min(28, (sectionW - 20) / data.vec.length - 4)
      const totalBarW = barW * data.vec.length + 4 * (data.vec.length - 1)
      const startX = sectionX + (sectionW - totalBarW) / 2
      const scaleH = (plotH / 2 - 6) / maxAbs

      for (let i = 0; i < data.vec.length; i++) {
        const v = data.vec[i]
        const bx = startX + i * (barW + 4)
        const barH = Math.abs(v) * scaleH
        const barY = v >= 0 ? baselineY - barH : baselineY

        ctx.fillStyle = v >= 0 ? data.colorPos : data.colorNeg
        ctx.fillRect(bx, barY, barW, Math.max(1, barH))

        ctx.fillStyle = '#94A3B8'
        ctx.font = '9px JetBrains Mono'
        ctx.textAlign = 'center'
        ctx.fillText(v.toFixed(2), bx + barW / 2, v >= 0 ? barY - 4 : barY + barH + 10)
      }

      const statsY = height - statsH + 6
      ctx.fillStyle = '#64748B'
      ctx.font = '10px JetBrains Mono'
      ctx.textAlign = 'center'
      ctx.fillText(
        isZh ? `均值 μ=${data.stats.mean.toFixed(3)}  标准差 σ=${data.stats.std.toFixed(3)}` : `μ=${data.stats.mean.toFixed(3)}  σ=${data.stats.std.toFixed(3)}`,
        sectionX + sectionW / 2,
        statsY + 14
      )
    }

    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    for (let i = 1; i < sections; i++) {
      const x = gap + i * (sectionW + gap) - gap / 2
      ctx.beginPath()
      ctx.moveTo(x, titleH)
      ctx.lineTo(x, height - statsH)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => draw())
    const container = containerRef.current
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => draw())
      if (container) ro.observe(container)
    }
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      if (ro) ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    draw()
  }, [noise, useResidual, dim, lang])

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-100 text-center">
        {isZh ? '残差连接 + LayerNorm' : 'Residual Connection + LayerNorm'}
      </h2>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[250px] flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800"
      >
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseResidual((v) => !v)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: useResidual ? '#6366F1' : '#334155',
              color: '#F8FAFC',
            }}
          >
            {isZh ? (useResidual ? '✓ 启用残差' : '✗ 禁用残差') : useResidual ? '✓ Residual ON' : '✗ Residual OFF'}
          </button>
          <span className="text-xs text-slate-400">
            {isZh ? `公式: output = LayerNorm(${useResidual ? 'x + F(x)' : 'F(x)'})` : `Formula: output = LayerNorm(${useResidual ? 'x + F(x)' : 'F(x)'})`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300 w-32 shrink-0">
            {isZh ? '噪声/扰动强度' : 'Noise strength'}: {noise.toFixed(2)}
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={noise}
            onChange={(e) => setNoise(Number(e.target.value))}
            className="flex-1 accent-cyan-400"
          />
        </div>

        <div className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900 rounded p-3 border border-slate-800">
          <p>output = LayerNorm( {useResidual ? 'x + F(x)' : 'F(x)'} )</p>
          <p className="mt-1 text-slate-500 font-sans leading-relaxed">
            {isZh
              ? '残差连接让信息和梯度可以直接流过子层，F(x) 只需要学习残差（即修正量）。无残差时统计特性变化更大，LayerNorm 重新归一化到 μ≈0, σ≈1。'
              : 'Residual connection lets information and gradients flow directly through; F(x) only needs to learn the residual. Without residual the statistics shift more; LayerNorm re-normalizes to μ≈0, σ≈1.'}
          </p>
        </div>
      </div>
    </div>
  )
}
