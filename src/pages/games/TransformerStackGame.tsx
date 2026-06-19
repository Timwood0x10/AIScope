import { useState, useMemo } from 'react'
import { ArrowLeft, Lightbulb, RotateCcw, ChevronRight, Layers, Zap, Brain, Eye, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 模拟每一层的注意力变化
interface LayerState {
  nameZh: string
  nameEn: string
  attentionPatterns: number[][]
  understanding: number  // 0-100
  descriptionZh: string
  descriptionEn: string
}

// 句子分析
interface SentenceAnalysis {
  text: string
  layers: LayerState[]
  finalUnderstandingZh: string
  finalUnderstandingEn: string
}

const sentences = [
  {
    text: 'The cat sat on the mat',
    layers: [
      { nameZh: 'Layer 1: 词汇', nameEn: 'Layer 1: Vocabulary', attentionPatterns: [[1, 0.3, 0.1, 0.1], [0.2, 1, 0.4, 0.2], [0.1, 0.3, 1, 0.5], [0.1, 0.2, 0.4, 1]], understanding: 30, descriptionZh: '学习单词：cat, sat, mat 的基本含义', descriptionEn: 'Learn words: basic meaning of cat, sat, mat' },
      { nameZh: 'Layer 2: 语法', nameEn: 'Layer 2: Grammar', attentionPatterns: [[1, 0.4, 0.2, 0.2], [0.3, 1, 0.6, 0.3], [0.2, 0.5, 1, 0.6], [0.2, 0.3, 0.5, 1]], understanding: 50, descriptionZh: '学习语法：The + cat + sat + on + the + mat', descriptionEn: 'Learn grammar: The + cat + sat + on + the + mat' },
      { nameZh: 'Layer 3: 语义', nameEn: 'Layer 3: Semantics', attentionPatterns: [[1, 0.5, 0.3, 0.3], [0.6, 1, 0.4, 0.4], [0.3, 0.5, 1, 0.7], [0.3, 0.4, 0.6, 1]], understanding: 70, descriptionZh: '理解语义：cat 在 mat 上坐着', descriptionEn: 'Understand semantics: cat sitting on mat' },
      { nameZh: 'Layer 4: 推理', nameEn: 'Layer 4: Reasoning', attentionPatterns: [[1, 0.6, 0.4, 0.4], [0.7, 1, 0.5, 0.5], [0.4, 0.6, 1, 0.8], [0.4, 0.5, 0.7, 1]], understanding: 90, descriptionZh: '深层推理：这是一个完整的场景描述', descriptionEn: 'Deep reasoning: this is a complete scene description' },
    ],
    finalUnderstandingZh: '一只猫坐在垫子上 🐱',
    finalUnderstandingEn: 'A cat sitting on a mat 🐱'
  },
  {
    text: 'GPT stands for Generative Pre-trained Transformer',
    layers: [
      { nameZh: 'Layer 1: 词汇', nameEn: 'Layer 1: Vocabulary', attentionPatterns: [[1, 0.2, 0.1, 0.1, 0.1, 0.1], [0.2, 1, 0.3, 0.1, 0.1, 0.1], [0.1, 0.3, 1, 0.2, 0.2, 0.1], [0.1, 0.1, 0.2, 1, 0.3, 0.2], [0.1, 0.1, 0.2, 0.3, 1, 0.3], [0.1, 0.1, 0.1, 0.2, 0.3, 1]], understanding: 30, descriptionZh: '识别缩写和单词', descriptionEn: 'Recognize abbreviations and words' },
      { nameZh: 'Layer 2: 展开', nameEn: 'Layer 2: Expansion', attentionPatterns: [[1, 0.5, 0.3, 0.3, 0.2, 0.2], [0.6, 1, 0.4, 0.3, 0.2, 0.2], [0.4, 0.5, 1, 0.5, 0.4, 0.3], [0.4, 0.4, 0.6, 1, 0.5, 0.4], [0.3, 0.3, 0.5, 0.6, 1, 0.5], [0.3, 0.3, 0.4, 0.5, 0.6, 1]], understanding: 50, descriptionZh: 'GPT = Generative Pre-trained Transformer', descriptionEn: 'GPT = Generative Pre-trained Transformer' },
      { nameZh: 'Layer 3: 关系', nameEn: 'Layer 3: Relation', attentionPatterns: [[1, 0.6, 0.5, 0.5, 0.4, 0.4], [0.7, 1, 0.6, 0.5, 0.4, 0.4], [0.6, 0.7, 1, 0.7, 0.6, 0.5], [0.6, 0.6, 0.8, 1, 0.7, 0.6], [0.5, 0.5, 0.7, 0.8, 1, 0.7], [0.5, 0.5, 0.6, 0.7, 0.8, 1]], understanding: 70, descriptionZh: '理解各部分之间的关系', descriptionEn: 'Understand relations between parts' },
      { nameZh: 'Layer 4: 整体', nameEn: 'Layer 4: Holistic', attentionPatterns: [[1, 0.8, 0.7, 0.7, 0.6, 0.6], [0.9, 1, 0.8, 0.7, 0.6, 0.6], [0.8, 0.9, 1, 0.9, 0.8, 0.7], [0.8, 0.8, 0.9, 1, 0.8, 0.7], [0.7, 0.7, 0.9, 0.9, 1, 0.8], [0.7, 0.7, 0.8, 0.8, 0.9, 1]], understanding: 95, descriptionZh: '完全理解：GPT 是一个生成式预训练变换器模型', descriptionEn: 'Full understanding: GPT is a generative pre-trained transformer model' },
    ],
    finalUnderstandingZh: 'GPT 是一个 AI 模型的名字 🤖',
    finalUnderstandingEn: 'GPT is a name for an AI model 🤖'
  },
  {
    text: 'Deep learning has revolutionized computer vision',
    layers: [
      { nameZh: 'Layer 1', nameEn: 'Layer 1', attentionPatterns: [[1, 0.2, 0.3, 0.1, 0.2], [0.2, 1, 0.2, 0.3, 0.2], [0.3, 0.2, 1, 0.2, 0.3], [0.1, 0.3, 0.2, 1, 0.2], [0.2, 0.2, 0.3, 0.2, 1]], understanding: 30, descriptionZh: '识别关键词：Deep, learning, computer, vision', descriptionEn: 'Recognize keywords: Deep, learning, computer, vision' },
      { nameZh: 'Layer 2', nameEn: 'Layer 2', attentionPatterns: [[1, 0.5, 0.4, 0.3, 0.4], [0.6, 1, 0.5, 0.4, 0.5], [0.5, 0.6, 1, 0.5, 0.6], [0.4, 0.5, 0.6, 1, 0.5], [0.5, 0.6, 0.7, 0.6, 1]], understanding: 55, descriptionZh: '理解技术术语：深度学习，计算机视觉', descriptionEn: 'Understand technical terms: deep learning, computer vision' },
      { nameZh: 'Layer 3', nameEn: 'Layer 3', attentionPatterns: [[1, 0.7, 0.6, 0.5, 0.6], [0.8, 1, 0.7, 0.6, 0.7], [0.7, 0.8, 1, 0.7, 0.8], [0.6, 0.7, 0.8, 1, 0.7], [0.7, 0.8, 0.9, 0.8, 1]], understanding: 80, descriptionZh: '理解关系：深度学习革新了计算机视觉', descriptionEn: 'Understand relationships: deep learning revolutionized computer vision' },
      { nameZh: 'Layer 4', nameEn: 'Layer 4', attentionPatterns: [[1, 0.9, 0.8, 0.7, 0.8], [0.9, 1, 0.9, 0.8, 0.9], [0.9, 0.9, 1, 0.9, 0.9], [0.8, 0.9, 0.9, 1, 0.9], [0.9, 0.9, 0.9, 0.9, 1]], understanding: 98, descriptionZh: '完全理解 AI 如何改变图像识别领域 🚀', descriptionEn: 'Full understanding of how AI changes the field of image recognition 🚀' },
    ],
    finalUnderstandingZh: '深度学习彻底改变了计算机视觉领域 📷',
    finalUnderstandingEn: 'Deep learning revolutionized computer vision 📷'
  }
]

function AttentionHeatmap({ patterns, size = 120 }: { patterns: number[][], size?: number }) {
  const maxVal = Math.max(...patterns.flat())
  
  return (
    <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${patterns.length}, ${size/patterns.length}px)` }}>
      {patterns.map((row, i) =>
        row.map((val, j) => (
          <div
            key={`${i}-${j}`}
            className="rounded-sm transition-all hover:scale-110"
            style={{
              width: size / patterns.length,
              height: size / patterns.length,
              backgroundColor: `rgba(139, 92, 246, ${val / maxVal * 0.8 + 0.1})`,
            }}
            title={`${val.toFixed(2)}`}
          />
        ))
      )}
    </div>
  )
}

export default function TransformerStackGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [currentLayer, setCurrentLayer] = useState(0)
  const [gamePhase, setGamePhase] = useState<'intro' | 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'complete'>('intro')
  const [autoPlay, setAutoPlay] = useState(false)

  const sentence = sentences[sentenceIdx]
  const layers = sentence.layers

  // 自动播放效果
  const handleNextLayer = () => {
    if (currentLayer < layers.length - 1) {
      setCurrentLayer(prev => prev + 1)
    } else {
      setGamePhase('complete')
    }
  }

  const goToLayer = (idx: number) => {
    setCurrentLayer(idx)
  }

  const nextSentence = () => {
    if (sentenceIdx < sentences.length - 1) {
      setSentenceIdx(prev => prev + 1)
      setCurrentLayer(0)
      setGamePhase('layer1')
    } else {
      setGamePhase('complete')
    }
  }

  const reset = () => {
    setSentenceIdx(0)
    setCurrentLayer(0)
    setGamePhase('intro')
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.transformerStack = { completed: true, score: 100 }
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
                <div className="text-5xl mb-3">🏗️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? 'Transformer 堆叠' : 'Transformer Stacking'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '看看堆叠层数如何让理解越来越深' : 'See how stacking layers deepens understanding'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? `第 ${sentenceIdx + 1}/${sentences.length} 句` : `Sentence ${sentenceIdx + 1}/${sentences.length}`}</div>
                <div className="text-lg font-bold text-primary">Layer {currentLayer + 1}/{layers.length}</div>
              </div>
            </div>

            {/* 介绍 */}
            {gamePhase === 'intro' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-heading text-lg font-semibold text-yellow-400">{isZh ? '每层都在做什么？' : 'What does each layer do?'}</h3>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh ? '真实的 GPT 有 12 层、24 层、甚至 96 层！每一层都在"消化"输入，理解更深一层的含义。就像我们学习一个新概念：先看表面 → 理解细节 → 领悟本质。' : 'Real GPT has 12, 24, or even 96 layers! Each layer "digests" the input, understanding deeper meaning. Like learning a new concept: surface → details → essence.'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <div className="text-2xl mb-1">📝</div>
                      <div className="text-amber-400 font-medium text-sm">Layer 1</div>
                      <div className="text-xs text-dark-500">{isZh ? '词汇级别' : 'Vocabulary level'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
                      <div className="text-2xl mb-1">🔗</div>
                      <div className="text-orange-400 font-medium text-sm">Layer 2</div>
                      <div className="text-xs text-dark-500">{isZh ? '语法结构' : 'Grammar structure'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                      <div className="text-2xl mb-1">💡</div>
                      <div className="text-red-400 font-medium text-sm">Layer 3</div>
                      <div className="text-xs text-dark-500">{isZh ? '语义理解' : 'Semantic understanding'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center">
                      <div className="text-2xl mb-1">🧠</div>
                      <div className="text-pink-400 font-medium text-sm">Layer 4</div>
                      <div className="text-xs text-dark-500">{isZh ? '深层推理' : 'Deep reasoning'}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setGamePhase('layer1')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  {isZh ? '开始演示 →' : 'Start Demo →'}
                </button>
              </div>
            )}

            {/* 句子展示 */}
            <div className="mb-6 p-4 rounded-xl bg-white/5">
              <div className="text-sm text-dark-500 mb-2">{isZh ? '当前句子：' : 'Current Sentence:'}</div>
              <div className="text-xl font-medium">"{sentence.text}"</div>
            </div>

            {/* 层选择器 */}
            {(gamePhase === 'layer1' || gamePhase === 'layer2' || gamePhase === 'layer3' || gamePhase === 'layer4') && (
              <div className="animate-fade-in">
                <div className="flex gap-2 mb-6">
                  {layers.map((layer, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToLayer(idx)}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        idx === currentLayer
                          ? 'border-amber-500 bg-amber-500/20'
                          : idx < currentLayer
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-transparent bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm font-medium">Layer {idx + 1}</div>
                      <div className="text-xs text-dark-500">{idx === 0 ? (isZh ? '词汇' : 'Vocabulary') : idx === 1 ? (isZh ? '语法' : 'Grammar') : idx === 2 ? (isZh ? '语义' : 'Semantics') : (isZh ? '推理' : 'Reasoning')}</div>
                      {idx < currentLayer && <div className="text-xs text-green-400 mt-1">✓</div>}
                    </button>
                  ))}
                </div>

                {/* 当前层详情 */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-xl font-bold mb-1">{isZh ? layers[currentLayer].nameZh : layers[currentLayer].nameEn}</h3>
                      <p className="text-dark-400 text-sm">{isZh ? layers[currentLayer].descriptionZh : layers[currentLayer].descriptionEn}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-dark-500">{isZh ? '理解度' : 'Understanding'}</div>
                      <div className="text-2xl font-bold text-amber-400">{layers[currentLayer].understanding}%</div>
                    </div>
                  </div>

                  {/* 理解度进度条 */}
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${layers[currentLayer].understanding}%` }}
                    />
                  </div>

                  {/* 注意力热力图 */}
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xs text-dark-500 mb-2">{isZh ? '注意力模式' : 'Attention patterns'}</div>
                      <AttentionHeatmap patterns={layers[currentLayer].attentionPatterns} size={140} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-dark-500 mb-2">{isZh ? 'Attention 说明' : 'Attention explanation'}</div>
                      <p className="text-sm text-dark-400">
                        {isZh ? '每一格的颜色深浅表示两个词之间的"关注度"。颜色越深 = 模型认为这两个词越相关。' : 'Each cell color intensity represents "attention" between two words. Darker color = the model thinks those two words are more related.'}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-violet-500/90"></div>
                          <span className="text-dark-500">{isZh ? '强关联' : 'Strong'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-violet-500/20"></div>
                          <span className="text-dark-500">{isZh ? '弱关联' : 'Weak'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex gap-3">
                  {currentLayer > 0 && (
                    <button
                      onClick={() => goToLayer(currentLayer - 1)}
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all"
                    >
                      ← {isZh ? '上一层' : 'Prev'}
                    </button>
                  )}
                  {currentLayer < layers.length - 1 ? (
                    <button
                      onClick={handleNextLayer}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {isZh ? '下一层' : 'Next layer'} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={nextSentence}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all"
                    >
                      {sentenceIdx < sentences.length - 1 ? (isZh ? '下一句 →' : 'Next Sentence →') : (isZh ? '完成！🎉' : 'Done! 🎉')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 完成 */}
            {gamePhase === 'complete' && (
              <div className="animate-fade-in">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="font-heading text-2xl font-bold text-green-400 mb-2">{isZh ? 'Transformer 大师！' : 'Transformer Master!'}</h3>
                  <p className="text-dark-400">
                    {isZh ? '现在你看到了：Transformer 的每一层都会提取更抽象、更深入的信息。' : 'Now you see: each Transformer layer extracts more abstract and deeper information.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-amber-400 font-medium mb-2">{isZh ? '📊 为什么需要多层？' : '📊 Why multiple layers?'}</div>
                    <div className="text-sm text-dark-400">
                      {isZh ? '每层只负责简单的模式识别。多层堆叠后，复杂模式自然涌现（Emergent Behavior）。' : 'Each layer handles simple pattern recognition. With multiple layers stacked, complex patterns emerge naturally.'}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="text-green-400 font-medium mb-2">{isZh ? '🚀 GPT-3 有多少层？' : '🚀 How many layers does GPT-3 have?'}</div>
                    <div className="text-sm text-dark-400">
                      {isZh ? 'GPT-3 有 96 层！每层 12288 维注意力。这就是为什么它能理解如此复杂的内容。' : 'GPT-3 has 96 layers! Each with 12288-dimensional attention. That is why it can understand such complex content.'}
                    </div>
                  </div>
                </div>

                {/* 层级示意 */}
                <div className="p-4 rounded-xl bg-white/5 mb-6">
                  <div className="text-sm text-dark-400 mb-3 text-center">{isZh ? '层数对比' : 'Layer comparison'}</div>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="h-8 w-20 bg-amber-500/50 rounded mb-2"></div>
                      <div className="text-xs text-dark-500">{isZh ? '1 层' : '1 layer'}</div>
                      <div className="text-xs text-amber-400">{isZh ? '词' : 'Words'}</div>
                    </div>
                    <div className="text-center">
                      <div className="h-24 w-20 bg-orange-500/50 rounded mb-2"></div>
                      <div className="text-xs text-dark-500">{isZh ? '4 层' : '4 layers'}</div>
                      <div className="text-xs text-orange-400">{isZh ? '短语' : 'Phrases'}</div>
                    </div>
                    <div className="text-center">
                      <div className="h-40 w-20 bg-red-500/50 rounded mb-2"></div>
                      <div className="text-xs text-dark-500">{isZh ? '12 层' : '12 layers'}</div>
                      <div className="text-xs text-red-400">{isZh ? '句子' : 'Sentences'}</div>
                    </div>
                    <div className="text-center">
                      <div className="h-64 w-20 bg-pink-500/50 rounded mb-2"></div>
                      <div className="text-xs text-dark-500">{isZh ? '96 层' : '96 layers'}</div>
                      <div className="text-xs text-pink-400">{isZh ? '篇章' : 'Discourse'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
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
    </Layout>
  )
}
