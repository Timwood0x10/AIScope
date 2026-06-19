import { useState, useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, ArrowDown, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 一个"山谷"函数 —— 有多个局部最小值
function height(x: number, y: number): number {
  // 主山谷（全局最低
  const main = 2 * (x - 3) ** 2 + 2 * (y + 2) ** 2
  // 一个小山峰
  const bump = -15 * Math.exp(-((x + 2) ** 2 + (y - 1) ** 2) / 4)
  // 另外一个局部最小值
  const valley2 = 8 * Math.exp(-((x - 4) ** 2 + (y - 4) ** 2) / 1.5)
  return main + bump + valley2 + 5
}

// 梯度 = (∂f/∂x, ∂f/∂y)，数值梯度
function gradient(x: number, y: number): [number, number] {
  const eps = 0.01
  const dx = (height(x + eps, y) - height(x - eps, y)) / (2 * eps)
  const dy = (height(x, y + eps) - height(x, y - eps)) / (2 * eps)
  return [dx, dy]
}

// 绘制 2D 高度热力图
function ValleyMap({ player, trajectory, showPath, isZh }: any) {
  const resolution = 80
  const [xMin, xMax] = [-7, 7]
  const [yMin, yMax] = [-6, 6]

  // 生成 heatmap data
  const cells = []
  let maxH = -Infinity
  let minH = Infinity
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = xMin + (j / (resolution - 1)) * (xMax - xMin)
      const y = yMin + (i / (resolution - 1)) * (yMax - yMin)
      const h = height(x, y)
      if (h > maxH) maxH = h
      if (h < minH) minH = h
      cells.push({ x, y, h })
    }
  }

  const posToPx = (x: number, y: number) => {
    const px = ((x - xMin) / (xMax - xMin)) * 100
    const py = ((y - yMin) / (yMax - yMin)) * 100
    return [px, py]
  }

  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto rounded-2xl overflow-hidden bg-dark-100 border border-white/10">
      {/* 热力图 */}
      <div className="absolute inset-0" style={{ imageRendering: 'pixelated' }}>
        {cells.map((c, i) => {
          const t = (c.h - minH) / (maxH - minH)
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${((c.x - xMin) / (xMax - xMin)) * 100}%`,
                top: `${((c.y - yMin) / (yMax - yMin)) * 100}%`,
                width: `${100 / resolution}%`,
                height: `${100 / resolution}%`,
                backgroundColor: `rgba(${Math.round(t * 180)}, ${Math.round(80)}, ${Math.round(180 - t * 180)}, ${0.15 + t * 0.3})`
              }}
            />
          )
        })}
      </div>

      {/* 等高线标签 */}
      <div className="absolute top-2 right-2 text-xs text-dark-500 bg-dark-100/50 px-2 py-1 rounded">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 inline-block"> </div> {isZh ? '山谷' : 'Valley'}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 inline-block"> </div> {isZh ? '山峰' : 'Peak'}
        </div>
      </div>

      {/* 全局最低点（目标） */}
      {(() => {
        const [px, py] = posToPx(3, -2)
        return (
          <div
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse"
            style={{ left: `${px}%`, top: `${py}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-green-500/80 shadow-lg shadow-green-500/50 border-2 border-green-300"></div>
          </div>
        )
      })()}

      {/* 轨迹 */}
      {showPath && trajectory.map((p: [number, number], idx: number) => {
        const [px, py] = posToPx(p[0], p[1])
        return (
          <div
            key={idx}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400/60 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `${px}%`, top: `${py}%`, opacity: 0.3 + (idx / trajectory.length) * 0.5 }}
          />
        )
      })}

      {/* 玩家（你） */}
      {(() => {
        const [px, py] = posToPx(player.x, player.y)
        return (
          <div
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `${px}%`, top: `${py}%` }}
          >
            <div className="w-full h-full rounded-full bg-white shadow-lg border-2 border-yellow-400 flex items-center justify-center text-sm">🧗</div>
          </div>
        )
      })()}
    </div>
  )
}

export default function ValleyGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [step, setStep] = useState(0)
  const [player, setPlayer] = useState({ x: -3, y: 4 })
  const [trajectory, setTrajectory] = useState<Array<[number, number]>>([[-3, 4]])
  const [learningRate, setLearningRate] = useState(0.05)
  const [autoPlaying, setAutoPlaying] = useState(false)
  const autoRef = useRef(false)

  const currentHeight = height(player.x, player.y)
  const [gx, gy] = gradient(player.x, player.y)
  const gradMagnitude = Math.sqrt(gx * gx + gy * gy)
  const isNearMin = gradMagnitude < 0.01

  useEffect(() => {
    if (!autoPlaying) return
    autoRef.current = true
    const timer = setInterval(() => {
      setPlayer(p => {
        const [dx, dy] = gradient(p.x, p.y)
        const nx = p.x - learningRate * dx
        const ny = p.y - learningRate * dy
        setTrajectory(t => [...t, [nx, ny]])
        if (Math.sqrt(dx*dx + dy*dy) < 0.01) {
          setAutoPlaying(false)
        }
        return { x: nx, y: ny }
      })
    }, 250)
    return () => clearInterval(timer)
  }, [autoPlaying, learningRate])

  const stepDown = () => {
    const [dx, dy] = gradient(player.x, player.y)
    const nx = player.x - learningRate * dx
    const ny = player.y - learningRate * dy
    setTrajectory(t => [...t, [nx, ny]])
    setPlayer({ x: nx, y: ny })
  }

  const reset = () => {
    setPlayer({ x: -3, y: 4 })
    setTrajectory([[-3, 4]])
    setAutoPlaying(false)
    setStep(1)
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.valley = { completed: true, score: trajectory.length }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  const move = (dx: number, dy: number) => {
    const nx = Math.max(-6, Math.min(6, player.x + dx))
    const ny = Math.max(-5, Math.min(5, player.y + dy))
    setTrajectory(t => [...t, [nx, ny]])
    setPlayer({ x: nx, y: ny })
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4">
        <div className="container-width max-w-4xl">
          <Link to="/games" className="text-sm text-dark-500 hover:text-dark-400 flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> {isZh ? '返回游戏大厅' : 'Back to Games'}
          </Link>

          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-6xl mb-4">🏔️</div>
                <h1 className="font-heading text-3xl font-bold mb-2">{isZh ? '山谷探险' : 'Valley Adventure'}</h1>
                <p className="text-dark-400">
                  {isZh ? '你是一个' : "You're a "}<span className="text-orange-400 font-medium">{isZh ? '爬山者' : 'hiker'}</span>,
                  {isZh ? '目标是走到' : ' your goal is to reach'} <span className="text-green-400 font-medium">{isZh ? '最低的山谷' : 'the lowest valley'}</span>.
                  {isZh ? '你只能看见' : ' You only see'} <strong>{isZh ? '你所在位置的坡度' : 'the slope at your position'}</strong>.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500 mb-2">{isZh ? '高度' : 'Height'} {currentHeight.toFixed(2)}</div>
                <div className="w-32 h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${Math.max(5, 100 - currentHeight / 200 * 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Step 0: 介绍 */}
            {step === 0 && (
              <div className="animate-fade-in">
                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold mb-3">📖 {isZh ? '规则' : 'Rules'}</h3>
                  <p className="text-dark-400 mb-4">{isZh ? '想象你被蒙住了眼睛，只能感觉到：' : "Imagine you're blindfolded and can only feel:"}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                      <div className="text-orange-400 font-medium mb-1">📐 {isZh ? '当前高度' : 'Current Height'}</div>
                      <div className="text-xs text-dark-500">{isZh ? '你站在哪里（高度）' : 'Where you stand (height)'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <div className="text-red-400 font-medium mb-1">↘️ {isZh ? '哪个方向下坡' : 'Which Way Down'}</div>
                      <div className="text-xs text-dark-500">{isZh ? '坡度告诉我们往哪儿走' : 'The slope tells us where to go'}</div>
                    </div>
                  </div>
                  <p className="text-dark-400 mt-4">
                    <strong className="text-primary">{isZh ? '这就是"梯度下降"！' : "This is 'Gradient Descent'!"}</strong>
                    {isZh ? '梯度告诉你每个"参数"应该调大调小——就像你这里的 x、y 坐标。' : "The gradient tells each 'parameter' to go up or down — just like your x, y coordinates here."}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始探险' : 'Start Adventure'} <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* 主游戏 */}
            {step >= 1 && (
              <div className="animate-fade-in">
              <ValleyMap player={player} trajectory={trajectory} showPath={trajectory.length > 1} isZh={isZh} />

              {/* 控制面板 */}
              <div className="mt-6 p-4 rounded-2xl bg-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-dark-500 mb-1">{isZh ? '你脚下的坡度（梯度）' : 'Slope Beneath You (Gradient)'}</div>
                    <div className="font-mono text-lg text-primary">
                      ∇ = ({gx.toFixed(2)}, {gy.toFixed(2)})
                    </div>
                    <div className="text-xs text-dark-500">{isZh ? '方向：↓ 往下走 = 向负梯度' : 'Direction: ↓ go down = toward negative gradient'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-dark-500 mb-1">{isZh ? '学习率（每步大小）' : 'Learning Rate (Step Size)'}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setLearningRate(Math.max(0.01, learningRate - 0.02))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20">-</button>
                      <span className="font-mono text-lg text-secondary">{learningRate.toFixed(2)}</span>
                      <button onClick={() => setLearningRate(Math.min(0.3, learningRate + 0.02))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20">+</button>
                    </div>
                  </div>
                </div>

                {/* 操作 */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <button
                    onClick={stepDown}
                    className="py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 col-span-1"
                  >
                    <ChevronDown className="w-5 h-5" />{isZh ? '走一步' : 'One Step'}
                  </button>
                  <button
                    onClick={() => {
                      for (let i = 0; i < 5; i++) {
                        setTimeout(() => stepDown(), i * 200)
                      }
                    }}
                    className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    ×5{isZh ? '步' : ' Steps'}
                  </button>
                  <button
                    onClick={() => setAutoPlaying(!autoPlaying)}
                    className="py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold hover:opacity-90 transition-all"
                  >
                      {autoPlaying ? (isZh ? "⏸ 暂停" : "⏸ Pause") : (isZh ? "▶ 自动走" : "▶ Auto")}
                  </button>
                </div>

                {/* 手动方向键 */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div></div>
                  <button onClick={() => move(0, 0.5)} className="py-2 rounded-lg bg-white/5 hover:bg-white/10">↑ {isZh ? '北' : 'N'}</button>
                  <div></div>
                  <button onClick={() => move(-0.5, 0)} className="py-2 rounded-lg bg-white/5 hover:bg-white/10">← {isZh ? '西' : 'W'}</button>
                  <button onClick={() => move(0, -0.5)} className="py-2 rounded-lg bg-white/5 hover:bg-white/10">↓ {isZh ? '南' : 'S'}</button>
                  <button onClick={() => move(0.5, 0)} className="py-2 rounded-lg bg-white/5 hover:bg-white/10">{isZh ? '东' : 'E'} →</button>
                </div>
              </div>

              {/* 走到山谷了吗？ */}
              {isNearMin && step < 2 && (
                <div className="mt-4 p-5 rounded-xl bg-green-500/10 border border-green-500/30 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-green-400">✓ {isZh ? '你走到山谷啦！' : 'You reached the valley!'}</h3>
                  </div>
                  <p className="text-sm text-dark-400">
                    {isZh ? '注意你走过的路径（黄色点点）。你走的每一步都是"沿着最陡的下坡"方向。' : 'Notice the path (yellow dots). Each step follows the steepest downhill direction.'}
                    {isZh ? '当你训练大模型时，模型的几百万个参数也是这样"一步步"在高维空间里走到一个"山谷"。' : " When training large models, millions of parameters take similar 'step by step' walks in high-dimensional space to reach a 'valley'."}
                  </p>
                  <button
                    onClick={() => { complete(); setStep(2) }}
                    className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90"
                  >
                    {isZh ? '继续' : 'Continue'} →
                  </button>
                </div>
              )}

              {/* 总结 */}
              {step >= 2 && (
                <div className="mt-4 p-5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold">{isZh ? '你刚刚做的，就是"梯度下降"！' : "What you just did is 'Gradient Descent'!"}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-dark-400">
                    <div><span className="text-primary font-mono">{isZh ? '参数 w' : 'Parameter w'}</span>
                      = {isZh ? '你站的位置（x, y）' : 'your position (x, y)'}
                    </div>
                    <div>
                      <span className="text-secondary font-mono">Loss</span>
                      = {isZh ? '山谷的高度（越低越好）' : "valley height (lower is better)"}
                    </div>
                    <div>
                      <span className="text-accent font-mono">{isZh ? '梯度 ∇L' : 'Gradient ∇L'}</span>
                      = {isZh ? '你脚底下的坡度（每一步告诉我们往哪走）' : 'the slope under your feet (tells direction)'}
                    </div>
                    <div>
                      <span className="text-orange-400 font-mono">{isZh ? '学习率 η' : 'Learning Rate η'}</span>
                      = {isZh ? '你每步迈多大（太大容易震荡，太小走太慢）' : 'how big each step is (too large causes oscillation, too small is too slow)'}
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/10">
                      <strong className="text-primary">{isZh ? '总结公式' : 'Update Rule'}</strong>
                      <code className="text-primary font-mono block mt-1">
                        w ← w - η × ∇L(w)
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all">
                      {isZh ? '再玩一次' : 'Play Again'}
                    </button>
                    <Link to="/games" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center hover:opacity-90 transition-all">
                      {isZh ? '返回游戏大厅' : 'Back to Games'}
                    </Link>
                  </div>
                </div>
              )}

              {/* 步数 */}
              <div className="mt-4 flex items-center justify-between text-sm text-dark-500">
                <span>🚶 {isZh ? '走了' : 'Walked'} <span className="text-dark-400 font-bold">{trajectory.length - 1}</span> {isZh ? '步' : 'steps'}</span>
                {gradMagnitude < 0.01 ? (
                  <span className="text-green-400">🎯 {isZh ? '到达局部最小值' : 'Reached local minimum'}</span>
                ) : (
                  <span>🎯 {isZh ? '目标：到达绿点附近' : 'Goal: reach near the green dot'}</span>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
