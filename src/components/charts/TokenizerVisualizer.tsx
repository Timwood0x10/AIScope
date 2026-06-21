import { useState, useEffect, useRef } from 'react'
import { bpeTokenize } from '../../utils/math/matrix'
import { useI18n } from '../../i18n/context'

interface TokenizerVisualizerProps {
  defaultText?: string
  maxSteps?: number
}

export default function TokenizerVisualizer({
  defaultText = 'the quick brown fox jumps over the lazy dog',
  maxSteps = 8,
}: TokenizerVisualizerProps) {
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const [text, setText] = useState(defaultText)
  const [step, setStep] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { tokens, merges } = bpeTokenize(text, maxSteps)
  const fullResult = bpeTokenize(text, step)
  const currentTokens = fullResult.tokens
  const currentMerges = fullResult.merges
  const totalSteps = merges.length

  const getMergeDepth = (token: string): number => {
    if (token.length <= 1) return 0
    let depth = 0
    for (let i = 0; i < currentMerges.length; i++) {
      if (token.includes(currentMerges[i].pair)) {
        depth = Math.max(depth, currentMerges[i].step)
      }
    }
    return Math.min(depth, 5)
  }

  const getColor = (depth: number, isHighlight: boolean): string => {
    const colors = ['#1E3A5F', '#3B5A9F', '#6366F1', '#8B5CF6', '#22D3EE', '#67E8F9']
    const color = colors[Math.min(depth, colors.length - 1)]
    if (isHighlight) return color
    return color
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const width = container?.clientWidth || 400
    const height = container?.clientHeight || 300
    if (width < 50 || height < 50) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, width, height)

    if (currentTokens.length === 0) return

    const padding = 16
    const gap = 6
    const rowHeight = 48
    const rowSpacing = 14
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentRowWidth = 0
    const maxRowWidth = width - padding * 2

    ctx.font = '14px JetBrains Mono, monospace'
    for (const tok of currentTokens) {
      const tw = ctx.measureText(tok).width + 28
      if (currentRowWidth + tw + (currentRow.length > 0 ? gap : 0) > maxRowWidth && currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = [tok]
        currentRowWidth = tw
      } else {
        currentRow.push(tok)
        currentRowWidth += tw + (currentRow.length > 1 ? gap : 0)
      }
    }
    if (currentRow.length > 0) rows.push(currentRow)

    const totalHeight = rows.length * rowHeight + (rows.length - 1) * rowSpacing
    let startY = Math.max(padding, (height - totalHeight) / 2)

    const highlightPair = step > 0 && step <= totalSteps ? merges[step - 1]?.pair : null

    for (let r = 0; r < rows.length; r++) {
      const rowTokens = rows[r]
      const rowWidth = rowTokens.reduce((acc, tok) => {
        ctx.font = '14px JetBrains Mono, monospace'
        return acc + ctx.measureText(tok).width + 28
      }, 0) + (rowTokens.length - 1) * gap
      let x = (width - rowWidth) / 2
      const y = startY + r * (rowHeight + rowSpacing)

      for (const tok of rowTokens) {
        ctx.font = '14px JetBrains Mono, monospace'
        const tokWidth = ctx.measureText(tok).width + 28
        const depth = getMergeDepth(tok)
        const isHighlight = highlightPair && tok === highlightPair

        ctx.fillStyle = getColor(depth, isHighlight)
        ctx.globalAlpha = tok === ' ' ? 0.2 : 1
        ctx.beginPath()
        const radius = 8
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + tokWidth - radius, y)
        ctx.quadraticCurveTo(x + tokWidth, y, x + tokWidth, y + radius)
        ctx.lineTo(x + tokWidth, y + rowHeight - radius)
        ctx.quadraticCurveTo(x + tokWidth, y + rowHeight, x + tokWidth - radius, y + rowHeight)
        ctx.lineTo(x + radius, y + rowHeight)
        ctx.quadraticCurveTo(x, y + rowHeight, x, y + rowHeight - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1

        if (isHighlight) {
          ctx.strokeStyle = '#FCD34D'
          ctx.lineWidth = 3
          ctx.stroke()
        }

        ctx.fillStyle = depth >= 3 ? '#0F172A' : '#F1F5F9'
        ctx.font = '14px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const display = tok === ' ' ? '␣' : tok
        ctx.fillText(display, x + tokWidth / 2, y + rowHeight / 2)

        x += tokWidth + gap
      }
    }
  }

  useEffect(() => {
    draw()
  }, [step, text, maxSteps])

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

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleReset = () => {
    setStep(0)
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-100">
          {isZh ? 'BPE 分词演示' : 'BPE Tokenization'}
        </h3>
        <div className="flex items-center gap-2 text-sm text-dark-400">
          <span>{isZh ? '当前 Token 数' : 'Current Token Count'}:</span>
          <span className="font-mono text-primary font-semibold">{currentTokens.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm text-dark-300">
          {isZh ? '输入文本' : 'Input Text'}
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setStep(0)
          }}
          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-dark-300">
          <span>{isZh ? '合并步骤' : 'Merge Steps'}</span>
          <span className="font-mono text-primary">{step} / {totalSteps}</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps, 1)}
          value={step}
          onChange={(e) => setStep(Math.min(parseInt(e.target.value), totalSteps))}
          className="w-full accent-indigo-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-5 py-2 bg-dark-800 hover:bg-dark-700 text-dark-100 text-sm rounded-lg border border-dark-700 transition-colors"
        >
          {isZh ? '重置' : 'Reset'}
        </button>
        <button
          onClick={handleNext}
          disabled={step >= totalSteps}
          className="px-5 py-2 bg-primary hover:bg-indigo-500 disabled:bg-dark-800 disabled:text-dark-500 text-white text-sm rounded-lg transition-colors"
        >
          {isZh ? '下一步' : 'Next Step'}
        </button>
      </div>

      <div ref={containerRef} className="relative flex-1 min-h-[250px] flex items-center justify-center bg-dark-800 rounded-lg border border-dark-700">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      {currentMerges.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-xs text-dark-400">
          <span>{isZh ? '合并历史' : 'Merge History'}:</span>
          {currentMerges.map((m, i) => (
            <span key={i} className="px-2 py-1 bg-dark-800 border border-dark-700 rounded font-mono text-accent">
              " {m.pair} "
            </span>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-dark-500">
        {isZh ? 'BPE 通过贪心合并高频字符对来构建子词词汇表' : 'BPE builds subword vocabulary by greedily merging frequent character pairs'}
      </div>
    </div>
  )
}
