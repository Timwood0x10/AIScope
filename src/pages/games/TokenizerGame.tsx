import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Lightbulb, Scissors, Hash, Type, Sparkles, RotateCcw, Check, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 简化的中文字符 tokenizer（按字数切分 + 常见词合并）
function tokenizeChinese(text: string): string[] {
  // 常见词词典
  const commonWords = [
    '今天', '天气', '很好', '我们', '学习', '机器', '人工智能', '深度', '神经网络',
    '北京', '上海', '中国', '美国', '日本', '电脑', '手机', '科学', '技术', '模型',
    '语言', '自然', '处理', '世界', '人类', '历史', '未来', '教育', '健康', '生活'
  ]
  
  const tokens: string[] = []
  let remaining = text
  
  while (remaining.length > 0) {
    let matched = false
    // 优先匹配最长词
    for (let len = Math.min(remaining.length, 6); len >= 2; len--) {
      const word = remaining.slice(0, len)
      if (commonWords.includes(word)) {
        tokens.push(word)
        remaining = remaining.slice(len)
        matched = true
        break
      }
    }
    if (!matched) {
      // 单字作为一个 token
      tokens.push(remaining[0])
      remaining = remaining.slice(1)
    }
  }
  return tokens
}

// BPE 风格的 tokenize（针对英文）
function tokenizeEnglish(text: string): string[] {
  // 简化的 BPE 词表
  const vocab = [
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'can', 'may', 'might', 'must', 'shall', 'need', 'dare', 'ought', 'used',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'and', 'but', 'or', 'if', 'because', 'until', 'while',
    '</w>' // word ending marker
  ]
  
  const tokens: string[] = []
  let remaining = text.toLowerCase().trim()
  
  while (remaining.length > 0) {
    let matched = false
    // 优先匹配最长词
    for (let len = Math.min(remaining.length, 10); len >= 1; len--) {
      const word = remaining.slice(0, len)
      if (vocab.includes(word)) {
        tokens.push(word)
        remaining = remaining.slice(len)
        matched = true
        break
      }
    }
    if (!matched) {
      // 未知字符用 UNK
      tokens.push('[UNK]')
      remaining = remaining.slice(1)
    }
  }
  return tokens
}

// 计算 token 统计信息
function analyzeTokens(tokens: string[]) {
  return {
    count: tokens.length,
    uniqueCount: new Set(tokens).size,
    avgLength: tokens.reduce((sum, t) => sum + t.length, 0) / tokens.length,
    longest: Math.max(...tokens.map(t => t.length)),
  }
}

const examples = [
  {
    lang: 'zh',
    text: '今天天气很好，我们去公园玩吧！',
    description: '中文字符逐个切分，常见词合并'
  },
  {
    lang: 'zh',
    text: '人工智能正在改变我们的世界',
    description: '专业术语作为整体保留'
  },
  {
    lang: 'en',
    text: 'Artificial intelligence is transforming our world',
    description: '英文单词级别切分'
  },
  {
    lang: 'en',
    text: 'The quick brown fox jumps over the lazy dog',
    description: '常用词直接匹配'
  }
]

export default function TokenizerGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [exampleIdx, setExampleIdx] = useState(0)
  const [gamePhase, setGamePhase] = useState<'intro' | 'demo' | 'play' | 'complete'>('intro')
  const [customText, setCustomText] = useState('')
  const [showSubword, setShowSubword] = useState(false)

  const example = examples[exampleIdx]
  const textIsZh = example.lang === 'zh'
  
  const tokens = useMemo(() => {
    const text = gamePhase === 'play' ? customText : example.text
    return textIsZh ? tokenizeChinese(text) : tokenizeEnglish(text)
  }, [example.text, customText, textIsZh, gamePhase])
  
  const stats = useMemo(() => analyzeTokens(tokens), [tokens])
  
  const reset = () => {
    setExampleIdx(0)
    setCustomText('')
    setGamePhase('intro')
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.tokenizer = { completed: true, score: 100 }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  const bytePairEncode = (text: string): string[] => {
    // 简化版 BPE
    const chars = text.toLowerCase().split('')
    const pairs = new Map<string, number>()
    
    // 统计相邻字符对
    for (let i = 0; i < chars.length - 1; i++) {
      const pair = chars[i] + chars[i + 1]
      pairs.set(pair, (pairs.get(pair) || 0) + 1)
    }
    
    return chars
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4">
        <div className="container-width max-w-4xl">
          <Link to="/games" className="text-sm text-dark-500 hover:text-dark-400 flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> {isZh ? '返回游戏大厅' : 'Back to Games'}
          </Link>

          <div className="glass-card p-8">
            {/* 标题 */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-5xl mb-3">✂️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">
                  {isZh ? 'Token 切割师' : 'Token Slicer'}
                </h1>
                <p className="text-dark-400 text-sm">
                  {isZh ? '看看文字是如何变成数字的' : 'See how text becomes numbers'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">
                  {textIsZh ? '中文模式' : 'English Mode'}
                </div>
                <div className="text-lg font-bold text-primary">{stats.count} tokens</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-heading text-lg font-semibold text-yellow-400">
                      {isZh ? '什么是 Token？' : 'What is a Token?'}
                    </h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh
                      ? 'LLM 不能直接读"文字"，它只能处理数字。所以要把文字切成一小块一小块，每块给一个编号。'
                      : 'LLMs can\'t read "text" directly - they only process numbers. So we slice text into chunks, each getting a number ID.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <div className="text-cyan-400 font-medium mb-1">📝 {isZh ? '字符级' : 'Char-level'}</div>
                      <div className="text-dark-500">{isZh ? '每个字 = 1 token' : 'Each char = 1 token'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                      <div className="text-blue-400 font-medium mb-1">📖 {isZh ? '词级' : 'Word-level'}</div>
                      <div className="text-dark-500">{isZh ? '每个词 = 1 token' : 'Each word = 1 token'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                      <div className="text-purple-400 font-medium mb-1">✂️ {isZh ? '子词级' : 'Subword'}</div>
                      <div className="text-dark-500">{isZh ? '常用词保留，生僻字拆分' : 'Keep common words, split rare ones'}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setGamePhase('demo')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {isZh ? '看看例子 →' : 'See Examples →'}
                </button>
              </div>
            )}

            {/* 例子演示 */}
            {gamePhase === 'demo' && (
              <div className="animate-fade-in">
                {/* 示例选择 */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {examples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExampleIdx(idx)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        idx === exampleIdx
                          ? 'bg-cyan-500/30 text-cyan-400'
                          : 'bg-white/5 text-dark-400 hover:bg-white/10'
                      }`}
                    >
                      {ex.lang === 'zh' ? '🇨🇳' : '🇺🇸'} {ex.text.slice(0, 15)}...
                    </button>
                  ))}
                </div>

                {/* 当前例子 */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 mb-6">
                  <div className="text-xs text-dark-500 mb-2">📝 {example.description}</div>
                  <div className="text-xl mb-4">"{example.text}"</div>
                  
                  {/* Token 可视化 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tokenizeChinese(example.text).map((token, idx) => (
                      <div
                        key={idx}
                        className="group relative px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 hover:from-cyan-500/40 hover:to-blue-500/40 transition-all cursor-help"
                      >
                        <span className="font-mono text-sm">{token}</span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-dark-100 text-xs text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-dark-500">{isZh ? 'Token 数' : 'Tokens'}</div>
                      <div className="text-xl font-bold text-cyan-400">{tokenizeChinese(example.text).length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-dark-500">{isZh ? '字符数' : 'Chars'}</div>
                      <div className="text-xl font-bold">{example.text.replace(/[^\u4e00-\u9fa5]/g, '').length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-dark-500">{isZh ? '压缩比' : 'Compression'}</div>
                      <div className="text-xl font-bold text-green-400">
                        {(example.text.length / tokenizeChinese(example.text).length).toFixed(1)}x
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-dark-500">{isZh ? '费用(估算)' : 'Cost (est.)'}</div>
                      <div className="text-xl font-bold text-orange-400">
                        ${(tokenizeChinese(example.text).length * 0.0001).toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setGamePhase('intro')}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    ← {isZh ? '上一步' : 'Back'}
                  </button>
                  <button
                    onClick={() => setGamePhase('play')}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-all"
                  >
                    {isZh ? '自己试试 →' : 'Try It Yourself →'}
                  </button>
                </div>
              </div>
            )}

            {/* 自由输入 */}
            {gamePhase === 'play' && (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <label className="text-sm text-dark-400 block mb-2">
                    {isZh ? '输入文本' : 'Input Text'}
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={isZh ? '例如：今天我们学习人工智能' : 'e.g. Today we learn about AI'}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-lg focus:border-cyan-500/50 focus:outline-none resize-none"
                    rows={2}
                  />
                </div>

                {customText && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 mb-6">
                    {/* Token 可视化 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tokens.map((token, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/50"
                        >
                          <span className="font-mono text-sm">{token}</span>
                          <span className="ml-2 text-xs text-cyan-400">#{idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* 统计 */}
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <div className="text-dark-500">{isZh ? '✂️ Token 列表' : '✂️ Token List'}</div>
                        <div className="text-lg font-bold text-cyan-400">{stats.count}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <div className="text-dark-500">{isZh ? '原始文本' : 'Text'}</div>
                        <div className="text-lg font-bold">{customText.length}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <div className="text-dark-500">Ratio</div>
                        <div className="text-lg font-bold text-green-400">
                          {(customText.length / Math.max(1, stats.count)).toFixed(1)}x
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <div className="text-dark-500">{isZh ? '🔢 Token ID' : '🔢 Token ID'}</div>
                        <div className="text-lg font-bold">{stats.uniqueCount}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <div className="text-dark-500">{isZh ? '费用' : 'Cost'}</div>
                        <div className="text-lg font-bold text-orange-400">
                          ${(stats.count * 0.0001).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 知识卡片 */}
                <div className="p-5 rounded-xl bg-white/5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold">{isZh ? '💡 这就是 Tokenization！' : '💡 This is Tokenization!'}</h4>
                  </div>
                  <p className="text-sm text-dark-400 mb-2">
                    {isZh
                      ? '大模型通过 Tokenizer（分词器）把文字切成一小块一小块，然后把每个小块变成数字。数字才是模型能理解的东西。'
                      : 'LLMs use a tokenizer to slice text into small pieces, then convert each piece to a number. Numbers are what models understand.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setGamePhase('demo')}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                  >
                    ← {isZh ? '看例子' : 'See Examples'}
                  </button>
                  <button
                    onClick={() => {
                      complete()
                      setGamePhase('complete')
                    }}
                    disabled={!customText}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-30"
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
                <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">
                  {isZh ? 'Token 切割大师！' : 'Token Slicing Master!'}
                </h3>
                <p className="text-dark-400 mb-6">
                  {isZh
                    ? '你现在理解了：所有文字先被 Tokenizer 切成 Token，再变成数字嵌入向量（Embedding），然后才进入大模型处理。'
                    : 'Now you understand: all text is first tokenized by tokenizer, turned into embedding vectors, then processed by the LLM.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <div className="text-cyan-400 font-medium mb-2">🇨🇳 {isZh ? '中文' : 'Chinese'}</div>
                    <div className="text-sm text-dark-400">
                      {textIsZh ? '约 1-2 个字符 ≈ 1 token' : '~1-2 chars ≈ 1 token'}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="text-blue-400 font-medium mb-2">🇺🇸 English</div>
                    <div className="text-sm text-dark-400">
                      {textIsZh ? '约 4 个字符 ≈ 1 token' : '~4 chars ≈ 1 token'}
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
