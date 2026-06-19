import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, Target, Eye, RotateCcw, CheckCircle, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 句子数据
const sentences = [
  {
    id: 1,
    text: ['小明', '今天', '去', '公园', '玩'],
    context: ['小明', '今天', '去', '公园'],
    answer: '玩',
    options: ['玩', '吃饭', '睡觉', '跑步', '游泳'],
    attention: [0.05, 0.1, 0.2, 0.65], // 每个词对预测下一个词的注意力权重
    explanation: '"公园"获得最高注意力（65%），因为"去公园"后面最常跟"玩"。'
  },
  {
    id: 2,
    text: ['天空', '中', '飘着', '几朵', '白云'],
    context: ['天空', '中', '飘着', '几朵'],
    answer: '白云',
    options: ['白云', '小鸟', '飞机', '太阳', '星星'],
    attention: [0.35, 0.1, 0.2, 0.35],
    explanation: '"天空"和"几朵"共同决定了下一个词是"白云"——天空中飘着几朵云。'
  },
  {
    id: 3,
    text: ['妈妈', '在', '厨房', '做', '饭菜'],
    context: ['妈妈', '在', '厨房', '做'],
    answer: '饭菜',
    options: ['饭菜', '作业', '衣服', '手机', '游戏'],
    attention: [0.15, 0.05, 0.5, 0.3],
    explanation: '"厨房"获得最高注意力（50%），因为在厨房里最常做的就是"饭菜"。'
  },
  {
    id: 4,
    text: ['我', '最喜欢', '的', '水果', '是', '草莓'],
    context: ['我', '最喜欢', '的', '水果', '是'],
    answer: '草莓',
    options: ['草莓', '苹果', '香蕉', '西瓜', '葡萄'],
    attention: [0.1, 0.1, 0.1, 0.6, 0.1],
    explanation: '"水果"获得最高注意力（60%），因为前面说的是"最喜欢的水果"。'
  }
]

export default function AttentionGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [gamePhase, setGamePhase] = useState<'intro' | 'guess' | 'reveal' | 'complete'>('intro')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAttention, setShowAttention] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const sentence = sentences[sentenceIdx]

  const isCorrect = selectedOption === sentence.answer

  const nextSentence = () => {
    if (sentenceIdx < sentences.length - 1) {
      setSentenceIdx(i => i + 1)
      setSelectedOption(null)
      setShowAttention(false)
      setGamePhase('guess')
    } else {
      setCompleted(true)
      setGamePhase('complete')
    }
  }

  const reset = () => {
    setSentenceIdx(0)
    setSelectedOption(null)
    setShowAttention(false)
    setScore(0)
    setCompleted(false)
    setGamePhase('intro')
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.attentionGame = { completed: true, score }
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
                <div className="text-5xl mb-3">👁️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? '注意力填词' : 'Attention Fill-in'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '可视化大模型在预测下一个词时关注什么' : 'Visualize what the model attends to when predicting next word'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? '句子 ' : 'Sentence '}{sentenceIdx + 1}/{sentences.length}</div>
                <div className="text-lg font-bold text-primary">{score} {isZh ? '分' : 'pts'}</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-5 h-5 text-violet-400" />
                    <h3 className="font-heading text-lg font-semibold text-violet-400">{isZh ? '游戏规则' : 'How It Works'}</h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh ? '🎯 你要做什么？' : '🎯 Your Task:'}
                  </p>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh ? '选择最合理的下一个词，看看模型和你关注的词是否一样！' : 'Choose the most reasonable next word and see if the model focuses on the same words as you do!'}
                  </p>
                </div>

                <button
                  onClick={() => setGamePhase('guess')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始游戏 🎮' : 'Start Game 🎮'}
                </button>
              </div>
            )}

            {/* 游戏主体 */}
            {(gamePhase === 'guess' || gamePhase === 'reveal') && (
              <div className="animate-fade-in">
                {/* 句子展示 */}
                <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30">
                  <div className="text-sm text-dark-500 mb-2 text-center">{isZh ? '📖 句子' : '📖 Sentence'}</div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xl md:text-2xl">
                    {sentence.context.map((word, idx) => (
                      <div key={idx} className="relative group">
                        <span className={`px-3 py-2 rounded-lg transition-all ${
                          showAttention
                            ? 'bg-violet-500/30 border-2 border-violet-400'
                            : 'bg-white/10'
                        }`}>
                          {word}
                        </span>
                        {/* 注意力指示器 */}
                        {showAttention && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                                  style={{ width: `${sentence.attention[idx] * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-violet-400 font-mono">{(sentence.attention[idx] * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <span className="px-4 py-2 rounded-lg bg-white/10 border-2 border-dashed border-violet-400 text-violet-400 font-bold">
                      ?
                    </span>
                  </div>
                </div>

                {/* 选项 */}
                <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {sentence.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        if (gamePhase === 'guess') {
                          setSelectedOption(opt)
                          setGamePhase('reveal')
                          if (opt === sentence.answer) {
                            setScore(s => s + 25)
                          }
                        }
                      }}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        gamePhase === 'reveal' && opt === sentence.answer
                          ? 'border-green-500 bg-green-500/20'
                          : gamePhase === 'reveal' && opt === selectedOption && opt !== sentence.answer
                          ? 'border-red-500 bg-red-500/20'
                          : gamePhase === 'guess'
                          ? 'border-transparent bg-white/5 hover:bg-white/10'
                          : 'border-transparent bg-white/5 opacity-50'
                      }`}
                    >
                      <div className="text-lg font-bold">{opt}</div>
                      {gamePhase === 'reveal' && opt === sentence.answer && (
                        <div className="mt-1 text-xs text-green-400 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {isZh ? '正确答案' : 'Correct'}
                        </div>
                      )}
                      {gamePhase === 'reveal' && opt === selectedOption && opt !== sentence.answer && (
                        <div className="mt-1 text-xs text-red-400">{isZh ? '❌ 错误' : '❌ Wrong'}</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* 注意力可视化 */}
                {gamePhase === 'reveal' && (
                  <div className="mb-6 p-5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-violet-400" />
                      <h4 className="font-semibold">{isZh ? '🤖 模型的注意力' : '🤖 Model Attention'}</h4>
                    </div>
                    <p className="text-sm text-dark-400 mb-4">
                      {isZh ? '当模型预测"?"位置的词时，它会给前面每个词分配一个"注意力权重"。权重越高，说明那个词对预测越重要。' : 'When the model predicts the "?" word, it assigns attention weights to each preceding word. Higher weight means that word is more important for the prediction.'}
                    </p>

                    {/* 注意力条形图 */}
                    <div className="space-y-3">
                      {sentence.context.map((word, idx) => {
                        const att = sentence.attention[idx]
                        const isHighest = att === Math.max(...sentence.attention)
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-16 text-sm font-medium">{word}</div>
                            <div className="flex-1 h-6 bg-dark-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-700 flex items-center justify-end pr-2 ${
                                  isHighest
                                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                                    : 'bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50'
                                }`}
                                style={{ width: `${att * 100}%` }}
                              >
                                <span className="text-xs font-bold">{(att * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            {isHighest && <span className="text-xs text-violet-400">👑</span>}
                          </div>
                        )
                      })}
                    </div>

                    {/* 解释 */}
                    <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-dark-400">{sentence.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                {gamePhase === 'reveal' && !completed && (
                  <button
                    onClick={nextSentence}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {sentenceIdx < sentences.length - 1 ? (isZh ? '下一句 →' : 'Next Sentence →') : (isZh ? '完成！🎉' : 'Done! 🎉')}
                  </button>
                )}
              </div>
            )}

            {/* 完成 */}
            {gamePhase === 'complete' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">{isZh ? '注意力理解大师！' : 'Attention Master!'}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-3xl font-bold text-yellow-400">{score} / {sentences.length * 25}</span>
                  </div>
                  <p className="text-dark-400 mb-6">
                    {isZh
                      ? '你现在理解了：Self-Attention 让模型能看到上下文，决定每个词该关注哪些其他词。这就是大模型理解语言的核心！'
                      : 'Now you understand: Self-Attention lets the model see context and decide which words to focus on. This is the core of how LLMs understand language!'}
                  </p>

                  <div className="p-5 rounded-xl bg-white/5 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold">{isZh ? '💡 明白了吗？' : '💡 Got it?'}</h4>
                    </div>
                    <p className="text-sm text-dark-400 mb-2">
                      {isZh
                        ? '你和模型关注的词可能不完全一样，但核心思想是：模型会动态地"看"哪些词更重要。'
                        : 'You and the model may not focus on exactly the same words, but the core idea is: the model dynamically "looks" at which words are more important.'}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" /> {isZh ? '再玩一次' : 'Play Again'}
                    </button>
                    <Link to="/games" onClick={complete} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center hover:opacity-90 transition-all">
                      {isZh ? '返回游戏大厅' : 'Back to Games'}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
