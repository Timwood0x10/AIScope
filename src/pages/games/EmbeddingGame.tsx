import { useState, useMemo, useRef, useEffect } from 'react'
import { ArrowLeft, Lightbulb, RotateCcw, Play, Pause, Plus, Minus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 简化的词向量（用 2D 模拟高维空间）
// 每个词有一个 (x, y) 坐标，代表语义方向
interface WordVector {
  word: string
  emoji: string
  x: number  // -10 到 10
  y: number  // -10 到 10
  category: 'animal' | 'food' | 'tech' | 'emotion' | 'color'
}

const wordDatabase: WordVector[] = [
  // Animals
  { word: 'dog', emoji: '🐕', x: 6, y: 3, category: 'animal' },
  { word: 'cat', emoji: '🐱', x: 5.5, y: 3.5, category: 'animal' },
  { word: 'bird', emoji: '🐦', x: 4, y: 5, category: 'animal' },
  { word: 'fish', emoji: '🐟', x: 3, y: 4, category: 'animal' },
  { word: 'lion', emoji: '🦁', x: 7, y: 2, category: 'animal' },
  { word: 'bear', emoji: '🐻', x: 6.5, y: 1.5, category: 'animal' },
  
  // Food
  { word: 'apple', emoji: '🍎', x: -3, y: 4, category: 'food' },
  { word: 'banana', emoji: '🍌', x: -4, y: 5, category: 'food' },
  { word: 'pizza', emoji: '🍕', x: -2, y: 6, category: 'food' },
  { word: 'rice', emoji: '🍚', x: -3.5, y: 3, category: 'food' },
  { word: 'bread', emoji: '🍞', x: -2.5, y: 5, category: 'food' },
  { word: 'cake', emoji: '🎂', x: -1, y: 4.5, category: 'food' },
  
  // Tech
  { word: 'computer', emoji: '💻', x: 8, y: -5, category: 'tech' },
  { word: 'phone', emoji: '📱', x: 7, y: -4, category: 'tech' },
  { word: 'robot', emoji: '🤖', x: 9, y: -3, category: 'tech' },
  { word: 'AI', emoji: '🧠', x: 8.5, y: -2, category: 'tech' },
  { word: 'data', emoji: '📊', x: 7.5, y: -6, category: 'tech' },
  { word: 'internet', emoji: '🌐', x: 6, y: -5, category: 'tech' },
  
  // Emotions
  { word: 'happy', emoji: '😊', x: -6, y: -2, category: 'emotion' },
  { word: 'sad', emoji: '😢', x: -7, y: 1, category: 'emotion' },
  { word: 'angry', emoji: '😠', x: -8, y: 2, category: 'emotion' },
  { word: 'love', emoji: '❤️', x: -5, y: -3, category: 'emotion' },
  { word: 'fear', emoji: '😨', x: -7, y: 0, category: 'emotion' },
  { word: 'surprise', emoji: '😲', x: -6, y: -1, category: 'emotion' },
  
  // Colors
  { word: 'red', emoji: '🔴', x: 0, y: 8, category: 'color' },
  { word: 'blue', emoji: '🔵', x: 1, y: 9, category: 'color' },
  { word: 'green', emoji: '🟢', x: 2, y: 8.5, category: 'color' },
  { word: 'yellow', emoji: '🟡', x: 0.5, y: 7, category: 'color' },
  { word: 'purple', emoji: '🟣', x: -1, y: 9, category: 'color' },
  { word: 'orange', emoji: '🟠', x: 1, y: 7.5, category: 'color' },
]

// 计算两个向量的欧几里得距离
function distance(a: WordVector, b: WordVector): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// 计算余弦相似度
function cosineSimilarity(a: WordVector, b: WordVector): number {
  const dot = a.x * b.x + a.y * b.y
  const normA = Math.sqrt(a.x ** 2 + a.y ** 2)
  const normB = Math.sqrt(b.x ** 2 + b.y ** 2)
  return dot / (normA * normB)
}

// 找最近的 K 个词
function findNearest(word: WordVector, words: WordVector[], k: number): WordVector[] {
  return [...words]
    .filter(w => w.word !== word.word)
    .map(w => ({ word: w, dist: distance(word, w) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
    .map(item => item.word)
}

const categoryColors: Record<string, string> = {
  animal: 'from-amber-500 to-orange-500',
  food: 'from-red-500 to-pink-500',
  tech: 'from-blue-500 to-cyan-500',
  emotion: 'from-purple-500 to-fuchsia-500',
  color: 'from-green-500 to-emerald-500',
}

const categoryNames: Record<string, string> = {
  animal: '动物',
  food: '食物',
  tech: '科技',
  emotion: '情感',
  color: '颜色',
}

const categoryNamesEn: Record<string, string> = {
  animal: 'Animals',
  food: 'Food',
  tech: 'Tech',
  emotion: 'Emotions',
  color: 'Colors',
}

export default function EmbeddingGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [selectedWord, setSelectedWord] = useState<WordVector | null>(null)
  const [customWord, setCustomWord] = useState('')
  const [nearestK, setNearestK] = useState(3)
  const [showLines, setShowLines] = useState(true)
  const [showClusters, setShowClusters] = useState(true)
  const [gamePhase, setGamePhase] = useState<'intro' | 'explore' | 'complete'>('intro')
  const [animating, setAnimating] = useState(false)
  const [animIndex, setAnimIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const nearestWords = useMemo(() => {
    if (!selectedWord) return []
    return findNearest(selectedWord, wordDatabase, nearestK)
  }, [selectedWord, nearestK])

  // 绘制 2D 向量空间
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 50

    // 清除画布
    ctx.fillStyle = 'rgba(15, 23, 42, 1)'
    ctx.fillRect(0, 0, width, height)

    // 绘制背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * (width - padding * 2)
      const y = padding + (i / 10) * (height - padding * 2)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // 坐标轴标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(isZh ? '语义方向 1 (x)' : 'Semantic dim 1 (x)', width / 2, height - 15)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(isZh ? '语义方向 2 (y)' : 'Semantic dim 2 (y)', 0, 0)
    ctx.restore()

    // 聚类背景（如果显示）
    if (showClusters) {
      const categories = ['animal', 'food', 'tech', 'emotion', 'color'] as const
      categories.forEach(cat => {
        const words = wordDatabase.filter(w => w.category === cat)
        if (words.length === 0) return

        const centerX = words.reduce((sum, w) => sum + w.x, 0) / words.length
        const centerY = words.reduce((sum, w) => sum + w.y, 0) / words.length

        const screenX = padding + ((centerX + 10) / 20) * (width - padding * 2)
        const screenY = padding + ((10 - centerY) / 20) * (height - padding * 2)

        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 100)
        const color = categoryColors[cat]
        gradient.addColorStop(0, color.includes('amber') ? 'rgba(245, 158, 11, 0.15)' :
                              color.includes('red') ? 'rgba(239, 68, 68, 0.15)' :
                              color.includes('blue') ? 'rgba(59, 130, 246, 0.15)' :
                              color.includes('purple') ? 'rgba(168, 85, 247, 0.15)' :
                              'rgba(34, 197, 94, 0.15)')
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(screenX, screenY, 100, 0, Math.PI * 2)
        ctx.fill()

        // 类别标签
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(isZh ? categoryNames[cat] : categoryNamesEn[cat], screenX, screenY - 70)
      })
    }

    // 绘制连线
    if (showLines && selectedWord) {
      const selX = padding + ((selectedWord.x + 10) / 20) * (width - padding * 2)
      const selY = padding + ((10 - selectedWord.y) / 20) * (height - padding * 2)

      nearestWords.forEach((word, idx) => {
        const wordX = padding + ((word.x + 10) / 20) * (width - padding * 2)
        const wordY = padding + ((10 - word.y) / 20) * (height - padding * 2)

        ctx.beginPath()
        ctx.moveTo(selX, selY)
        ctx.lineTo(wordX, wordY)
        const alpha = animating ? 0.3 + (idx / nearestWords.length) * 0.4 : 0.3
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
        ctx.lineWidth = 1 + (nearestK - idx) * 0.5
        ctx.stroke()
      })
    }

    // 绘制所有词
    wordDatabase.forEach((word) => {
      const screenX = padding + ((word.x + 10) / 20) * (width - padding * 2)
      const screenY = padding + ((10 - word.y) / 20) * (height - padding * 2)

      const isSelected = selectedWord?.word === word.word
      const isNearest = nearestWords.some(w => w.word === word.word)
      const isAnimNearest = animating && nearestWords[animIndex]?.word === word.word

      // 词圆点
      ctx.beginPath()
      ctx.arc(screenX, screenY, isSelected ? 25 : isAnimNearest ? 22 : 18, 0, Math.PI * 2)
      
      if (isSelected) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.5)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(139, 92, 246, 1)'
        ctx.lineWidth = 3
        ctx.stroke()
      } else if (isNearest || isAnimNearest) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.5)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(34, 197, 94, 1)'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fill()
      }

      // Emoji
      ctx.font = isSelected || isNearest ? '20px sans-serif' : '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word.emoji, screenX, screenY)

      // 词标签
      ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.7)'
      ctx.font = `${isSelected ? 12 : 10}px sans-serif`
      ctx.fillText(word.word, screenX, screenY + (isSelected || isNearest ? 35 : 28))
    })

  }, [selectedWord, nearestWords, showLines, showClusters, animating, animIndex, nearestK])

  // 动画效果
  useEffect(() => {
    if (animating && nearestWords.length > 0) {
      const interval = setInterval(() => {
        setAnimIndex(prev => (prev + 1) % nearestWords.length)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [animating, nearestWords.length])

  const handleWordClick = (word: WordVector) => {
    setSelectedWord(word)
    setAnimating(false)
    setAnimIndex(0)
  }

  const reset = () => {
    setSelectedWord(null)
    setCustomWord('')
    setGamePhase('intro')
    setAnimating(false)
    setAnimIndex(0)
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.embedding = { completed: true, score: 100 }
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
                <div className="text-5xl mb-3">🧭</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? '词向量空间' : 'Word Vector Space'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '词语的含义决定了它们在空间中的位置' : 'Word meaning determines their position in space'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? '探索模式' : 'Explore Mode'}</div>
                <div className="text-lg font-bold text-primary">{wordDatabase.length} {isZh ? '词' : 'Words'}</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-heading text-lg font-semibold text-yellow-400">{isZh ? '什么是词向量？' : 'What is a Word Vector?'}</h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh ? 'LLM 把每个词变成一串数字（向量），相似的词会靠得很近。' : 'LLMs turn each word into a string of numbers (a vector). Similar words are close together.'}
                    {isZh ? '比如"狗"和"猫"都是动物，所以它们在空间中是邻居！' : "Like 'dog' and 'cat' are both animals — so they're neighbors in space!"}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                      <div className="text-violet-400 font-medium mb-2">📍 {isZh ? '语义相近' : 'Similar Meaning'}</div>
                      <div className="flex items-center gap-2">
                        <span>🐕 dog</span>
                        <span className="text-dark-500">≈</span>
                        <span>🐱 cat</span>
                      </div>
                      <div className="text-xs text-dark-500 mt-1">{isZh ? '它们距离很近' : 'They are very close'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="text-green-400 font-medium mb-2">📍 {isZh ? '语义不同' : 'Different Meaning'}</div>
                      <div className="flex items-center gap-2">
                        <span>🐕 dog</span>
                        <span className="text-dark-500">≠</span>
                        <span>🍕 pizza</span>
                      </div>
                      <div className="text-xs text-dark-500 mt-1">{isZh ? '它们距离很远' : 'They are far apart'}</div>
                    </div>
                  </div>

                  <p className="text-dark-400 text-sm">
                    {isZh ? '这个游戏用 2D 空间模拟真实的高维向量空间。真实 LLM 用的是几百甚至几千维的空间！' : 'This game uses 2D space to simulate a real high-dimensional vector space. Real LLMs use hundreds or thousands of dimensions!'}
                  </p>
                </div>

                <button
                  onClick={() => setGamePhase('explore')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始探索' : 'Start Exploring'} →
                </button>
              </div>
            )}

            {/* 探索模式 */}
            {gamePhase === 'explore' && (
              <div className="animate-fade-in">
                {/* 控制栏 */}
                <div className="flex flex-wrap items-center gap-4 mb-4 p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-400">{isZh ? '显示：' : 'Show:'}</span>
                    <button
                      onClick={() => setShowLines(!showLines)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${showLines ? 'bg-violet-500/30 text-violet-400' : 'bg-white/10 text-dark-400'}`}
                    >
                      {isZh ? '连线' : 'Lines'}
                    </button>
                    <button
                      onClick={() => setShowClusters(!showClusters)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${showClusters ? 'bg-violet-500/30 text-violet-400' : 'bg-white/10 text-dark-400'}`}
                    >
                      {isZh ? '聚类' : 'Clusters'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-400">{isZh ? '邻居数：' : 'Neighbors:'}</span>
                    <button
                      onClick={() => setNearestK(Math.max(1, nearestK - 1))}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-violet-400 w-8 text-center">{nearestK}</span>
                    <button
                      onClick={() => setNearestK(Math.min(6, nearestK + 1))}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedWord && (
                    <button
                      onClick={() => setAnimating(!animating)}
                      className="ml-auto px-4 py-1 rounded-lg bg-violet-500/30 text-violet-400 text-sm flex items-center gap-2"
                    >
                      {animating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {animating ? (isZh ? '暂停' : 'Pause') : (isZh ? '动画' : 'Animate')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 词表 */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="text-sm text-dark-400 mb-3">{isZh ? '点击选择一个词：' : 'Click to select a word:'}</div>
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {Object.entries(categoryNames).map(([cat, name]) => (
                          <div key={cat}>
                            <div className="text-xs text-dark-500 uppercase tracking-wider mb-1">{isZh ? name : categoryNamesEn[cat]}</div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {wordDatabase.filter(w => w.category === cat).map(word => (
                                <button
                                  key={word.word}
                                  onClick={() => handleWordClick(word)}
                                  className={`px-2 py-1 rounded text-sm flex items-center gap-1 transition-all ${
                                    selectedWord?.word === word.word
                                      ? 'bg-violet-500/50 text-white'
                                      : 'bg-white/5 hover:bg-white/10 text-dark-300'
                                  }`}
                                >
                                  <span>{word.emoji}</span>
                                  <span>{word.word}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 向量空间画布 */}
                  <div className="lg:col-span-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="w-full rounded-xl bg-dark-100 border border-white/10"
                    />
                    
                    {/* 图例 */}
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500/50 border-2 border-violet-500"></div>
                        <span className="text-xs text-dark-400">{isZh ? '选中词' : 'Selected'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500/50 border-2 border-green-500"></div>
                        <span className="text-xs text-dark-400">{isZh ? '最近邻' : 'Nearest'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <span className="text-xs text-dark-400">{isZh ? '其他词' : 'Others'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 选中词信息 */}
                {selectedWord && (
                  <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-4xl mb-2">{selectedWord.emoji}</div>
                        <div className="font-heading text-2xl font-bold">{selectedWord.word}</div>
                        <div className="text-sm text-dark-400">{isZh ? categoryNames[selectedWord.category] : categoryNamesEn[selectedWord.category]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-dark-500">{isZh ? '向量坐标' : 'Vector Coords'}</div>
                        <div className="font-mono text-lg text-violet-400">
                          ({selectedWord.x.toFixed(1)}, {selectedWord.y.toFixed(1)})
                        </div>
                      </div>
                    </div>

                    {/* 最近邻 */}
                    <div className="mb-4">
                      <div className="text-sm text-dark-400 mb-2">{isZh ? `最近的 ${nearestK} 个词：` : `Nearest ${nearestK} words:`}</div>
                      <div className="flex flex-wrap gap-2">
                        {nearestWords.map((word, idx) => (
                          <div
                            key={word.word}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                              animating && animIndex === idx
                                ? 'bg-green-500/30 scale-110'
                                : 'bg-white/5'
                            }`}
                          >
                            <span>{word.emoji}</span>
                            <span>{word.word}</span>
                            <span className="text-xs text-dark-500">
                              {distance(selectedWord, word).toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 相似度 */}
                    <div className="p-3 rounded-lg bg-white/5 text-sm">
                      <div className="flex items-center gap-2 text-dark-400">
                        <span>{isZh ? '相似度公式：' : 'Similarity formula:'}</span>
                        <code className="text-violet-400">cos(θ) = (A·B) / (|A||B|)</code>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> {isZh ? '重置' : 'Reset'}
                  </button>
                  <button
                    onClick={() => {
                      complete()
                      setGamePhase('complete')
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all"
                  >
                    {isZh ? '完成！🎉' : 'Done! 🎉'}
                  </button>
                </div>
              </div>
            )}

            {/* 完成 */}
            {gamePhase === 'complete' && (
              <div className="animate-fade-in text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">{isZh ? '词向量大师！' : 'Word Vector Master!'}</h3>
                <p className="text-dark-400 mb-6">
                  {isZh ? '你现在理解了：LLM 把每个词变成向量，相似的词在高维空间中靠得很近。' : 'Now you understand: LLMs turn each word into a vector, and similar words are close in high-dimensional space.'}
                  {isZh ? '这就是为什么 AI 能理解"狗"和"猫"都是宠物！' : "That's why AI understands that 'dog' and 'cat' are both pets!"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                    <div className="text-violet-400 font-medium mb-2">📐 {isZh ? '向量表示' : 'Vector Representation'}</div>
                    <div className="text-sm text-dark-400">
                      {isZh ? '每个词 = 一串数字，比如 [0.5, -0.3, 0.8, ...]' : 'Each word = a string of numbers, e.g. [0.5, -0.3, 0.8, ...]'}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="text-green-400 font-medium mb-2">📍 {isZh ? '语义相似' : 'Semantic Similarity'}</div>
                    <div className="text-sm text-dark-400">
                      {isZh ? '相似的词在空间中距离近' : 'Similar words are close in space'}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="text-blue-400 font-medium mb-2">🧮 {isZh ? '运算能力' : 'Algebraic Ability'}</div>
                    <div className="text-sm text-dark-400">
                      king - man + woman {isZh ? '≈ queen（类比运算）' : '≈ queen (analogy)'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" /> {isZh ? '再玩一次' : 'Play Again'}
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
