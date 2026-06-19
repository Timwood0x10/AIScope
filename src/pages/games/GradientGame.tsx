import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, RotateCcw, Trophy, Gauge, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 定义山坡形状
function hill(x: number): number {
  // 一个带两个小坑的山坡
  const base = 0.02 * (x - 30) ** 2
  const bump1 = -8 * Math.exp(-((x - 15) ** 2) / 5)
  const bump2 = -5 * Math.exp(-((x - 45) ** 2) / 10)
  const valley = -15 * Math.exp(-((x - 50) ** 2) / 3)
  return base + bump1 + bump2 + valley + 20
}

// 梯度（导数）
function gradient(x: number): number {
  const eps = 0.1
  return (hill(x + eps) - hill(x - eps)) / (2 * eps)
}

export default function GradientRacingGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'win' | 'lose'>('intro')
  const [position, setPosition] = useState(8) // 小球位置
  const [velocity, setVelocity] = useState(0) // 速度
  const [learningRate, setLearningRate] = useState(0.5) // 学习率/步长
  const [trackHistory, setTrackHistory] = useState<number[]>([8])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const levels = [
    { lrMin: 0.3, lrMax: 0.8, targetX: 50, tolerance: 3 },
    { lrMin: 0.2, lrMax: 0.6, targetX: 50, tolerance: 2 },
    { lrMin: 0.15, lrMax: 0.5, targetX: 50, tolerance: 1.5 },
  ]

  const currentLevel = levels[level - 1]

  const isAtTarget = Math.abs(position - currentLevel.targetX) < currentLevel.tolerance
  const isOutOfBounds = position < 0 || position > 60

  // 游戏循环
  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setPosition(prevPos => {
        const grad = gradient(prevPos)
        const newPos = prevPos - learningRate * grad
        
        setTrackHistory(h => [...h.slice(-20), newPos])
        setMoves(m => m + 1)
        
        return newPos
      })
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, learningRate])

  // 检查胜负
  useEffect(() => {
    if (!isPlaying) return

    if (isAtTarget) {
      setIsPlaying(false)
      setGamePhase('win')
      const levelScore = Math.max(0, 100 - moves * 2)
      setScore(s => s + levelScore)
    } else if (isOutOfBounds) {
      setIsPlaying(false)
      setGamePhase('lose')
    }
  }, [position, isPlaying, moves, level])

  const startGame = () => {
    setPosition(8)
    setVelocity(0)
    setTrackHistory([8])
    setMoves(0)
    setIsPlaying(true)
    setGamePhase('playing')
  }

  const reset = () => {
    setLevel(1)
    setScore(0)
    setPosition(8)
    setTrackHistory([8])
    setMoves(0)
    setLearningRate(0.5)
    setIsPlaying(false)
    setGamePhase('intro')
  }

  const nextLevel = () => {
    if (level < levels.length) {
      setLevel(l => l + 1)
      setPosition(8)
      setTrackHistory([8])
      setMoves(0)
      setLearningRate((levels[level].lrMin + levels[level].lrMax) / 2)
      setIsPlaying(true)
      setGamePhase('playing')
    } else {
      reset()
    }
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.gradientGame = { completed: true, score }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4">
        <div className="container-width max-w-3xl">
          <Link to="/games" className="text-sm text-dark-500 hover:text-dark-400 flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> {isZh ? '返回游戏大厅' : 'Back to Games'}
          </Link>

          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-5xl mb-3">🏎️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? '梯度赛车' : 'Gradient Racing'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '调整"学习率"，让小球滚到山谷' : 'Adjust "learning rate" to roll the ball to the valley'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? '关卡' : 'Level'} {level}/{levels.length}</div>
                <div className="text-lg font-bold text-primary">{score} {isZh ? '分' : 'pts'}</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Gauge className="w-5 h-5 text-orange-400" />
                    <h3 className="font-heading text-lg font-semibold text-orange-400">{isZh ? '游戏规则' : 'Game Rules'}</h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh ? '你控制一个小球从山上滚下来。调整"学习率"（步长）让它平稳到达山谷：' : 'You control a ball rolling down a hill. Adjust the "learning rate" (step size) to roll it smoothly to the valley:'}
                  </p>
                  <div className="space-y-2 text-sm text-dark-400">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">🔍</span>
                      <span><strong>{isZh ? '学习率太大' : 'Learning rate too big'}</strong>：{isZh ? '小球冲过山谷，来回震荡' : 'ball overshoots, oscillates back and forth'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">🐌</span>
                      <span><strong>{isZh ? '学习率太小' : 'Learning rate too small'}</strong>：{isZh ? '小球走得太慢，步数不够' : 'ball too slow, not enough steps'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">✅</span>
                      <span><strong>{isZh ? '学习率适中' : 'Good learning rate'}</strong>：{isZh ? '小球平稳滚到山谷' : 'ball rolls smoothly to the valley'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始游戏 🚀' : 'Start Game 🚀'}
                </button>
              </div>
            )}

            {/* 游戏主体 */}
            {(gamePhase === 'playing') && (
              <div className="animate-fade-in">
                {/* 山坡可视化 */}
                <div className="relative h-64 bg-gradient-to-b from-dark-800/50 to-dark-900/50 rounded-2xl overflow-hidden mb-6">
                  {/* 山坡背景 */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 25" preserveAspectRatio="none">
                    <path
                      d={`M0 ${25 - hill(0)} ${Array.from({ length: 60 }, (_, i) => `L${i} ${25 - hill(i)}`).join(' ')} L60 25 L0 25 Z`}
                      fill="url(#hillGradient)"
                    />
                    <defs>
                      <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1a1a2e" />
                        <stop offset="50%" stopColor="#16213e" />
                        <stop offset="100%" stopColor="#0f3460" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* 山坡轮廓线 */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 25" preserveAspectRatio="none">
                    <path
                      d={`M0 ${25 - hill(0)} ${Array.from({ length: 60 }, (_, i) => `L${i} ${25 - hill(i)}`).join(' ')}`}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="0.2"
                    />
                  </svg>

                  {/* 目标标记 */}
                  <div
                    className="absolute bottom-0 w-0.5 h-full bg-green-400/30"
                    style={{ left: `${(currentLevel.targetX / 60) * 100}%` }}
                  />
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap"
                    style={{ left: `${(currentLevel.targetX / 60) * 100}%` }}
                  >
                    🎯 {isZh ? '目标' : 'Target'}
                  </div>

                  {/* 小球轨迹 */}
                  {trackHistory.map((pos, idx) => (
                    <div
                      key={idx}
                      className="absolute w-2 h-2 rounded-full bg-yellow-400/40 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${(pos / 60) * 100}%`,
                        top: `${((25 - hill(pos)) / 25) * 100}%`,
                        opacity: 0.2 + (idx / trackHistory.length) * 0.8
                      }}
                    />
                  ))}

                  {/* 小球 */}
                  <div
                    className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-lg shadow-orange-500/50 -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                    style={{
                      left: `${(position / 60) * 100}%`,
                      top: `${((25 - hill(position)) / 25) * 100}%`
                    }}
                  >
                    <div className="absolute inset-1 rounded-full bg-white/30" />
                  </div>

                  {/* 当前高度指示 */}
                  <div className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-white/10 text-sm font-mono">
                    {isZh ? '高度:' : 'Height:'} {hill(position).toFixed(1)}
                  </div>
                </div>

                {/* 控制区域 */}
                <div className="p-5 rounded-xl bg-white/5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <span className="font-medium">{isZh ? '学习率（步长）' : 'Learning Rate (Step Size)'}</span>
                    </div>
                    <span className="text-xl font-bold text-orange-400 font-mono">{learningRate.toFixed(2)}</span>
                  </div>

                  {/* 学习率滑块 */}
                  <input
                    type="range"
                    min={currentLevel.lrMin}
                    max={currentLevel.lrMax}
                    step={0.01}
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="w-full h-3 bg-dark-100 rounded-full appearance-none cursor-pointer accent-orange-500"
                  />

                  <div className="flex justify-between text-xs text-dark-500 mt-2">
                    <span>🐌 {isZh ? '慢' : 'Slow'}</span>
                    <span>{isZh ? '适中' : 'Good'}</span>
                    <span>🔍 {isZh ? '快' : 'Fast'}</span>
                  </div>

                  {/* 状态 */}
                  <div className="flex justify-between mt-4 text-sm">
                    <span className="text-dark-400">{isZh ? '步数:' : 'Steps:'} <span className="font-bold">{moves}</span></span>
                    <span className="text-dark-400">{isZh ? '位置:' : 'Pos:'} <span className="font-bold">{position.toFixed(1)}</span></span>
                  </div>
                </div>

                {/* 提示 */}
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-dark-400">
                  💡 {isZh ? '提示：当前位置的坡度是' : 'Hint: slope at current position is'} <span className="font-mono text-orange-400">{gradient(position).toFixed(2)}</span>。
                  {gradient(position) > 0 ? (isZh ? '右边更低，会向右滚' : 'right is lower, will roll right') : (isZh ? '左边更低，会向左滚' : 'left is lower, will roll left')}。
                </div>
              </div>
            )}

            {/* 胜利 */}
            {gamePhase === 'win' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">{isZh ? `第 ${level} 关通过！` : `Level ${level} Complete!`}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-xl font-bold">{100 - moves * 2} {isZh ? '分' : 'pts'}</span>
                  </div>
                  <p className="text-dark-400 mb-6">
                    {isZh ? `你用` : 'You used '}<strong className="text-green-400">{moves}</strong> {isZh ? '步让小球滚到了山谷！' : 'steps to roll the ball to the valley!'}
                  </p>

                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold">{isZh ? '🧠 这就是梯度下降！' : '🧠 This is Gradient Descent!'}</h4>
                    </div>
                    <div className="space-y-2 text-sm text-dark-400">
                      <div><span className="text-orange-400 font-mono">{isZh ? '学习率 η' : 'Learning Rate η'}</span>：{isZh ? '你刚才调整的滑块——决定每步迈多大' : 'the slider you just adjusted — determines step size'}</div>
                      <div><span className="text-blue-400 font-mono">{isZh ? '梯度 ∇L' : 'Gradient ∇L'}</span>：{isZh ? '山坡的坡度——决定往哪个方向走' : 'hill slope — determines direction'}</div>
                      <div><span className="text-green-400 font-mono">{isZh ? '更新规则' : 'Update Rule'}</span>：w ← w - η × ∇L ({isZh ? '朝下坡走' : 'move downhill'})</div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" /> {isZh ? '重新开始' : 'Restart'}
                    </button>
                    <button
                      onClick={nextLevel}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all"
                    >
                      {level < levels.length ? (isZh ? '下一关 →' : 'Next →') : (isZh ? '通关！返回' : 'All Done! Return')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 失败 */}
            {gamePhase === 'lose' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-900/30 border border-red-500/30 text-center">
                  <div className="text-5xl mb-3">💥</div>
                  <h3 className="font-heading text-2xl font-bold text-red-400 mb-2">{isZh ? '小球滚出边界了！' : 'Ball fell off the track!'}</h3>
                  <p className="text-dark-400 mb-6">
                    {isZh ? '学习率太' : 'Learning rate too'}<strong className="text-red-400">{isZh ? '大' : 'big'}</strong>{isZh ? '或太' : ' or too'}<strong className="text-red-400">{isZh ? '小' : 'small'}</strong>{isZh ? '，导致小球没能到达山谷。' : ', ball did not reach the valley.'}
                  </p>

                  <button
                    onClick={startGame}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90 transition-all"
                  >
                    {isZh ? '再试一次 🚀' : 'Try Again 🚀'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
