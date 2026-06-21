import { useState, useEffect, useRef } from 'react'
import { seededRandom } from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface CausalMaskVisualizerProps {
  seqLength?: number
}

export default function CausalMaskVisualizer({ seqLength = 5 }: CausalMaskVisualizerProps) {
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const [length, setLength] = useState(seqLength)
  const [showValues, setShowValues] = useState(false)
  const [selected, setSelected] = useState<{ i: number; j: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const size = Math.min(container?.clientWidth || 400, container?.clientHeight || 300, 480)
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

    const cellSize = size / (length + 1)
    const gridPadding = cellSize * 0.5
    const padding = 2
    const innerSize = cellSize - padding * 2

    ctx.font = `${Math.max(10, cellSize / 3)}px JetBrains Mono, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#94A3B8'

    for (let i = 0; i < length; i++) {
      ctx.fillText(`${i}`, gridPadding + i * cellSize + cellSize / 2, cellSize / 2)
      ctx.fillText(`${i}`, cellSize / 2, gridPadding + i * cellSize + cellSize / 2)
    }

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const x = gridPadding + j * cellSize + padding
        const y = gridPadding + i * cellSize + padding
        const isMasked = j > i
        const isSelected = selected && selected.i === i && selected.j === j

        if (isMasked) {
          ctx.fillStyle = '#1E293B'
          ctx.fillRect(x, y, innerSize, innerSize)
          ctx.save()
          ctx.beginPath()
          ctx.rect(x, y, innerSize, innerSize)
          ctx.clip()
          ctx.strokeStyle = '#334155'
          ctx.lineWidth = 1
          const step = 8
          for (let k = -innerSize; k < innerSize * 2; k += step) {
            ctx.beginPath()
            ctx.moveTo(x + k, y)
            ctx.lineTo(x + k + innerSize, y + innerSize)
            ctx.stroke()
          }
          ctx.restore()
          if (showValues) {
            ctx.fillStyle = '#475569'
            ctx.font = `${Math.max(8, cellSize / 4)}px JetBrains Mono, monospace`
            ctx.fillText('-∞', x + innerSize / 2, y + innerSize / 2)
          }
        } else {
          const rnd = seededRandom(i * 131 + j * 7 + 42)
          const val = 0.2 + rnd * 0.8
          ctx.fillStyle = getMaskColor(val)
          ctx.fillRect(x, y, innerSize, innerSize)
          if (showValues) {
            ctx.fillStyle = val > 0.5 ? '#0F172A' : '#F1F5F9'
            ctx.font = `${Math.max(8, cellSize / 4)}px JetBrains Mono, monospace`
            ctx.fillText('1', x + innerSize / 2, y + innerSize / 2)
          }
        }

        if (isSelected) {
          ctx.strokeStyle = '#FCD34D'
          ctx.lineWidth = 3
          ctx.strokeRect(x + 1, y + 1, innerSize - 2, innerSize - 2)
        }
      }
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const size = Math.min(rect.width, rect.height)
    const cellSize = size / (length + 1)
    const gridPadding = cellSize * 0.5
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const j = Math.floor((px - gridPadding) / cellSize)
    const i = Math.floor((py - gridPadding) / cellSize)
    if (i >= 0 && i < length && j >= 0 && j < length) {
      setSelected({ i, j })
    }
  }

  useEffect(() => {
    draw()
  }, [length, showValues, selected])

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-100">
          {isZh ? '因果掩码 (Causal Mask)' : 'Causal Mask'}
        </h3>
        <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showValues}
            onChange={(e) => setShowValues(e.target.checked)}
            className="accent-indigo-500"
          />
          {isZh ? '显示掩码值' : 'Show Values'}
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-dark-300">
          <span>{isZh ? '序列长度' : 'Seq Length'}</span>
          <span className="font-mono text-primary">{length}</span>
        </div>
        <input
          type="range"
          min={2}
          max={8}
          value={length}
          onChange={(e) => {
            setLength(parseInt(e.target.value))
            setSelected(null)
          }}
          className="w-full accent-indigo-500"
        />
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[250px] flex items-center justify-center bg-dark-800 rounded-lg border border-dark-700"
      >
        <canvas ref={canvasRef} className="rounded-lg cursor-pointer" onClick={handleClick} />
      </div>

      {selected && (
        <div className="text-center text-sm text-dark-300 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3">
          <div className="font-mono text-primary mb-1">
            ({selected.i}, {selected.j}): {selected.j > selected.i ? '-∞' : '1'}
          </div>
          <div>
            {selected.j > selected.i
              ? (isZh
                  ? `位置 ${selected.i} 不能关注位置 ${selected.j}（j > i，信息来自未来）`
                  : `Position ${selected.i} cannot attend to position ${selected.j} (j > i, future info)`)
              : (isZh
                  ? `位置 ${selected.i} 可以关注位置 ${selected.j}（j ≤ i，信息可见）`
                  : `Position ${selected.i} can attend to position ${selected.j} (j ≤ i, visible)`)
            }
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center text-xs text-dark-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(90deg, #0F172A, #6366F1)' }} />
          <span>{isZh ? '可访问' : 'Accessible'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-700" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #475569 0, #475569 2px, transparent 2px, transparent 6px)' }} />
          <span>{isZh ? '被掩码' : 'Masked'}</span>
        </div>
      </div>

      <div className="text-center text-xs text-dark-500">
        {isZh
          ? `因果掩码确保解码器在生成第 i 个 token 时，不能使用第 i+1 及之后的 token 信息（位置 i 只能关注位置 0 到 i 的 token）`
          : `Causal mask ensures the decoder cannot use tokens i+1 or beyond when generating token i (position i can only attend to tokens 0 through i)`}
      </div>
    </div>
  )
}

function getMaskColor(value: number): string {
  const colors = ['#1E3A5F', '#2B4A7F', '#3B5A9F', '#4B6ABF', '#5B7ADF', '#6366F1', '#8B5CF6', '#22D3EE']
  const index = Math.min(colors.length - 1, Math.max(0, Math.floor(value * colors.length)))
  return colors[index]
}
