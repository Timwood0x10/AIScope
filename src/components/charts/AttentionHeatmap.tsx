import { useEffect, useRef, useMemo } from 'react'
import { attention, randomMatrix, Matrix } from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface AttentionHeatmapProps {
  seqLength?: number
  headDim?: number
  scaleFactor?: number
  showWeights?: boolean
}

export default function AttentionHeatmap({
  seqLength = 4,
  headDim = 64,
  scaleFactor = 0.125,
  showWeights = true,
}: AttentionHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const { Q, K, V, weights, output } = useMemo(() => {
    const Q = randomMatrix(seqLength, headDim, 0.5)
    const K = randomMatrix(seqLength, headDim, 0.5)
    const V = randomMatrix(seqLength, headDim, 0.5)
    const { attentionWeights, output } = attention(Q, K, V, scaleFactor)
    return { Q, K, V, weights: attentionWeights, output }
  }, [seqLength, headDim, scaleFactor])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 使用容器尺寸作为 canvas 尺寸，避免 offsetWidth=0 的问题
    const container = containerRef.current
    const containerWidth = container?.clientWidth || 400
    const containerHeight = container?.clientHeight || 300
    const size = Math.min(containerWidth, containerHeight, 500)
    if (size < 50) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    const cellSize = size / seqLength
    const padding = 2

    // Clear canvas
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, size, size)

    // Draw heatmap
    for (let i = 0; i < seqLength; i++) {
      for (let j = 0; j < seqLength; j++) {
        const value = weights[i][j]
        const color = getHeatmapColor(value)
        ctx.fillStyle = color
        ctx.fillRect(
          j * cellSize + padding,
          i * cellSize + padding,
          cellSize - padding * 2,
          cellSize - padding * 2
        )

        // Draw value text
        ctx.fillStyle = value > 0.5 ? '#0F172A' : '#F1F5F9'
        ctx.font = `${Math.max(10, cellSize / 4)}px JetBrains Mono`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          value.toFixed(2),
          j * cellSize + cellSize / 2,
          i * cellSize + cellSize / 2
        )
      }
    }
  }

  // 初始渲染 + 依赖项变化时重绘
  useEffect(() => {
    draw()
  }, [weights, seqLength])

  // 使用 ResizeObserver 监听容器尺寸变化，确保画布始终正确渲染
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 延迟一帧再绘制，确保布局完成
    const raf = requestAnimationFrame(() => draw())

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => draw())
      resizeObserver.observe(container)
    }
    // 兼容回退：监听 window resize
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
      <div ref={containerRef} className="relative flex-1 min-h-[300px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
        />
      </div>

      {showWeights && (
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6366F1' }} />
            <span className="text-dark-400">{isZh ? '高权重' : 'High Weight'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22D3EE' }} />
            <span className="text-dark-400">{isZh ? '中权重' : 'Medium Weight'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0F172A' }} />
            <span className="text-dark-400">{isZh ? '低权重' : 'Low Weight'}</span>
          </div>
        </div>
      )}

      <div className="text-center text-dark-400 text-sm">
        <p>{isZh ? '注意力权重矩阵 (Softmax(QK^T/√d)V)' : 'Attention Weight Matrix (Softmax(QK^T/√d)V)'}</p>
        <p className="font-mono text-xs mt-1">
          {isZh ? '序列长度' : 'Seq Length'}: {seqLength} | {isZh ? '头维度' : 'Head Dim'}: {headDim}
        </p>
      </div>
    </div>
  )
}

function getHeatmapColor(value: number): string {
  if (value < 0.1) return '#0F172A'
  if (value < 0.2) return '#1E3A5F'
  if (value < 0.3) return '#2B4A7F'
  if (value < 0.4) return '#3B5A9F'
  if (value < 0.5) return '#4B6ABF'
  if (value < 0.6) return '#5B7ADF'
  if (value < 0.7) return '#6366F1'
  if (value < 0.8) return '#8B5CF6'
  if (value < 0.9) return '#22D3EE'
  return '#67E8F9'
}
