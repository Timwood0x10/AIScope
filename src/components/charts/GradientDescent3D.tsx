import { useEffect, useRef, useState, useCallback } from 'react'
import { lossFunctions, LossFunction, sgd } from '../../utils/math/optimizer'
import { randomVector } from '../../utils/math/vector'
import { Play, Pause, RotateCcw } from 'lucide-react'
import Button from '../ui/Button'
import { useI18n } from '../../i18n/context'

interface GradientDescent3DProps {
  functionName?: string
}

interface Point3D {
  x: number
  y: number
  z: number
}

export default function GradientDescent3D({
  functionName = 'sphere',
}: GradientDescent3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [isRunning, setIsRunning] = useState(false)
  const [currentFn, setCurrentFn] = useState(functionName)
  const [trajectory, setTrajectory] = useState<Point3D[]>([])
  const animationRef = useRef<number>()

  const lossFn = lossFunctions[currentFn].fn
  const bounds = lossFunctions[currentFn].bounds

  const reset = useCallback(() => {
    setTrajectory([])
    setIsRunning(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const startAnimation = useCallback(() => {
    reset()

    let position = [bounds[0] + Math.random() * (bounds[1] - bounds[0]), bounds[2] + Math.random() * (bounds[3] - bounds[2])]
    const learningRate = 0.05
    const newTrajectory: Point3D[] = []

    const animate = () => {
      const [x, y] = position
      const z = lossFn(x, y)

      newTrajectory.push({ x, y, z })
      setTrajectory([...newTrajectory])

      // Gradient approximation
      const dx = (lossFn(x + 0.01, y) - lossFn(x - 0.01, y)) / 0.02
      const dy = (lossFn(x, y + 0.01) - lossFn(x, y - 0.01)) / 0.02

      position = [
        Math.max(bounds[0], Math.min(bounds[1], x - learningRate * dx)),
        Math.max(bounds[2], Math.min(bounds[3], y - learningRate * dy)),
      ]

      if (newTrajectory.length < 200 && lossFn(position[0], position[1]) > 0.01) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsRunning(false)
      }
    }

    setIsRunning(true)
    animate()
  }, [lossFn, bounds, reset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    const width = container?.clientWidth || 600
    const height = container?.clientHeight || 400
    if (width < 50 || height < 50) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    const padding = 40
    const plotWidth = width - padding * 2
    const plotHeight = height - padding * 2

    // Clear canvas
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, width, height)

    // Draw contour lines
    const numLevels = 15
    for (let level = 0; level < numLevels; level++) {
      const levelValue = (level / numLevels) * 100

      ctx.beginPath()
      ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 + level * 0.05})`
      ctx.lineWidth = 1

      for (let px = 0; px < plotWidth; px += 2) {
        for (let py = 0; py < plotHeight; py += 2) {
          const x = bounds[0] + (px / plotWidth) * (bounds[1] - bounds[0])
          const y = bounds[2] + (py / plotHeight) * (bounds[3] - bounds[2])
          const z = lossFn(x, y)

          if (Math.abs(z - levelValue) < 2) {
            const screenX = padding + px
            const screenY = height - padding - py

            if (px === 0 && py === 0) {
              ctx.moveTo(screenX, screenY)
            } else {
              ctx.lineTo(screenX, screenY)
            }
          }
        }
      }
      ctx.stroke()
    }

    // Draw trajectory
    if (trajectory.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#22D3EE'
      ctx.lineWidth = 2
      ctx.shadowColor = '#22D3EE'
      ctx.shadowBlur = 10

      trajectory.forEach((point, i) => {
        const screenX = padding + ((point.x - bounds[0]) / (bounds[1] - bounds[0])) * plotWidth
        const screenY = height - padding - ((point.y - bounds[2]) / (bounds[3] - bounds[2])) * plotHeight

        if (i === 0) {
          ctx.moveTo(screenX, screenY)
        } else {
          ctx.lineTo(screenX, screenY)
        }
      })
      ctx.stroke()

      // Draw current position
      const lastPoint = trajectory[trajectory.length - 1]
      const lastX = padding + ((lastPoint.x - bounds[0]) / (bounds[1] - bounds[0])) * plotWidth
      const lastY = height - padding - ((lastPoint.y - bounds[2]) / (bounds[3] - bounds[2])) * plotHeight

      ctx.beginPath()
      ctx.fillStyle = '#22D3EE'
      ctx.shadowColor = '#22D3EE'
      ctx.shadowBlur = 20
      ctx.arc(lastX, lastY, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw axis labels
    ctx.fillStyle = '#94A3B8'
    ctx.font = '12px JetBrains Mono'
    ctx.fillText(`x: [${bounds[0]}, ${bounds[1]}]`, padding, height - 10)
    ctx.fillText(`y: [${bounds[2]}, ${bounds[3]}]`, width / 2, height - 10)
    ctx.fillText(`Loss: ${lossFn.name}`, width - 100, height - 10)

  }, [trajectory, lossFn, bounds])

  // ResizeObserver: 确保画布尺寸正确
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const raf = requestAnimationFrame(() => {
      // 触发重绘
      setTrajectory(t => [...t])
    })

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setTrajectory(t => [...t])
      })
      resizeObserver.observe(container)
    }

    return () => {
      cancelAnimationFrame(raf)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={currentFn}
          onChange={(e) => {
            setCurrentFn(e.target.value)
            reset()
          }}
          className="px-4 py-2 rounded-xl bg-dark-50 border border-white/10 text-dark-700 focus:outline-none focus:border-primary"
        >
          {Object.keys(lossFunctions).map((name) => (
            <option key={name} value={name}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>

        <Button onClick={isRunning ? () => setIsRunning(false) : startAnimation} variant="primary" size="sm">
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />{isZh ? ' 暂停' : ' Pause'}
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />{isZh ? ' 开始' : ' Start'}
            </>
          )}
        </Button>

        <Button onClick={reset} variant="ghost" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />{isZh ? ' 重置' : ' Reset'}
        </Button>

        <div className="ml-auto text-sm text-dark-400">
          {isZh ? '迭代次数' : 'Iterations'}: {trajectory.length}
        </div>
      </div>

      <div ref={containerRef} className="relative h-[400px]">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
        />
      </div>

      <div className="text-center text-dark-400 text-sm">
        <p>{isZh ? '梯度下降轨迹可视化' : 'Gradient Descent Trajectory'}</p>
        <p className="font-mono text-xs mt-1">
          {isZh ? '损失函数' : 'Loss Function'}: {currentFn} | {isZh ? '学习率' : 'Learning Rate'}: 0.05
        </p>
      </div>
    </div>
  )
}
