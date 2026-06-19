import { useState, useMemo } from 'react'
import { ArrowRight, ArrowDown, Database, Search, Scissors, Brain, Layers, Download, Upload, Info, Sparkles, ChevronDown, ChevronRight, RefreshCw, Play, Pause, RotateCcw } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { useI18n } from '../i18n/context'

// 文档数据（中英文版本）
const docs = {
  zh: `人工智能（AI）是计算机科学的一个分支，旨在创造能够模拟人类智能的机器。

机器学习是AI的一个子集，它使计算机能够从数据中学习而不需要明确编程。深度学习是机器学习的一个分支，使用多层神经网络来处理复杂模式。

Transformer架构是现代大语言模型的基础，它使用自注意力机制来捕捉序列中的长距离依赖关系。BERT和GPT是基于Transformer的著名模型。

RAG（检索增强生成）结合了检索系统和生成模型，可以让AI基于外部知识库来回答问题，减少幻觉并提高答案的准确性。`,
  en: `Artificial Intelligence (AI) is a branch of computer science aimed at creating machines that can simulate human intelligence.

Machine learning is a subset of AI that enables computers to learn from data without explicit programming. Deep learning is a subset of machine learning that uses multiple layers of neural networks to process complex patterns.

The Transformer architecture is the foundation of modern large language models. It uses self-attention mechanisms to capture long-range dependencies in sequences. BERT and GPT are famous models based on Transformers.

RAG (Retrieval-Augmented Generation) combines retrieval systems with generative models, allowing AI to answer questions based on external knowledge bases, reducing hallucinations and improving answer accuracy.`
}

// 切割文档
function chunkDocument(text: string, chunkSize: number = 50, overlap: number = 10): string[] {
  const sentences = text.split(/[。！？.!?\n]+/).filter(s => s.trim())
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      const words = currentChunk.split(' ')
      currentChunk = words.slice(-Math.floor(overlap / 3)).join(' ') + ' ' + sentence
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim())
  return chunks
}

// 简化的向量化（用字符统计作为伪embedding）
function embed(text: string): number[] {
  const dim = 8
  const vec = new Array(dim).fill(0)
  const chars = text.toLowerCase()
  
  // 基于字符频率生成伪向量
  for (let i = 0; i < chars.length; i++) {
    vec[i % dim] += chars.charCodeAt(i) / (i + 1)
  }
  
  // 归一化
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
  return vec.map(v => norm > 0 ? v / norm : 0)
}

// 余弦相似度
function cosineSim(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0)
}

// 欧氏距离
function euclideanDist(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0))
}

// BM25 简化版
function bm25Score(query: string, doc: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const docWords = doc.toLowerCase().split(/\s+/)
  let score = 0
  const docLen = docWords.length
  const avgLen = 20
  const k1 = 1.5
  const b = 0.75
  
  for (const word of queryWords) {
    const tf = docWords.filter(w => w.includes(word)).length
    if (tf > 0) {
      const idf = Math.log((10 + 0.5) / (0.5 + 1))
      score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docLen / avgLen))
    }
  }
  return score
}

type TabId = 'store' | 'retrieve' | 'compare'

export default function RAGPage() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  
  const [activeTab, setActiveTab] = useState<TabId>('store')
  const [chunkSize, setChunkSize] = useState(50)
  const [overlap, setOverlap] = useState(10)
  const [chunks, setChunks] = useState<string[]>([])
  const [embeddings, setEmbeddings] = useState<Record<string, number[]>>({})
  const [query, setQuery] = useState('')
  const [queryVec, setQueryVec] = useState<number[] | null>(null)
  const [searchResults, setSearchResults] = useState<Array<{ chunk: string; cosine: number; euclidean: number; bm25: number }>>([])
  const [simulating, setSimulating] = useState(false)
  const [step, setStep] = useState(0)

  const sourceDoc = docs[lang]

  const doChunk = () => {
    const c = chunkDocument(sourceDoc, chunkSize, overlap)
    setChunks(c)
    // 计算每个chunk的embedding
    const emb: Record<string, number[]> = {}
    c.forEach((chunk, i) => { emb[`chunk_${i}`] = embed(chunk) })
    setEmbeddings(emb)
  }

  const doStore = () => {
    if (chunks.length === 0) doChunk()
    setSimulating(true)
    setStep(1)
    setTimeout(() => setStep(2), 500)
    setTimeout(() => setStep(3), 1000)
    setTimeout(() => setSimulating(false), 1500)
  }

  const doQuery = () => {
    if (!query.trim()) return
    setSimulating(true)
    setStep(0)
    
    setTimeout(() => {
      const qv = embed(query)
      setQueryVec(qv)
      setStep(1)
    }, 300)
    
    setTimeout(() => {
      const qv = embed(query)
      const results = chunks.map((chunk, i) => {
        const emb = embeddings[`chunk_${i}`] || embed(chunk)
        return {
          chunk,
          cosine: cosineSim(qv, emb),
          euclidean: euclideanDist(qv, emb),
          bm25: bm25Score(query, chunk)
        }
      })
      setSearchResults(results)
      setStep(2)
    }, 800)
    
    setTimeout(() => setSimulating(false), 1200)
  }

  const reset = () => {
    setChunks([])
    setEmbeddings({})
    setQuery('')
    setQueryVec(null)
    setSearchResults([])
    setStep(0)
  }

  const topByCosine = [...searchResults].sort((a, b) => b.cosine - a.cosine)
  const topByEuclidean = [...searchResults].sort((a, b) => a.euclidean - b.euclidean)
  const topByBm25 = [...searchResults].sort((a, b) => b.bm25 - a.bm25)

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative z-10 container-width">
            <h1 className="font-heading text-4xl font-bold mb-4 animate-slide-up">
              <span className="gradient-text">{isZh ? 'RAG 交互教程' : 'Interactive RAG Tutorial'}</span>
            </h1>
            <p className="text-lg text-dark-400 max-w-2xl animate-slide-up animation-delay-100">
              {isZh 
                ? '理解检索增强生成的核心：向量数据库、文档切割、混合检索'
                : 'Understanding RAG core: vector databases, document chunking, hybrid search'}
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="container-width px-4 mb-6">
          <div className="flex gap-2 border-b border-white/10">
            {[
              { id: 'store', label: isZh ? '📦 存储过程' : '📦 Storage', icon: Upload },
              { id: 'retrieve', label: isZh ? '🔍 检索过程' : '🔍 Retrieval', icon: Download },
              { id: 'compare', label: isZh ? '⚖️ 算法对比' : '⚖️ Algorithm Compare', icon: Database },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-dark-400 hover:text-dark-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="container-width px-4 pb-16">
          {/* ========== 存储过程 ========== */}
          {activeTab === 'store' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：文档切割 */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-orange-400" />
                      {isZh ? 'Step 1: 切割文档' : 'Step 1: Chunk Document'}
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-dark-500 mb-2">原始文档</div>
                    <div className="p-3 rounded-lg bg-white/5 text-sm text-dark-400 max-h-32 overflow-y-auto">
                      {sourceDoc.slice(0, 200)}...
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-dark-500 block mb-1">
                        {isZh ? '块大小 (字符)' : 'Chunk Size'}
                      </label>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={chunkSize}
                        onChange={e => setChunkSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-orange-400">{chunkSize}</div>
                    </div>
                    <div>
                      <label className="text-xs text-dark-500 block mb-1">
                        {isZh ? '重叠 (字符)' : 'Overlap'}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={overlap}
                        onChange={e => setOverlap(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-orange-400">{overlap}</div>
                    </div>
                  </div>

                  <button
                    onClick={doChunk}
                    className="w-full py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all text-sm"
                  >
                    {isZh ? '🔪 执行切割' : '🔪 Chunk It'}
                  </button>

                  {chunks.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-dark-500 mb-2">
                        {isZh ? `切割结果 (${chunks.length} 个块)` : `Result (${chunks.length} chunks)`}
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {chunks.map((chunk, i) => (
                          <div key={i} className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-orange-400 shrink-0">#{i + 1}</span>
                              <span className="text-sm text-dark-300">{chunk.slice(0, 60)}{chunk.length > 60 ? '...' : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* 右侧：向量化 */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      {isZh ? 'Step 2: 向量化 + 存储' : 'Step 2: Embed + Store'}
                    </h3>
                  </div>

                  <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="text-xs text-purple-400 mb-2">📐 {isZh ? '什么是向量？' : 'What is a Vector?'}</div>
                    <p className="text-xs text-dark-400 mb-2">
                      {isZh 
                        ? '每个文本块通过Embedding模型变成一串数字（向量）。语义相似的文本，向量也相近。'
                        : 'Each chunk becomes a string of numbers (vector) via Embedding model. Semantically similar texts have similar vectors.'}
                    </p>
                    <div className="font-mono text-xs text-purple-300">
                      [0.12, -0.34, 0.56, -0.78, 0.90, ...]
                    </div>
                  </div>

                  {chunks.length > 0 && (
                    <button
                      onClick={doStore}
                      disabled={simulating}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {simulating ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> {isZh ? '存储中...' : 'Storing...'}</>
                      ) : (
                        <><Upload className="w-4 h-4" /> {isZh ? '存入向量数据库' : 'Store to Vector DB'}</>
                      )}
                    </button>
                  )}

                  {step >= 2 && (
                    <div className="mt-4 animate-fade-in">
                      <div className="text-xs text-dark-500 mb-2">{isZh ? '向量数据库内容' : 'Vector DB Contents'}</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {chunks.map((chunk, i) => (
                          <div key={i} className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-purple-400 shrink-0">chunk_{i}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-xs text-purple-300 truncate">
                                  [{embeddings[`chunk_${i}`]?.map(v => v.toFixed(2)).join(', ')}...]
                                </div>
                                <div className="text-xs text-dark-500 mt-1">{chunk.slice(0, 40)}...</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step >= 3 && (
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 animate-fade-in">
                      <div className="text-sm text-green-400 flex items-center gap-2">
                        ✓ {isZh ? '存储完成！' : 'Storage Complete!'}
                      </div>
                      <div className="text-xs text-dark-400 mt-1">
                        {chunks.length} {isZh ? '个向量已存入数据库' : 'vectors stored'}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* 为什么切割 */}
              <Card className="mt-6">
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-yellow-400" />
                  {isZh ? '💡 为什么要切割文档？' : '💡 Why Chunk Documents?'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="text-yellow-400 font-medium mb-2">📏 {isZh ? '上下文长度限制' : 'Context Length Limit'}</div>
                    <p className="text-dark-400">
                      {isZh 
                        ? 'LLM 有最大上下文长度（如 4K、16K、128K tokens）。大文档必须切割才能放入。'
                        : 'LLMs have max context length. Large docs must be chunked to fit.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="text-blue-400 font-medium mb-2">🎯 {isZh ? '提高检索精度' : 'Better Retrieval Precision'}</div>
                    <p className="text-dark-400">
                      {isZh 
                        ? '小块更精确匹配查询。太长的块会引入噪声，降低相关性。'
                        : 'Smaller chunks = precise matches. Long chunks add noise, reduce relevance.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="text-green-400 font-medium mb-2">💰 {isZh ? '降低成本' : 'Reduce Cost'}</div>
                    <p className="text-dark-400">
                      {isZh 
                        ? '按用量付费。检索少量相关块比传输整个文档便宜得多。'
                        : 'Pay-per-use. Retrieving small relevant chunks is much cheaper than full doc.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ========== 检索过程 ========== */}
          {activeTab === 'retrieve' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 步骤1: 输入查询 */}
                <Card>
                  <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    {isZh ? '输入查询' : 'Enter Query'}
                  </h3>
                  
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={isZh ? '例如：什么是 Transformer？' : 'e.g. What is Transformer?'}
                    className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-dark-700 placeholder:text-dark-500 focus:outline-none focus:border-cyan-500 mb-4"
                  />

                  <button
                    onClick={doQuery}
                    disabled={!query.trim() || simulating || chunks.length === 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-30"
                  >
                    {simulating ? <RefreshCw className="w-4 h-4 animate-spin inline" /> : <Search className="w-4 h-4 inline" />}
                    {' '}{isZh ? '检索' : 'Search'}
                  </button>

                  {chunks.length === 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400">
                      ⚠️ {isZh ? '请先在"存储过程"标签页存入文档' : 'Please store docs in "Storage" tab first'}
                    </div>
                  )}

                  {queryVec && (
                    <div className="mt-4 animate-fade-in">
                      <div className="text-xs text-dark-500 mb-2">{isZh ? '查询向量' : 'Query Vector'}</div>
                      <div className="p-2 rounded-lg bg-cyan-500/10 font-mono text-xs text-cyan-300 truncate">
                        [{queryVec.map(v => v.toFixed(3)).join(', ')}]
                      </div>
                    </div>
                  )}
                </Card>

                {/* 步骤2: 检索结果 */}
                <Card className="lg:col-span-2">
                  <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-green-400" />
                    {isZh ? '检索结果 (余弦相似度)' : 'Results (Cosine Similarity)'}
                  </h3>

                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {topByCosine.slice(0, 5).map((result, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            idx === 0
                              ? 'bg-green-500/20 border-green-500/50'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                idx === 0 ? 'bg-green-500 text-white' : 'bg-white/20 text-dark-400'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className={`text-sm font-bold ${
                                idx === 0 ? 'text-green-400' : 'text-dark-400'
                              }`}>
                                {(result.cosine * 100).toFixed(1)}%
                              </span>
                            </div>
                            <span className="text-xs text-dark-500">
                              {result.chunk.length} chars
                            </span>
                          </div>
                          <p className="text-sm text-dark-300">{result.chunk}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-dark-500">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>{isZh ? '输入查询开始检索' : 'Enter a query to search'}</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* 完整流程图 */}
              <Card className="mt-6">
                <h3 className="font-heading text-lg font-semibold mb-4">
                  {isZh ? '🔄 完整检索流程' : '🔄 Full Retrieval Flow'}
                </h3>
                <div className="flex items-center justify-between gap-2 text-sm overflow-x-auto pb-2">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mb-2">
                      <span className="text-lg">❓</span>
                    </div>
                    <div className="text-center">
                      <div className="text-cyan-400 font-medium">1. {isZh ? '查询' : 'Query'}</div>
                      <div className="text-dark-500 text-xs">{isZh ? '用户输入问题' : 'User asks'}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-500 shrink-0" />
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-medium">2. {isZh ? '向量化' : 'Embed'}</div>
                      <div className="text-dark-500 text-xs">{isZh ? '转成向量' : 'To vector'}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-500 shrink-0" />
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center mb-2">
                      <Search className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-orange-400 font-medium">3. {isZh ? '相似度搜索' : 'Sim Search'}</div>
                      <div className="text-dark-500 text-xs">{isZh ? '找最近邻' : 'Find nearest'}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-500 shrink-0" />
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-2">
                      <Layers className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-medium">4. {isZh ? '返回块' : 'Return Chunks'}</div>
                      <div className="text-dark-500 text-xs">{isZh ? 'Top-K 结果' : 'Top-K results'}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-500 shrink-0" />
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-pink-400 font-medium">5. {isZh ? '增强+生成' : 'Augment+Gen'}</div>
                      <div className="text-dark-500 text-xs">{isZh ? '送入LLM' : 'To LLM'}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ========== 算法对比 ========== */}
          {activeTab === 'compare' && (
            <div className="animate-fade-in">
              {/* 距离算法对比 */}
              <Card className="mb-6">
                <h3 className="font-heading text-lg font-semibold mb-4">
                  {isZh ? '📐 余弦相似度 vs 欧氏距离 vs BM25' : '📐 Cosine vs Euclidean vs BM25'}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* 余弦相似度 */}
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                    <div className="text-violet-400 font-medium mb-2">📐 {isZh ? '余弦相似度' : 'Cosine Similarity'}</div>
                    <div className="text-xs font-mono text-dark-400 mb-3 mb-2">
                      cos(θ) = (A·B) / (|A||B|)
                    </div>
                    <div className="text-sm text-dark-400">
                      {isZh 
                        ? '衡量两个向量的方向是否相近。范围 [-1, 1]，越接近1越相似。'
                        : 'Measures direction similarity. Range [-1,1], closer to 1 = more similar.'}
                    </div>
                    <div className="mt-3 text-xs">
                      <span className="text-violet-400">{isZh ? '适合：' : 'Good for:'}</span>
                      <span className="text-dark-500"> {isZh ? '语义匹配、词向量' : 'Semantic matching, word vectors'}</span>
                    </div>
                  </div>

                  {/* 欧氏距离 */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="text-blue-400 font-medium mb-2">📏 {isZh ? '欧氏距离' : 'Euclidean Distance'}</div>
                    <div className="text-xs font-mono text-dark-400 mb-3">
                      d = √(Σ(Aᵢ - Bᵢ)²)
                    </div>
                    <div className="text-sm text-dark-400">
                      {isZh 
                        ? '衡量向量空间中的直线距离。值越小越接近。'
                        : 'Straight-line distance in vector space. Smaller = closer.'}
                    </div>
                    <div className="mt-3 text-xs">
                      <span className="text-blue-400">{isZh ? '适合：' : 'Good for:'}</span>
                      <span className="text-dark-500"> {isZh ? '图像向量、聚类' : 'Image vectors, clustering'}</span>
                    </div>
                  </div>

                  {/* BM25 */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-amber-400 font-medium mb-2">📝 BM25 ({isZh ? '稀疏检索' : 'Sparse Retrieval'})</div>
                    <div className="text-xs font-mono text-dark-400 mb-3">
                      score = IDF × tf/(tf + k₁(1-b+b·dl/avgdl))
                    </div>
                    <div className="text-sm text-dark-400">
                      {isZh 
                        ? '基于关键词频率的传统算法。不需要向量，适合精确词匹配。'
                        : 'Traditional keyword-based algorithm. No vectors needed, good for exact matches.'}
                    </div>
                    <div className="mt-3 text-xs">
                      <span className="text-amber-400">{isZh ? '适合：' : 'Good for:'}</span>
                      <span className="text-dark-500"> {isZh ? '专业术语、专有名词' : 'Technical terms, proper nouns'}</span>
                    </div>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div>
                    <div className="text-sm text-dark-400 mb-3">
                      {isZh ? '用当前查询演示三种算法的排序差异：' : 'Demonstrate ranking differences with current query:'}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-dark-500">#</th>
                            <th className="text-left py-2 px-3 text-violet-400">{isZh ? '余弦相似度' : 'Cosine'}</th>
                            <th className="text-left py-2 px-3 text-blue-400">{isZh ? '欧氏距离' : 'Euclidean'}</th>
                            <th className="text-left py-2 px-3 text-amber-400">BM25</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0, 1, 2].map(rank => (
                            <tr key={rank} className="border-b border-white/5">
                              <td className="py-2 px-3 text-dark-500">{rank + 1}</td>
                              <td className="py-2 px-3">
                                <span className={`${rank === 0 ? 'text-violet-400 font-bold' : 'text-dark-400'}`}>
                                  {topByCosine[rank]?.chunk.slice(0, 30)}...
                                </span>
                                <span className="ml-2 text-xs text-violet-400">
                                  ({(topByCosine[rank]?.cosine * 100).toFixed(1)}%)
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`${rank === 0 ? 'text-blue-400 font-bold' : 'text-dark-400'}`}>
                                  {topByEuclidean[rank]?.chunk.slice(0, 30)}...
                                </span>
                                <span className="ml-2 text-xs text-blue-400">
                                  ({topByEuclidean[rank]?.euclidean.toFixed(3)})
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`${rank === 0 ? 'text-amber-400 font-bold' : 'text-dark-400'}`}>
                                  {topByBm25[rank]?.chunk.slice(0, 30)}...
                                </span>
                                <span className="ml-2 text-xs text-amber-400">
                                  ({topByBm25[rank]?.bm25.toFixed(2)})
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>

              {/* 向量数据库 vs 普通数据库 */}
              <Card>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-red-400" />
                  {isZh ? '向量数据库 vs 普通数据库' : 'Vector DB vs Traditional DB'}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-dark-400">{isZh ? '对比项' : 'Aspect'}</th>
                        <th className="text-left py-3 px-4 text-red-400">{isZh ? '向量数据库' : 'Vector DB'}</th>
                        <th className="text-left py-3 px-4 text-gray-400">{isZh ? '普通关系数据库' : 'Relational DB'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-dark-300">
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-medium">{isZh ? '存储内容' : 'Stores'}</td>
                        <td className="py-3 px-4 text-red-300">{isZh ? '向量（高维浮点数）' : 'Vectors (high-dim floats)'}</td>
                        <td className="py-3 px-4 text-gray-400">{isZh ? '结构化数据（行列）' : 'Structured data (rows/cols)'}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-medium">{isZh ? '查询方式' : 'Query Method'}</td>
                        <td className="py-3 px-4 text-red-300">{isZh ? '相似度搜索（近邻查找）' : 'Similarity search (nearest neighbor)'}</td>
                        <td className="py-3 px-4 text-gray-400">{isZh ? '精确匹配（WHERE id=1）' : 'Exact match (WHERE id=1)'}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-medium">{isZh ? '查询速度' : 'Speed'}</td>
                        <td className="py-3 px-4 text-red-300">{isZh ? '百万/十亿级向量：毫秒级' : 'M/B vectors: millisecond'}</td>
                        <td className="py-3 px-4 text-gray-400">{isZh ? '千万级行：毫秒级' : '10M rows: millisecond'}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-medium">{isZh ? '索引方式' : 'Index'}</td>
                        <td className="py-3 px-4 text-red-300">{isZh ? 'HNSW、IVF、PQ压缩' : 'HNSW, IVF, PQ compression'}</td>
                        <td className="py-3 px-4 text-gray-400">{isZh ? 'B+树、哈希索引' : 'B+ tree, Hash index'}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-medium">{isZh ? '典型用途' : 'Use Cases'}</td>
                        <td className="py-3 px-4 text-red-300">{isZh ? 'RAG、推荐系统、人脸识别' : 'RAG, recommender, face search'}</td>
                        <td className="py-3 px-4 text-gray-400">{isZh ? '用户管理、订单系统、事务' : 'Users, orders, transactions'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">{isZh ? '代表产品' : 'Products'}</td>
                        <td className="py-3 px-4 text-red-300">Pinecone, Milvus, Weaviate, FAISS</td>
                        <td className="py-3 px-4 text-gray-400">PostgreSQL, MySQL, MongoDB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
