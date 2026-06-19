import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Lightbulb, RotateCcw, Play, Pause, RotateCw, Eye, EyeOff, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 损失函数：带有多个局部最小值的复杂曲面
function lossFunction(x: number, y: number): number {
  // 主山谷（全局最小）
  const main = 0.5 * ((x - 2) ** 2 + (y - 1) ** 2)
  // 局部最小值 1
  const local1 = 2 * Math.exp(-((x + 2) ** 2 + (y - 2) ** 2) / 1.5)
  // 局部最小值 2
  const local2 = 1.5 * Math.exp(-((x - 3) ** 2 + (y + 2) ** 2) / 1)
  // 脊线
  const ridge = 0.3 * Math.sin(x * 1.5) * Math.cos(y * 1.5) * Math.exp(-(x ** 2 + y ** 2) / 20)
  
  return main + local1 + local2 + ridge + 3
}

// 梯度（偏导数）
function gradient(x: number, y: number): [number, number] {
  const eps = 0.01
  const dx = (lossFunction(x + eps, y) - lossFunction(x - eps, y)) / (2 * eps)
  const dy = (lossFunction(x, y + eps) - lossFunction(x, y - eps)) / (2 * eps)
  return [dx, dy]
}

// Adam 优化器模拟
class AdamOptimizer {
  m_x = 0
  m_y = 0
  v_x = 0
  v_y = 0
  beta1 = 0.9
  beta2 = 0.999
  eps = 1e-8

  step(x: number, y: number, grad_x: number, grad_y: number, lr: number, t: number): [number, number] {
    this.m_x = this.beta1 * this.m_x + (1 - this.beta1) * grad_x
    this.m_y = this.beta1 * this.m_y + (1 - this.beta1) * grad_y
    
    this.v_x = this.beta2 * this.v_x + (1 - this.beta2) * grad_x ** 2
    this.v_y = this.beta2 * this.v_y + (1 - this.beta2) * grad_y ** 2
    
    const m_x_hat = this.m_x / (1 - this.beta1 ** t)
    const m_y_hat = this.m_y / (1 - this.beta1 ** t)
    const v_x_hat = this.v_x / (1 - this.beta2 ** t)
    const v_y_hat = this.v_y / (1 - this.beta2 ** t)
    
    const newX = x - lr * m_x_hat / (Math.sqrt(v_x_hat) + this.eps)
    const newY = y - lr * m_y_hat / (Math.sqrt(v_y_hat) + this.eps)
    
    return [newX, newY]
  }
  
  reset() {
    this.m_x = 0
    this.m_y = 0
    this.v_x = 0
    this.v_y = 0
  }
}

type Optimizer = 'sgd' | 'momentum' | 'adam'
type Scenario = 'escape_local' | 'find_global' | 'oscillation' | 'saddle'

interface PathPoint {
  x: number
  y: number
  loss: number
}

const scenarios: Record<Scenario, { startX: number; startY: number }> = {
  escape_local: { startX: -2.5, startY: 2 },
  find_global: { startX: 0, startY: 0 },
  oscillation: { startX: -1, startY: -2 },
  saddle: { startX: 0, startY: 2.5 },
}

const scenarioNames: Record<Scenario, { zh: string; en: string }> = {
  escape_local: { zh: '逃离局部最小', en: 'Escape Local Min' },
  find_global: { zh: '直奔全局最小', en: 'Go to Global Min' },
  oscillation: { zh: '震荡之舞', en: 'Oscillation Dance' },
  saddle: { zh: '鞍点陷阱', en: 'Saddle Point Trap' },
}

const scenarioDescriptions: Record<Scenario, { zh: string; en: string }> = {
  escape_local: { zh: '从局部最小值逃到全局最小值', en: 'Escape from local min to global min' },
  find_global: { zh: '从山顶直接滚到谷底', en: 'Roll from hilltop to valley bottom' },
  oscillation: { zh: '学习率太大导致震荡', en: 'Too large learning rate causes oscillation' },
  saddle: { zh: '在鞍点附近徘徊', en: 'Wandering near saddle point' },
}

export default function LossSurfaceGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [gamePhase, setGamePhase] = useState<'intro' | 'play' | 'complete'>('intro')
  const [scenario, setScenario] = useState<Scenario>('escape_local')
  const [optimizer, setOptimizer] = useState<Optimizer>('sgd')
  const [learningRate, setLearningRate] = useState(0.1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [path, setPath] = useState<PathPoint[]>([])
  const [currentPoint, setCurrentPoint] = useState<PathPoint | null>(null)
  const [showContours, setShowContours] = useState(true)
  const [showSurface, setShowSurface] = useState(true)
  const [iterations, setIterations] = useState(0)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const optimizerRef = useRef(new AdamOptimizer())
  const paramsRef = useRef({ x: 0, y: 0 })
  const iterRef = useRef(0)

  const reset = useCallback(() => {
    const start = scenarios[scenario]
    paramsRef.current = { x: start.startX, y: start.startY }
    iterRef.current = 0
    optimizerRef.current.reset()
    setPath([])
    setCurrentPoint({ x: start.startX, y: start.startY, loss: lossFunction(start.startX, start.startY) })
    setIsPlaying(false)
    setIterations(0)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [scenario])

  const runStep = useCallback(() => {
    const [x, y] = gradient(paramsRef.current.x, paramsRef.current.y)
    
    let newX: number, newY: number
    
    if (optimizer === 'sgd') {
      newX = paramsRef.current.x - learningRate * x
      newY = paramsRef.current.y - learningRate * y
    } else if (optimizer === 'momentum') {
      // 简化的 momentum
      const momentum = 0.9
      const prevX = paramsRef.current.x
      const prevY = paramsRef.current.y
      newX = prevX - learningRate * (momentum * x + (1 - momentum) * x)
      newY = prevY - learningRate * (momentum * y + (1 - momentum) * y)
    } else {
      // Adam
      [newX, newY] = optimizerRef.current.step(
        paramsRef.current.x, paramsRef.current.y,
        x, y, learningRate, iterRef.current + 1
      )
    }
    
    paramsRef.current = { x: newX, y: newY }
    iterRef.current++
    
    const loss = lossFunction(newX, newY)
    const point = { x: newX, y: newY, loss }
    
    setPath(prev => [...prev, point])
    setCurrentPoint(point)
    setIterations(iterRef.current)
    
    // 到达最小值或超过最大迭代
    if (loss < 3.1 || iterRef.current > 150) {
      setIsPlaying(false)
    }
  }, [optimizer, learningRate])

  useEffect(() => {
    if (!isPlaying) return
    
    const animate = () => {
      runStep()
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, runStep])

  // 绘制
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 50
    const gridSize = 80

    // 坐标转换
    const toScreen = (x: number, y: number): [number, number] => {
      const screenX = padding + ((x + 4) / 8) * (width - padding * 2)
      const screenY = height - padding - ((y + 4) / 8) * (height - padding * 2)
      return [screenX, screenY]
    }

    // 清除
    ctx.fillStyle = 'rgba(15, 23, 42, 1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制等高线
    if (showContours) {
      const levels = [3.5, 4, 5, 6, 7, 8, 10, 12]
      levels.forEach(level => {
        ctx.beginPath()
        let started = false
        
        for (let px = 0; px < gridSize; px++) {
          for (let py = 0; py < gridSize; py++) {
            const x = -4 + (px / gridSize) * 8
            const y = -4 + (py / gridSize) * 8
            const l = lossFunction(x, y)
            
            if (Math.abs(l - level) < 0.3) {
              const [sx, sy] = toScreen(x, y)
              if (!started) {
                ctx.moveTo(sx, sy)
                started = true
              } else {
                ctx.lineTo(sx, sy)
              }
            }
          }
        }
        
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + (1 - (level - 3) / 9) * 0.4})`
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    // 绘制曲面（用网格线模拟）
    if (showSurface) {
      for (let i = 0; i < 20; i++) {
        // 垂直线
        const x = -4 + (i / 20) * 8
        ctx.beginPath()
        for (let j = 0; j < 20; j++) {
          const y = -4 + (j / 20) * 8
          const [sx, sy] = toScreen(x, y)
          const l = lossFunction(x, y)
          const alpha = Math.max(0, Math.min(0.3, (8 - l) / 10))
          if (j === 0) {
            ctx.moveTo(sx, sy)
          } else {
            ctx.lineTo(sx, sy)
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.stroke()
      }
    }

    // 全局最小值标记
    const [gx, gy] = toScreen(2, 1)
    ctx.beginPath()
    ctx.arc(gx, gy, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
    ctx.fill()
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(isZh ? '全局最小' : 'Global Min', gx, gy - 15)

    // 路径
    if (path.length > 1) {
      ctx.beginPath()
      ctx.moveTo(...toScreen(path[0].x, path[0].y))
      path.forEach((p, i) => {
        const [sx, sy] = toScreen(p.x, p.y)
        ctx.lineTo(sx, sy)
      })
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)'
      ctx.lineWidth = 3
      ctx.stroke()

      // 路径点
      path.forEach((p, i) => {
        const [sx, sy] = toScreen(p.x, p.y)
        ctx.beginPath()
        ctx.arc(sx, sy, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 158, 11, ${0.3 + (i / path.length) * 0.7})`
        ctx.fill()
      })
    }

    // 当前点
    if (currentPoint) {
      const [sx, sy] = toScreen(currentPoint.x, currentPoint.y)
      ctx.beginPath()
      ctx.arc(sx, sy, 12, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.5)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sx, sy, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#f59e0b'
      ctx.fill()
    }

    // 坐标轴
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // 轴标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(isZh ? '参数 x' : 'Param x', width / 2, height - 15)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(isZh ? '参数 y' : 'Param y', 0, 0)
    ctx.restore()

  }, [path, currentPoint, showContours, showSurface, isZh])

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.lossSurface = { completed: true, score: 100 }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4">
        <div className="container-width max-w-5xl">
          <Link to="/games" className="text-sm text-dark-500 hover:text-dark-400 flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> {isZh ? '返回游戏大厅' : 'Back to Games'}
          </Link>

          <div className="glass-card p-8">
            {/* 标题 */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-5xl mb-3">🏔️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? 'Loss 曲面探险' : 'Loss Surface Explorer'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '在高维损失地貌中找到最低点' : 'Find the lowest point in high-dimensional loss landscape'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? '迭代' : 'Iteration'}</div>
                <div className="text-lg font-bold text-primary">{iterations}</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-heading text-lg font-semibold text-yellow-400">{isZh ? '什么是 Loss 曲面？' : 'What is a Loss Surface?'}</h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh ? '训练模型就是在这个曲面上"滚小球"——找到最低点（最优解）。但曲面上有很多"坑"（局部最小）和"山脊"，小球可能会被困住！' : 'Training a model is like rolling a ball on this surface — find the lowest point (optimal solution). But there are many "holes" (local minima) and "ridges" that can trap the ball!'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="text-emerald-400 font-medium mb-1">{isZh ? '🎯 全局最小' : '🎯 Global Minimum'}</div>
                      <div className="text-dark-500">{isZh ? '最佳解，模型最优' : 'The optimal solution'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="text-amber-400 font-medium mb-1">{isZh ? '🕳️ 局部最小' : '🕳️ Local Minimum'}</div>
                      <div className="text-dark-500">{isZh ? '不是最优，但容易陷入' : 'Not optimal but easy to get stuck'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <div className="text-red-400 font-medium mb-1">{isZh ? '⚡ 鞍点' : '⚡ Saddle Point'}</div>
                      <div className="text-dark-500">{isZh ? '一个方向上最小，另一方向最大' : 'Min in one direction, max in another'}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { reset(); setGamePhase('play') }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始探险 →' : 'Start Exploring →'}
                </button>
              </div>
            )}

            {/* 游戏主体 */}
            {gamePhase === 'play' && (
              <div className="animate-fade-in">
                {/* 场景和优化器选择 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* 场景 */}
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-sm text-dark-400 mb-3">{isZh ? '选择场景：' : 'Select scenario:'}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(scenarios) as Scenario[]).map(s => (
                        <button
                          key={s}
                          onClick={() => { setScenario(s); reset() }}
                          className={`p-3 rounded-lg text-left text-sm transition-all ${
                            scenario === s
                              ? 'bg-emerald-500/30 border border-emerald-500/50'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium">{isZh ? scenarioNames[s].zh : scenarioNames[s].en}</div>
                          <div className="text-xs text-dark-500">{isZh ? scenarioDescriptions[s].zh : scenarioDescriptions[s].en}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 优化器 */}
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-sm text-dark-400 mb-3">{isZh ? '选择优化器：' : 'Select optimizer:'}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['sgd', 'momentum', 'adam'] as Optimizer[]).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setOptimizer(opt)}
                          className={`p-3 rounded-lg text-center text-sm transition-all ${
                            optimizer === opt
                              ? 'bg-emerald-500/30 border border-emerald-500/50'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium capitalize">{opt}</div>
                          <div className="text-xs text-dark-500">
                            {opt === 'sgd' ? 'SGD' : opt === 'momentum' ? (isZh ? '动量' : 'Momentum') : 'Adam'}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* 学习率 */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-dark-400">{isZh ? '学习率' : 'Learning Rate'}</span>
                        <span className="font-mono text-emerald-400">{learningRate.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        value={learningRate}
                        onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 显示控制 */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setShowContours(!showContours)}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                      showContours ? 'bg-violet-500/30 text-violet-400' : 'bg-white/10 text-dark-400'
                    }`}
                  >
                    {showContours ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {isZh ? '等高线' : 'Contours'}
                  </button>
                  <button
                    onClick={() => setShowSurface(!showSurface)}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                      showSurface ? 'bg-blue-500/30 text-blue-400' : 'bg-white/10 text-dark-400'
                    }`}
                  >
                    {showSurface ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {isZh ? '曲面' : 'Surface'}
                  </button>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={reset}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-dark-400 transition-all flex items-center gap-2"
                    >
                      <RotateCw className="w-4 h-4" /> {isZh ? '重置' : 'Reset'}
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 ${
                        isPlaying ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? (isZh ? '暂停' : 'Pause') : (isZh ? '开始' : 'Start')}
                    </button>
                  </div>
                </div>

                {/* 画布 */}
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={500}
                  className="w-full rounded-xl bg-dark-100 border border-white/10 mb-4"
                />

                {/* 当前状态 */}
                {currentPoint && (
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 mb-4">
                    <div>
                      <div className="text-xs text-dark-500">x</div>
                      <div className="font-mono text-lg text-emerald-400">{currentPoint.x.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500">y</div>
                      <div className="font-mono text-lg text-emerald-400">{currentPoint.y.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500">Loss</div>
                      <div className="font-mono text-lg text-amber-400">{currentPoint.loss.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {/* 知识卡片 */}
                <div className="p-5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold">{isZh ? '💡 优化器的区别' : '💡 Optimizer Differences'}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-amber-400 font-medium mb-1">SGD</div>
                      <div className="text-dark-400">{isZh ? '最基础，像小球直接滚下坡。容易被局部最小困住。' : 'Most basic, like a ball rolling downhill. Easily trapped by local minima.'}</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-medium mb-1">Momentum</div>
                      <div className="text-dark-400">{isZh ? '有惯性，可以冲过小坑，但可能冲过头。' : 'Has inertia, can roll over small pits but may overshoot.'}</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-medium mb-1">Adam</div>
                      <div className="text-dark-400">{isZh ? '自适应学习率，更聪明，是现在最常用的。' : 'Adaptive learning rate, smarter, most commonly used now.'}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { complete(); setGamePhase('complete') }}
                  className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '完成！🎉' : 'Done! 🎉'}
                </button>
              </div>
            )}

            {/* 完成 */}
            {gamePhase === 'complete' && (
              <div className="animate-fade-in text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">{isZh ? 'Loss 曲面探险家！' : 'Loss Surface Explorer!'}</h3>
                <p className="text-dark-400 mb-6">
                  {isZh ? '你现在理解了：训练模型就是用梯度下降在 Loss 曲面上找最低点。不同的优化器和学习率会导致完全不同的结果！' : 'Now you understand: training a model is using gradient descent to find the lowest point on the loss surface. Different optimizers and learning rates lead to completely different results!'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-emerald-400 font-medium mb-2">{isZh ? '🎯 全局 vs 局部最小' : '🎯 Global vs Local Min'}</div>
                    <div className="text-sm text-dark-400">
                      {isZh ? '真实大模型的 Loss 曲面极其复杂，有无数个局部最小。但只要找到一个足够好的解就够了！' : 'Real large model loss surfaces are extremely complex with countless local minima. But finding a good enough solution is enough!'}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-amber-400 font-medium mb-2">{isZh ? '⚡ 为什么 Adam 最常用？' : '⚡ Why is Adam the most common?'}</div>
                    <div className="text-sm text-dark-400">
                      {isZh ? '它对每个参数自适应调整学习率，不用手动调参，而且不容易陷入局部最小。' : 'It adapts learning rate for each parameter, no manual tuning needed, and less likely to get stuck in local minima.'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                    <RotateCw className="w-4 h-4" /> {isZh ? '再玩一次' : 'Play Again'}
                  </button>
                  <Link to="/games" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center hover:opacity-90 transition-all">
                    {isZh ? '返回游戏大厅' : 'Back to Games'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
