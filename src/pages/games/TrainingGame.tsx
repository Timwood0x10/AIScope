import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Sparkles, Lightbulb, RotateCcw, Trophy, ChevronRight, CheckCircle, BookOpen, Zap, Users, ThumbsUp, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 训练阶段定义
const stages = [
  {
    id: 'pretrain',
    title: '预训练',
    titleEn: 'Pre-training',
    emoji: '📚',
    gradient: 'from-blue-500 to-cyan-500',
    description: '海量文本自学',
    descriptionEn: 'Learn from massive text',
    details: '模型在互联网规模的数据上学习预测下一个词。通过无监督学习，模型学会语法、常识、甚至一些推理能力。',
    detailsEn: 'The model learns to predict next tokens on internet-scale data. Through unsupervised learning, it acquires grammar, common sense, and even some reasoning abilities.',
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'sft',
    title: 'SFT 微调',
    titleEn: 'SFT Fine-tuning',
    emoji: '🎯',
    gradient: 'from-purple-500 to-pink-500',
    description: '模仿人类回答',
    descriptionEn: 'Learn from human answers',
    details: '用高质量的"问答对"微调模型。人类标注者写出理想的回答，模型学习模仿这些回答的风格和质量。',
    detailsEn: 'Fine-tune with high-quality Q&A pairs. Human labelers write ideal responses, and the model learns to mimic the style and quality of these responses.',
    icon: Target,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    id: 'reward',
    title: '奖励模型',
    titleEn: 'Reward Model',
    emoji: '⭐',
    gradient: 'from-amber-500 to-yellow-500',
    description: '学习什么是好回答',
    descriptionEn: 'Learn what makes a good answer',
    details: '训练一个"奖励模型"来评价回答质量。用多个回答让人类打分，奖励模型学会预测人类的偏好。',
    detailsEn: 'Train a "reward model" to evaluate response quality. Use multiple responses for humans to score, and the reward model learns to predict human preferences.',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'rlhf',
    title: 'RLHF 强化学习',
    titleEn: 'RLHF',
    emoji: '🧠',
    gradient: 'from-emerald-500 to-teal-500',
    description: '用奖励信号优化',
    descriptionEn: 'Optimize with reward signal',
    details: '用奖励模型的反馈来优化策略（PPO算法）。模型生成回答，奖励模型打分，策略梯度上升。反复迭代，模型越来越会讨人喜欢。',
    detailsEn: 'Use reward model feedback to optimize strategy (PPO algorithm). Generate responses, get scores from reward model, gradient ascent on policy. Iterate to make model more pleasing.',
    icon: Users,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'dpo',
    title: 'DPO 直接偏好优化',
    titleEn: 'DPO',
    emoji: '✨',
    gradient: 'from-rose-500 to-red-500',
    description: '更简单更稳定',
    descriptionEn: 'Simpler and more stable',
    details: '绕过奖励模型，直接用偏好数据优化。不需要复杂的强化学习，直接用"这个回答比那个好"的数据对训练。',
    detailsEn: 'Bypass reward model, directly optimize with preference data. No complex RL needed, just train with "this response is better than that" data pairs.',
    icon: ThumbsUp,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30',
  },
]

// 模拟 loss 曲线
function generateLossCurve(stage: string, quality: 'low' | 'mid' | 'high'): number[] {
  const points = 20
  const losses: number[] = []
  let base = stage === 'pretrain' ? 3.5 : stage === 'sft' ? 2.0 : stage === 'rlhf' ? 1.5 : 1.2

  if (quality === 'low') base += 0.5
  if (quality === 'high') base -= 0.3

  for (let i = 0; i < points; i++) {
    const progress = i / points
    const decay = Math.exp(-3 * progress)
    const noise = (Math.random() - 0.5) * 0.1 * (1 - progress)
    losses.push(Math.max(0.3, base * decay + noise + 0.3))
  }
  return losses
}

export default function TrainingGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [gamePhase, setGamePhase] = useState<'intro' | 'stages' | 'visualize' | 'complete'>('intro')
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [currentLossCurve, setCurrentLossCurve] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [dataQuality, setDataQuality] = useState<'low' | 'mid' | 'high'>('mid')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 绘制 loss 曲线
  useEffect(() => {
    if (currentLossCurve.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    // 背景网格
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * (height - padding * 2)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // 绘制曲线
    ctx.beginPath()
    ctx.strokeStyle = selectedStage && stages.find(s => s.id === selectedStage)?.gradient.includes('rose')
      ? '#f43f5e'
      : '#8b5cf6'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const minLoss = Math.min(...currentLossCurve)
    const maxLoss = Math.max(...currentLossCurve)
    const range = maxLoss - minLoss || 1

    currentLossCurve.forEach((loss, i) => {
      const x = padding + (i / (currentLossCurve.length - 1)) * (width - padding * 2)
      const y = padding + ((maxLoss - loss) / range) * (height - padding * 2)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // 渐变填充
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

    ctx.lineTo(padding + (width - padding * 2), height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Y轴标签
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(maxLoss.toFixed(1), padding - 10, padding + 5)
    ctx.fillText(minLoss.toFixed(1), padding - 10, height - padding + 5)
    ctx.fillText(isZh ? 'Loss' : 'Loss', padding - 10, height / 2)

    // X轴标签
    ctx.textAlign = 'center'
    ctx.fillText(isZh ? '训练步数' : 'Training Steps', width / 2, height - 10)
  }, [currentLossCurve, selectedStage, isZh])

  const selectStage = (stageId: string) => {
    setSelectedStage(stageId)
    const curve = generateLossCurve(stageId, dataQuality)
    setCurrentLossCurve(curve)
    setGamePhase('visualize')
  }

  const completeStage = () => {
    if (selectedStage) {
      setCompleted(prev => new Set([...prev, selectedStage]))
      setScore(s => s + 20)
      setSelectedStage(null)
      setCurrentLossCurve([])
      setGamePhase('stages')
    }
  }

  const reset = () => {
    setGamePhase('intro')
    setSelectedStage(null)
    setCurrentLossCurve([])
    setScore(0)
    setCompleted(new Set())
  }

  const stageInfo = stages.find(s => s.id === selectedStage)

  const completeAll = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.trainingGame = { completed: true, score }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4">
        <div className="container-width max-w-4xl">
          <Link to="/games" className="text-sm text-dark-500 hover:text-dark-400 flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> {isZh ? '返回游戏大厅' : 'Back to Games'}
          </Link>

          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-5xl mb-3">🏋️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">
                  {isZh ? '大模型训练之旅' : 'LLM Training Journey'}
                </h1>
                <p className="text-dark-400 text-sm">
                  {isZh ? '了解 LLM 是如何从随机变得聪明的' : 'See how LLMs go from random to smart'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">
                  {isZh ? '已探索' : 'Explored'}: {completed.size}/5
                </div>
                <div className="text-lg font-bold text-primary">{score} 分</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-heading text-lg font-semibold text-yellow-400">
                      {isZh ? '你知道吗？' : 'Did you know?'}
                    </h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh
                      ? 'ChatGPT 不是一夜之间变聪明的！它经历了 5 个关键训练阶段，每个阶段都有不同的目标和方法。'
                      : 'ChatGPT didn\'t become smart overnight! It went through 5 key training stages, each with different goals and methods.'}
                  </p>

                  <div className="space-y-3 text-sm text-dark-400">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-2xl">1️⃣</span>
                      <div>
                        <strong className="text-white">{isZh ? '预训练' : 'Pre-training'}</strong>
                        <p className="mt-1">{isZh ? '学习语言的基本规律，从海量文本中' : 'Learn language basics from massive text'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-2xl">2️⃣</span>
                      <div>
                        <strong className="text-white">{isZh ? 'SFT 微调' : 'SFT Fine-tuning'}</strong>
                        <p className="mt-1">{isZh ? '模仿人类标注的优质回答' : 'Learn from human-labeled good answers'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-2xl">3️⃣</span>
                      <div>
                        <strong className="text-white">{isZh ? 'RLHF / DPO' : 'RLHF / DPO'}</strong>
                        <p className="mt-1">{isZh ? '根据人类偏好优化，让回答更有帮助、更无害' : 'Optimize based on human preferences'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setGamePhase('stages')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {isZh ? '开始探索训练阶段 →' : 'Start Exploring →'}
                </button>
              </div>
            )}

            {/* 阶段选择 */}
            {gamePhase === 'stages' && (
              <div className="animate-fade-in">
                <h3 className="font-heading text-xl font-semibold mb-4">
                  {isZh ? '选择想了解的训练阶段' : 'Choose a training stage to learn about'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {stages.map((stage) => {
                    const Icon = stage.icon
                    const isCompleted = completed.has(stage.id)
                    return (
                      <button
                        key={stage.id}
                        onClick={() => selectStage(stage.id)}
                        className={`p-5 rounded-xl border-2 text-left transition-all ${
                          isCompleted
                            ? `${stage.borderColor} ${stage.bgColor} opacity-70`
                            : 'border-transparent bg-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`text-3xl ${isCompleted ? '' : ''}`}>
                            {isCompleted ? '✅' : stage.emoji}
                          </div>
                          {isCompleted && (
                            <CheckCircle className={`w-5 h-5 ${stage.color}`} />
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">
                          {isZh ? stage.title : stage.titleEn}
                        </h4>
                        <p className="text-sm text-dark-400">
                          {isZh ? stage.description : stage.descriptionEn}
                        </p>
                      </button>
                    )
                  })}
                </div>

                {completed.size === stages.length && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-heading text-xl font-bold text-green-400 mb-2">
                      {isZh ? '全部探索完成！' : 'All stages explored!'}
                    </h3>
                    <p className="text-dark-400 mb-4">
                      {isZh
                        ? '你已经了解了大模型训练的完整流程！现在可以回到游戏大厅，或者重新开始探索。'
                        : 'You now understand the complete LLM training process! Go back to games or restart.'}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> {isZh ? '重新开始' : 'Restart'}
                      </button>
                      <Link to="/games" onClick={completeAll} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center hover:opacity-90 transition-all">
                        {isZh ? '返回游戏大厅' : 'Back to Games'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 可视化 */}
            {gamePhase === 'visualize' && stageInfo && (
              <div className="animate-fade-in">
                <button
                  onClick={() => {
                    setSelectedStage(null)
                    setCurrentLossCurve([])
                    setGamePhase('stages')
                  }}
                  className="flex items-center gap-2 text-dark-400 hover:text-white mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {isZh ? '返回选择' : 'Back to selection'}
                </button>

                {/* 阶段信息卡片 */}
                <div className={`p-6 rounded-2xl ${stageInfo.bgColor} border ${stageInfo.borderColor} mb-6`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{stageInfo.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl font-bold mb-2">
                        {isZh ? stageInfo.title : stageInfo.titleEn}
                      </h3>
                      <p className="text-dark-300">
                        {isZh ? stageInfo.details : stageInfo.detailsEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loss 曲线 */}
                <div className="p-6 rounded-2xl bg-white/5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">
                      {isZh ? '训练 Loss 曲线' : 'Training Loss Curve'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-dark-400">{isZh ? '数据质量' : 'Data Quality'}:</span>
                      {(['low', 'mid', 'high'] as const).map(q => (
                        <button
                          key={q}
                          onClick={() => {
                            setDataQuality(q)
                            if (selectedStage) {
                              setCurrentLossCurve(generateLossCurve(selectedStage, q))
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs transition-all ${
                            dataQuality === q
                              ? 'bg-primary text-white'
                              : 'bg-white/10 text-dark-400 hover:bg-white/20'
                          }`}
                        >
                          {isZh
                            ? (q === 'low' ? '低质量' : q === 'mid' ? '中等' : '高质量')
                            : (q === 'low' ? 'Low' : q === 'mid' ? 'Mid' : 'High')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="w-full rounded-lg"
                  />
                  <p className="text-sm text-dark-400 mt-3">
                    {isZh
                      ? '💡 Loss 越低越好！好的训练数据和算法能让 loss 下降更快、更稳定。'
                      : '💡 Lower loss is better! Good data and algorithms make loss drop faster and more stable.'}
                  </p>
                </div>

                {/* 完成按钮 */}
                <button
                  onClick={completeStage}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isZh ? '我学会了，继续探索' : 'Got it, continue exploring'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
