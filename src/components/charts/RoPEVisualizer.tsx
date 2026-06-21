import { useEffect, useRef, useState } from 'react'
import { ropeRotate } from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface RoPEVisualizerProps {
  dim?: number
  maxPos?: number
}

export default function RoPEVisualizer({ dim = 8, maxPos = 8 }: RoPEVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const thetaContainerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const [position, setPosition] = useState(3)
  const [base, setBase] = useState(10000)
  const [isAnimating, setIsAnimating] = useState(false)
  const animPosRef = useRef(0)
  const animRafRef = useRef<number | null>(null)
  const animSpeedRef = useRef(0.08)

  const INITIAL_VECTOR: [number, number] = [0.8, 0.3]

  const colors = [
    '#6366F1',
    '#8B5CF6',
    '#22D3EE',
    '#67E8F9',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#EF4444',
  ]

  const rotateVector = (x: number, y: number, m: number, b: number, dim: number): [number, number] => {
    const theta = m / Math.pow(b, 0 / dim)
    const cosVal = Math.cos(theta)
    const sinVal = Math.sin(theta)
    return [x * cosVal - y * sinVal, x * sinVal + y * cosVal]
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || 400
    const containerHeight = container?.clientHeight || 350
    const size = Math.min(containerWidth, containerHeight, 520)
    if (size < 50) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.32
    const displayPos = isAnimating ? animPosRef.current : position

    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(size, cy)
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx, size)
    ctx.stroke()

    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()

    for (let m = 0; m < maxPos; m++) {
      const [rx, ry] = rotateVector(INITIAL_VECTOR[0], INITIAL_VECTOR[1], m, base, dim)
      const ex = cx + rx * radius
      const ey = cy - ry * radius
      const alpha = isAnimating ? (m === Math.floor(displayPos) ? 1 : 0.25) : 0.75

      ctx.strokeStyle = colors[m % colors.length]
      ctx.lineWidth = 2
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(ex, ey)
      ctx.stroke()

      ctx.fillStyle = colors[m % colors.length]
      ctx.beginPath()
      ctx.arc(ex, ey, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = alpha
      ctx.font = '11px JetBrains Mono'
      ctx.fillStyle = colors[m % colors.length]
      ctx.textAlign = 'center'
      ctx.fillText(`m=${m}`, ex, ey - 10)
      ctx.globalAlpha = 1
    }

    const [ix, iy] = [INITIAL_VECTOR[0], INITIAL_VECTOR[1]]
    ctx.strokeStyle = '#F1F5F9'
    ctx.lineWidth = 2.5
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + ix * radius, cy - iy * radius)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#F1F5F9'
    ctx.font = '12px JetBrains Mono'
    ctx.textAlign = 'left'
    ctx.fillText(
      isZh ? `初始向量: (${ix.toFixed(2)}, ${iy.toFixed(2)})` : `Initial vector: (${ix.toFixed(2)}, ${iy.toFixed(2)})`,
      12,
      22
    )

    const [curX, curY] = isAnimating
      ? rotateVector(INITIAL_VECTOR[0], INITIAL_VECTOR[1], displayPos, base, dim)
      : rotateVector(INITIAL_VECTOR[0], INITIAL_VECTOR[1], position, base, dim)

    ctx.fillStyle = colors[Math.floor(displayPos) % colors.length]
    ctx.font = '12px JetBrains Mono'
    ctx.fillText(
      isZh
        ? `旋转后: (${curX.toFixed(2)}, ${curY.toFixed(2)})`
        : `Rotated: (${curX.toFixed(2)}, ${curY.toFixed(2)})`,
      12,
      42
    )

    if (!isAnimating) {
      const theta0 = position / Math.pow(base, 0 / dim)
      ctx.fillStyle = '#94A3B8'
      ctx.font = '11px JetBrains Mono'
      ctx.fillText(
        isZh ? `θ(m=${position}, i=0) = ${theta0.toFixed(3)} rad` : `θ(m=${position}, i=0) = ${theta0.toFixed(3)} rad`,
        12,
        62
      )
    }
  }

  const drawTheta = () => {
    const canvas = thetaCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = thetaContainerRef.current
    const containerWidth = container?.clientWidth || 400
    const size = Math.min(containerWidth, 380)
    const height = Math.min(container?.clientHeight || 220, 220)
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

    const padLeft = 48
    const padRight = 16
    const padTop = 24
    const padBottom = 36
    const plotW = size - padLeft - padRight
    const plotH = height - padTop - padBottom

    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padLeft, padTop)
    ctx.lineTo(padLeft, padTop + plotH)
    ctx.lineTo(padLeft + plotW, padTop + plotH)
    ctx.stroke()

    const numPairs = dim / 2
    const maxTheta = position / Math.pow(base, 0 / dim) + 0.5
    const thetaScale = maxTheta > 0 ? plotH / maxTheta : 1

    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < numPairs; i++) {
      const theta = position / Math.pow(base, (2 * i) / dim)
      const x = padLeft + (i / Math.max(1, numPairs - 1)) * plotW
      const y = padTop + plotH - theta * thetaScale
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    for (let i = 0; i < numPairs; i++) {
      const theta = position / Math.pow(base, (2 * i) / dim)
      const x = padLeft + (i / Math.max(1, numPairs - 1)) * plotW
      const y = padTop + plotH - theta * thetaScale
      ctx.fillStyle = '#22D3EE'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#94A3B8'
      ctx.font = '10px JetBrains Mono'
      ctx.textAlign = 'center'
      ctx.fillText(`i=${i * 2}`, x, padTop + plotH + 16)
    }

    ctx.fillStyle = '#F1F5F9'
    ctx.font = '11px JetBrains Mono'
    ctx.textAlign = 'left'
    ctx.fillText(isZh ? `θ-频率曲线 (m=${position})` : `θ-Frequency curve (m=${position})`, padLeft, 14)

    ctx.save()
    ctx.translate(12, padTop + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#94A3B8'
    ctx.font = '10px JetBrains Mono'
    ctx.textAlign = 'center'
    ctx.fillText(isZh ? 'θ 值' : 'θ value', 0, 0)
    ctx.restore()

    ctx.fillStyle = '#94A3B8'
    ctx.font = '10px JetBrains Mono'
    ctx.textAlign = 'center'
    ctx.fillText(
      isZh ? '维度 index (低维=高频, 高维=低频)' : 'Dim index (low dim=high freq, high dim=low freq)',
      padLeft + plotW / 2,
      height - 6
    )
  }

  const drawAll = () => {
    draw()
    drawTheta()
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => drawAll())

    const container = containerRef.current
    const tContainer = thetaContainerRef.current
    let ro1: ResizeObserver | null = null
    let ro2: ResizeObserver | null = null

    if (typeof ResizeObserver !== 'undefined') {
      ro1 = new ResizeObserver(() => drawAll())
      if (container) ro1.observe(container)
      ro2 = new ResizeObserver(() => drawAll())
      if (tContainer) ro2.observe(tContainer)
    }
    const onResize = () => drawAll()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      if (ro1) ro1.disconnect()
      if (ro2) ro2.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    drawAll()
  }, [position, base, maxPos, dim])

  useEffect(() => {
    if (isAnimating) {
      const tick = () => {
        animPosRef.current += animSpeedRef.current
        if (animPosRef.current >= maxPos) animPosRef.current = 0
        drawAll()
        animRafRef.current = requestAnimationFrame(tick)
      }
      animRafRef.current = requestAnimationFrame(tick)
    } else {
      if (animRafRef.current !== null) {
        cancelAnimationFrame(animRafRef.current)
        animRafRef.current = null
      }
      animPosRef.current = 0
    }
    return () => {
      if (animRafRef.current !== null) {
        cancelAnimationFrame(animRafRef.current)
        animRafRef.current = null
      }
    }
  }, [isAnimating, maxPos])

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-100 text-center">
        {isZh ? 'RoPE 旋转位置编码' : 'RoPE Rotary Position Embedding'}
      </h2>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[250px] flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800"
      >
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div
        ref={thetaContainerRef}
        className="relative min-h-[180px] flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 p-2"
      >
        <canvas ref={thetaCanvasRef} className="rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300 w-24 shrink-0">
            {isZh ? '位置 m' : 'Position m'}: {position}
          </label>
          <input
            type="range"
            min={0}
            max={maxPos}
            step={1}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            disabled={isAnimating}
            className="flex-1 accent-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300 w-24 shrink-0">
            {isZh ? '频率基数' : 'Base'}: {base}
          </label>
          <input
            type="range"
            min={100}
            max={20000}
            step={100}
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            className="flex-1 accent-violet-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAnimating((v) => !v)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: isAnimating ? '#EC4899' : '#6366F1',
              color: '#F8FAFC',
            }}
          >
            {isAnimating ? (isZh ? '停止' : 'Stop') : isZh ? '播放动画' : 'Play Animation'}
          </button>
        </div>

        <div className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900 rounded p-2 border border-slate-800">
          <p>[x, y] &rarr; [x cos(m&theta;) - y sin(m&theta;), x sin(m&theta;) + y cos(m&theta;)]</p>
          <p className="mt-1 text-slate-500 font-sans">
            {isZh
              ? 'RoPE 通过旋转 Query/Key 向量来编码位置信息，不同位置旋转不同角度'
              : 'RoPE encodes position by rotating Query/Key vectors, with different positions rotating by different angles'}
          </p>
        </div>
      </div>
    </div>
  )
}
