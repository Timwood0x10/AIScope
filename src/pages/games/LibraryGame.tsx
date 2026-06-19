import { useState, useMemo } from 'react'
import { ArrowRight, Check, Lightbulb, ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 简易相似度计算：根据关键词重合
function computeSimilarity(query: string, key: string): number {
  const qWords = new Set(query.toLowerCase().replace(/[，。！？,\.\!\?]/g, '').split(' ').filter(Boolean))
  const kWords = new Set(key.toLowerCase().replace(/[，。！？,\.\!\?]/g, '').split(' ').filter(Boolean))
  let shared = 0
  qWords.forEach(w => { if (kWords.has(w)) shared++ })
  // 同时也找字匹配（对中文友好）
  const qChars = new Set(query.toLowerCase())
  const kChars = new Set(key.toLowerCase())
  let charShared = 0
  qChars.forEach(c => { if (kChars.has(c)) charShared++ })
  return Math.min(1.0, shared / Math.max(qWords.size, 1) + charShared * 0.02 + 0.1)
}

function softmax(scores: number[], temperature = 1.0): number[] {
  const max = Math.max(...scores)
  const exps = scores.map(s => Math.exp((s - max) / temperature))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

const books = [
  {
    id: 1,
    emoji: '🦖',
    title: '恐龙帝国大百科',
    key: '恐龙 灭绝 化石 侏罗纪 史前',
    value: '恐龙是史前大型爬行动物，约6500万年前灭绝。化石告诉我们它们曾统治地球约1.6亿年。'
  },
  {
    id: 2,
    emoji: '🐱',
    title: '猫咪行为学',
    key: '猫咪 宠物 猫科 驯化 行为',
    value: '猫是被人类驯化约9500年的小型哺乳动物。它们会用呼噜声、尾巴和耳朵表达情绪。'
  },
  {
    id: 3,
    title: '植物世界图鉴',
    emoji: '🌿',
    key: '植物 光合 花卉 树木 生态',
    value: '植物通过光合作用把阳光转化为能量。它们是地球上几乎所有食物链的基础。'
  },
  {
    id: 4,
    emoji: '🚀',
    title: '太空探索简史',
    key: '太空 火箭 卫星 宇宙 天文',
    value: '人类于1969年首次登月。可观测宇宙估计有2万亿个星系，每星系含数十亿颗恒星。'
  },
  {
    id: 5,
    emoji: '🏛️',
    title: '历史的回声',
    key: '历史 文明 古代 考古 朝代',
    value: '人类有记录的文明始于约5500年前的美索不达米亚。文字的出现是文明进入的标志。'
  },
  {
    id: 6,
    emoji: '⚗️',
    title: '化学的魔法',
    key: '化学 分子 原子 反应 元素',
    value: '一切物质由原子构成。目前已知118种元素，它们可以组合成无数种分子。'
  }
]

const queryCandidates = [
  { text: '恐龙什么时候灭绝？', expect: '恐龙相关' },
  { text: '太空有多远？', expect: '天文相关' },
  { text: '我的猫在想什么？', expect: '猫咪相关' },
  { text: '植物能产生什么？', expect: '植物相关' }
]

export default function LibraryGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [step, setStep] = useState(0)
  const [query, setQuery] = useState('')
  const [scoreComputed, setScoreComputed] = useState(false)
  const [finalAnswer, setFinalAnswer] = useState(false)

  // 相似度与 softmax 权重
  const similarities = useMemo(() => {
    if (!query.trim()) return books.map(() => 0)
    return books.map(b => computeSimilarity(query, b.key))
  }, [query])

  const weights = useMemo(() => {
    if (!scoreComputed) return books.map(() => 0)
    return softmax(similarities, 0.3)
  }, [similarities, scoreComputed])

  const finalText = useMemo(() => {
    if (!scoreComputed) return ''
    // 找到最相关的书
    const topIdx = weights.indexOf(Math.max(...weights))
    return books[topIdx].value
  }, [weights, scoreComputed])

  const reset = () => {
    setStep(0)
    setQuery('')
    setScoreComputed(false)
    setFinalAnswer(false)
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.library = { completed: true, score: 100 }
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
            {/* 标题与进度 */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-6xl mb-4">📚</div>
                <h1 className="font-heading text-3xl font-bold mb-2">
                  {isZh ? '图书馆管理员' : 'Library Admin'}
                </h1>
                <p className="text-dark-400">
                  {isZh ? '通过图书分类理解 Q / K / V' : 'Understand Q / K / V through book classification'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500 mb-2">步骤 {step + 1}/4</div>
                <div className="w-32 h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${((step + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Step 0: 介绍 */}
            {step === 0 && (
              <div className="animate-fade-in">
                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold mb-3">{isZh ? '📖 故事设定' : '📖 Scenario'}</h3>
                  <p className="text-dark-400 mb-4">
                    {isZh
                      ? '你是一个图书管理员。根据读者的需求（Query），从书架上找出最合适的书籍。'
                      : 'You are a librarian. Based on the reader needs (Query), find the best books from the shelves.'}
                  </p>
                  <p className="text-dark-400 mb-4">
                    {isZh ? '每本书都有：' : 'Each book has:'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
                      <div className="text-violet-400 font-medium mb-1">🔑 {isZh ? '书架（Key）' : 'Shelf (Key)'}</div>
                      <div className="text-dark-500">{isZh ? '书的内容标签' : 'Book content tags'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                      <div className="text-blue-400 font-medium mb-1">📦 {isZh ? '推荐（Value）' : 'Recommendation (Value)'}</div>
                      <div className="text-dark-500">{isZh ? '书里真正写了什么' : 'What is actually written'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30">
                      <div className="text-fuchsia-400 font-medium mb-1">❓ {isZh ? '读者（Query）' : 'Reader (Query)'}</div>
                      <div className="text-dark-500">{isZh ? '读者问你的问题' : 'The question the reader asks'}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  开始找书 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 1: 选 query */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">{isZh ? '👋 读者来了，他说...' : '👋 The reader comes and says...'}</h3>
                  <p className="text-dark-500 text-sm mb-4">{isZh ? '选择一个问题试试看：' : 'Choose a question to try:'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {queryCandidates.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(q.text)}
                      className={`p-4 rounded-xl text-left transition-all border-2 ${
                        query === q.text
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-transparent bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm text-primary font-mono mb-1">❓</div>
                      <div className="font-medium">{q.text}</div>
                      <div className="text-xs text-dark-500 mt-1">{isZh ? '（预期：' : '(Expected: '}{q.expect}{isZh ? '）' : ')'}</div>
                    </button>
                  ))}
                </div>

                {query && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5">
                    <div className="text-xs text-dark-500 mb-1">{isZh ? '你选择的 Query' : 'Your selected Query'}</div>
                    <div className="text-lg font-medium text-fuchsia-400">"{query}"</div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    ← {isZh ? '上一步' : 'Back'}
                  </button>
                  <button
                    disabled={!query}
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isZh ? '去书架' : 'Go to Shelf'} <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: 看每本书的 Key 并计算相似度 */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">{isZh ? '🔍 比较 Query 和每本书的 Key' : '🔍 Compare Query with each book Key'}</h3>
                  <p className="text-dark-500 text-sm">
                    {isZh
                      ? <>我们把问题 <span className="text-fuchsia-400">"{query}"</span> 和每本书的关键词做比较。相关度越高 → <span className="text-violet-400">分数越高</span></>
                      : <>We compare the question <span className="text-fuchsia-400">"{query}"</span> with each book's keywords. Higher relevance → <span className="text-violet-400">Higher score</span></>}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {books.map((book, idx) => {
                    const sim = similarities[idx]
                    return (
                      <div key={book.id} className="p-4 rounded-xl bg-white/5">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl shrink-0">{book.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium mb-1">{book.title}</div>
                            <div className="text-xs text-dark-500 mb-3">
                              🔑 {isZh ? '关键词：' : 'Keywords: '}{book.key}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                                  style={{ width: `${sim * 100}%` }}
                                />
                              </div>
                              <div className="text-sm font-mono font-bold text-violet-400 w-16 text-right">
                                {(sim * 100).toFixed(0)}{isZh ? '分' : 'pts'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    ← {isZh ? '上一步' : 'Back'}
                  </button>
                  <button
                    onClick={() => { setScoreComputed(true); setStep(3) }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-all"
                  >
                    {isZh ? '归一化为权重' : 'Normalize to weights'} <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: softmax 权重 */}
            {step === 3 && (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">{isZh ? '⚖️ 权重归一化（Softmax）' : '⚖️ Weight Normalization (Softmax)'}</h3>
                  <p className="text-dark-500 text-sm">
                    {isZh
                      ? <>把分数变成 0~1 的<span className="text-violet-400">权重</span>，让它们加起来 = 1。这样高分的书就会在最终答案里"说话更大声"。</>
                      : <>Turn scores into 0~1 <span className="text-violet-400">weights</span>, summing to 1. Higher score books "speak louder" in the final answer.</>}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {books.map((book, idx) => {
                    const w = weights[idx]
                    const isTop = w === Math.max(...weights)
                    return (
                      <div
                        key={book.id}
                        className={`p-4 rounded-xl transition-all ${
                          isTop
                            ? 'bg-violet-500/20 border border-violet-500/50'
                            : 'bg-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl shrink-0">{book.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium mb-1 flex items-center gap-2">
                              {book.title}
                              {isTop && <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">👑 {isZh ? '最相关' : 'Most relevant'}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                                  style={{ width: `${w * 100}%` }}
                                />
                              </div>
                              <div className="text-sm font-mono font-bold text-violet-400 w-16 text-right">
                                {(w * 100).toFixed(0)}%
                              </div>
                            </div>
                            {isTop && (
                              <div className="mt-3 text-sm text-dark-300 bg-white/5 rounded-lg p-3 border-l-4 border-violet-500">
                                💡 {book.value}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 最终答案 */}
                <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-1" />
                    <div>
                      <div className="text-sm text-dark-500 mb-1">{isZh ? '📝 综合后的答案（加权求和）' : '📝 Final answer (weighted sum)'}</div>
                      <div className="text-lg leading-relaxed">
                        {finalText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 知识总结 */}
                <div className="mb-6 p-5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold">{isZh ? '💡 注意力权重（Q·K）' : '💡 Attention Weights (Q·K)'}</h4>
                  </div>
                  <div className="space-y-2 text-sm text-dark-400">
                    <p>
                      {isZh
                        ? '理解了吗？大模型的注意力机制就是如此！'
                        : 'Got it? This is exactly how model attention works!'}
                    </p>
                    <div><span className="text-fuchsia-400 font-mono">Q = Query</span> → {isZh ? '读者的需求（当前词）' : 'Reader need (current word)'}</div>
                    <div><span className="text-violet-400 font-mono">K = Key</span> → {isZh ? '每本书的关键词（其他词的索引）' : 'Book keywords (other words index)'}</div>
                    <div><span className="text-blue-400 font-mono">V = Value</span> → {isZh ? '每本书的实际内容' : 'Each book actual content'}</div>
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <code className="text-primary font-mono block">Attention(Query, Keys, Values) = softmax(Query · Keys^T) · Values</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    ← {isZh ? '上一步' : 'Back'}
                  </button>
                  <button
                    onClick={() => {
                      complete()
                      setFinalAnswer(true)
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> {isZh ? '完成！🎉' : 'Done! 🎉'}
                  </button>
                </div>
              </div>
            )}

            {finalAnswer && (
              <div className="mt-6 animate-fade-in p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="font-heading text-xl font-bold mb-2 text-green-400">{isZh ? '图书馆管理员大师！' : 'Library Master!'}</h3>
                <p className="text-dark-400 mb-4">
                  {isZh
                    ? '你现在理解了：Query 是当前词的需求，Key 是其他词的可提供内容，Value 是实际内容。它们通过矩阵运算关联起来！'
                    : 'Now you understand: Query is what the current word needs, Key is what other words offer, Value is the actual content. They connect through matrix operations!'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    {isZh ? '再玩一次' : 'Play Again'}
                  </button>
                  <Link
                    to="/games"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all"
                  >
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
