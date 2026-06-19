import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, TrendingDown, Zap, Trophy, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 一个简化的"模型" —— 实际上在调整 softmax 的 logit
class TinyModel {
  logits: number[]

  constructor(vocabSize: number) {
    this.logits = Array(vocabSize).fill(0).map(() => Math.random() * 2 - 1)
  }

  forward(): number[] {
    const max = Math.max(...this.logits)
    const exps = this.logits.map(l => Math.exp(l - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map(e => e / sum)
  }

  train(targetIdx: number, lr = 0.3): number {
    const probs = this.forward()
    const loss = -Math.log(Math.max(probs[targetIdx], 1e-8))
    // 简化梯度：增加正确词对应的 logit
    this.logits[targetIdx] += lr * (1 - probs[targetIdx])
    // 稍微减少其他的 logit
    for (let i = 0; i < this.logits.length; i++) {
      if (i !== targetIdx) {
        this.logits[i] -= lr * 0.02 * probs[i]
      }
    }
    return loss
  }

  predict(): number {
    const probs = this.forward()
    return probs.indexOf(Math.max(...probs))
  }
}

const sentences = [
  {
    id: 1,
    prefix: '小明今天特别开心，因为他终于',
    options: ['考试', '吃饭', '睡觉', '跑步', '游泳', '跳舞'],
    answer: 0,
    meaning: '考试取得好成绩当然开心！'
  },
  {
    id: 2,
    prefix: '太阳落山了，天空变成了',
    options: ['早餐', '红色', '电脑', '书本', '音乐', '红色'],
    answer: 1,
    meaning: '夕阳西下，天空通常变红'
  },
  {
    id: 3,
    prefix: '小狗狗伸出舌头，因为它',
    options: ['唱歌', '生病', '散热', '喝水', '玩耍', '睡觉'],
    answer: 2,
    meaning: '狗狗通过舌头散热，就像我们出汗一样'
  }
]

export default function GuessGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [gamePhase, setGamePhase] = useState<'intro' | 'pretrain' | 'training' | 'posttrain' | 'complete'>('intro')
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [round, setRound] = useState(0)
  const [lossHistory, setLossHistory] = useState<number[]>([])
  const [model, setModel] = useState<TinyModel | null>(null)
  const [animating, setAnimating] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [completedGames, setCompletedGames] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sentence = sentences[sentenceIdx]
  const vocabSize = sentence.options.length

  // 初始化模型
  const initModel = useCallback(() => {
    return new TinyModel(vocabSize)
  }, [vocabSize])

  // 训练一轮
  const trainOne = useCallback(() => {
    if (!model) return
    const loss = model.train(sentence.answer, 0.4)
    const probs = model.forward()
    setLossHistory(h => [...h, loss])
    setRound(r => r + 1)
    return { loss, probs }
  }, [model, sentence.answer])

  // 重置
  const reset = () => {
    setRound(0)
    setLossHistory([])
    setModel(initModel())
    setGamePhase('pretrain')
  }

  // 开始训练动画
  const startTraining = () => {
    setGamePhase('training')
    setAnimating(true)
    intervalRef.current = setInterval(() => {
      const result = trainOne()
      if (!result) return
      // 当 loss 足够低时停止
      if (result.loss < 0.1 || round >= 30) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setAnimating(false)
        setGamePhase('posttrain')
        // 计算最终正确率
        if (model) {
          const probs = model.forward()
          const correctProb = probs[sentence.answer]
          setFinalScore(Math.round(correctProb * 100))
        }
      }
    }, 150)
  }

  // 预训练预测
  const pretrainPrediction = useMemo(() => {
    if (!model) return null
    return model.forward()
  }, [model, round])

  // 后训练预测
  const posttrainPrediction = useMemo(() => {
    if (gamePhase !== 'posttrain' || !model) return null
    return model.forward()
  }, [gamePhase, model])

  // 进入下一个句子
  const nextSentence = () => {
    if (sentenceIdx < sentences.length - 1) {
      setSentenceIdx(i => i + 1)
      setCompletedGames(g => g + 1)
      setTimeout(() => reset(), 100)
    } else {
      setCompletedGames(g => g + 1)
      setGamePhase('complete')
    }
  }

  // 完成
  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.guess = { completed: true, score: Math.round(finalScore) }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  // 初始化
  useEffect(() => {
    setModel(initModel())
  }, [initModel])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const topProb = pretrainPrediction ? Math.max(...pretrainPrediction) : 0
  const topPostProb = posttrainPrediction ? Math.max(...posttrainPrediction) : 0

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
                <div className="text-5xl mb-3">🤖</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? '猜字大师' : 'Guess Master'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '训练一个迷你模型学会预测下一个字' : 'Train a mini model to predict next words'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? `第 ${sentenceIdx + 1}/3 题` : `Q${sentenceIdx + 1}/3`}</div>
                <div className="w-32 h-2 bg-dark-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${((sentenceIdx + 1) / 3) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* 句子展示 */}
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 text-center">
              <div className="text-sm text-dark-500 mb-2">{isZh ? '给模型看这句话，让它猜下一个词' : 'Show this sentence to the model, let it guess the next word'}</div>
              <div className="text-xl md:text-2xl font-heading leading-relaxed">
                <span className="text-dark-300">"{sentence.prefix}</span>
                <span className="text-cyan-400 border-b-4 border-cyan-400 px-1 mx-0.5">?</span>
                <span className="text-dark-300">"</span>
              </div>
              <div className="text-sm text-green-400/70 mt-2">{isZh ? '✓ 正确答案在下方选项里' : '✓ Correct answer is in options below'}</div>
            </div>

            {/* 选项 */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {sentence.options.map((opt, idx) => {
                const preProb = pretrainPrediction ? pretrainPrediction[idx] : 0
                const postProb = posttrainPrediction ? posttrainPrediction[idx] : 0
                const isAnswer = idx === sentence.answer
                const currentProb = gamePhase === 'posttrain' ? postProb : preProb
                const prevProb = gamePhase === 'posttrain' ? preProb : null

                return (
                  <div key={idx} className="relative">
                    <div className={`p-4 rounded-xl border-2 transition-all text-center ${
                      isAnswer && (gamePhase === 'posttrain' || gamePhase === 'complete')
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-transparent bg-white/5'
                    }`}>
                      <div className="text-lg font-bold mb-2">{opt}</div>

                      {/* 概率条 */}
                      {currentProb > 0 && (
                        <div className="relative h-6 bg-dark-100 rounded-lg overflow-hidden">
                          {/* 训练前概率（灰色） */}
                          {prevProb !== null && (
                            <div
                              className="absolute h-full bg-dark-300/50 transition-all duration-500"
                              style={{ width: `${prevProb * 100}%` }}
                            />
                          )}
                          {/* 当前概率 */}
                          <div
                            className={`absolute h-full transition-all duration-500 ${
                              isAnswer ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500/60 to-cyan-500/60'
                            }`}
                            style={{ width: `${currentProb * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold">
                            {(currentProb * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}

                      {isAnswer && (gamePhase === 'posttrain' || gamePhase === 'complete') && (
                        <div className="mt-2 text-xs text-green-400 flex items-center justify-center gap-1">
                          <Trophy className="w-3 h-3" /> {isZh ? '正确答案' : 'Correct Answer'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Loss 曲线 */}
            {lossHistory.length > 1 && (
              <div className="mb-6 p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">{isZh ? 'Loss 曲线' : 'Loss Curve'}</span>
                    </div>
                    <span className="text-xs font-mono text-dark-500">
                      {lossHistory.length > 0 ? `${isZh ? '当前' : 'Current'}: ${lossHistory[lossHistory.length - 1].toFixed(3)}` : ''}
                    </span>
                  </div>
                <div className="h-16 flex items-end gap-px">
                  {lossHistory.map((l, i) => {
                    const maxL = Math.max(...lossHistory)
                    const minL = Math.min(...lossHistory)
                    const range = maxL - minL || 1
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-red-400 to-green-400 rounded-t transition-all"
                        style={{
                          height: `${((l - minL) / range) * 100}%`,
                          minHeight: '2px',
                          opacity: 0.3 + (i / lossHistory.length) * 0.7
                        }}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                  <span>{isZh ? '开始' : 'Start'}</span>
                  <span>{isZh ? `训练 ${lossHistory.length} 次` : `${lossHistory.length} training steps`}</span>
                  <span>{isZh ? '现在' : 'Now'}</span>
                </div>
              </div>
            )}

            {/* 阶段控制 */}
            <div className="space-y-4">
              {gamePhase === 'intro' && (
                <button
                  onClick={reset}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始训练 🤖' : 'Start Training 🤖'}
                </button>
              )}

              {gamePhase === 'pretrain' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-yellow-400">{isZh ? '训练前的模型' : 'Before Training'}</span>
                    </div>
                    <p className="text-sm text-dark-400">
                      {isZh ? '模型还没学习过，现在它的预测是' : 'The model has not learned yet — its current predictions are'} <strong>{isZh ? '随机' : 'random'}</strong> {isZh ? '的。' : '.'}
                      {isZh ? '模型对正确答案的概率只有约' : 'Model only assigns ~'} <strong>{topProb > 0 ? (topProb * 100).toFixed(0) : '?'}%</strong>{isZh ? '。' : ' probability to the correct answer.'}
                    </p>
                  </div>
                  <button
                    onClick={startTraining}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> {isZh ? '开始训练 20 次' : 'Train 20 times'}
                  </button>
                </div>
              )}

              {gamePhase === 'training' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-blue-400 font-medium">{isZh ? '训练中...' : 'Training...'}</span>
                    </div>
                    <span className="font-mono text-blue-400">{round} {isZh ? '次' : 'times'}</span>
                  </div>
                  <div className="text-sm text-dark-500 text-center">
                    {isZh ? '每次训练，模型会调整参数，让正确答案的概率变大 📈' : 'Each training step adjusts parameters to increase probability of the correct answer 📈'}
                  </div>
                </div>
              )}

              {gamePhase === 'posttrain' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-400">{isZh ? '训练完成！' : 'Training Complete!'}</span>
                    </div>
                    <p className="text-dark-400 text-sm">
                      {isZh ? '模型对正确答案的概率从' : 'Model probability for correct answer went from'} <span className="text-yellow-400">{(topProb * 100).toFixed(0)}%</span> {isZh ? '提升到了' : ' to '}
                      <span className="text-green-400 font-bold">{(topPostProb * 100).toFixed(0)}%</span>{isZh ? '！' : '!'}
                    </p>
                    <p className="text-dark-500 text-xs mt-2">
                      💡 {sentence.meaning}
                    </p>
                  </div>
                  <button
                    onClick={nextSentence}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> {sentenceIdx < sentences.length - 1 ? (isZh ? '下一题 →' : 'Next →') : (isZh ? '完成！🎉' : 'Done! 🎉')}
                  </button>
                </div>
              )}

              {gamePhase === 'complete' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">{isZh ? '全部通关！' : 'All Complete!'}</h3>
                    <p className="text-dark-400 mb-4">
                      {isZh ? '你成功训练了一个迷你模型！它现在能比较准确地预测下一个词了。' : 'You successfully trained a mini model! It can now predict the next word quite accurately.'}
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-bold">{isZh ? `完成 ${completedGames} 题` : `${completedGames} completed`}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold">{isZh ? '模型是怎么"学会"的？' : 'How does the model "learn"?'}</h4>
                    </div>
                    <div className="space-y-2 text-sm text-dark-400">
                      <div><span className="text-blue-400 font-mono">1. {isZh ? '前向传播' : 'Forward Pass'}</span>：{isZh ? '输入句子 → 模型输出每个词的概率' : 'input sentence → model outputs probability for each word'}</div>
                      <div><span className="text-purple-400 font-mono">2. {isZh ? '算 Loss' : 'Compute Loss'}</span>：-log(P({isZh ? '正确答案' : 'correct answer'}))，{isZh ? '衡量"错了多少"' : 'measures how wrong'}</div>
                      <div><span className="text-orange-400 font-mono">3. {isZh ? '反向传播 + 梯度下降' : 'Backprop + Gradient Descent'}</span>：{isZh ? '调整参数，让正确答案的概率变大' : 'adjust parameters to increase probability of correct answer'}</div>
                      <div className="pt-2 border-t border-white/10 mt-2">
                        <strong>{isZh ? '真实的 LLM' : 'Real LLMs'}</strong>：{isZh ? '用数十亿句子训练，每次循环都在做这三步。' : 'trained on billions of sentences, doing these three steps every time.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setSentenceIdx(0); setCompletedGames(0); reset() }} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" /> {isZh ? '再玩一次' : 'Play Again'}
                    </button>
                    <Link to="/games" onClick={complete} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center hover:opacity-90 transition-all">
                      {isZh ? '返回游戏大厅' : 'Back to Games'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
