import { useState } from 'react'
import { Info, Brain, Layers, Grid3X3, Calculator, Clock, Eye, Zap, BookOpen, GitBranch, ChevronRight, ArrowRight } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { useI18n } from '../i18n/context'
import { attentionTopics, attentionMultiAngle, attentionQuizzes, attentionContent } from '../i18n/attention'

import AttentionHeatmap from '../components/charts/AttentionHeatmap'
import TokenizerVisualizer from '../components/charts/TokenizerVisualizer'
import SoftmaxVisualizer from '../components/charts/SoftmaxVisualizer'
import QKVProjectionVisualizer from '../components/charts/QKVProjectionVisualizer'
import CausalMaskVisualizer from '../components/charts/CausalMaskVisualizer'
import MultiHeadVisualizer from '../components/charts/MultiHeadVisualizer'
import ResidualVisualizer from '../components/charts/ResidualVisualizer'
import LayerNormVisualizer from '../components/charts/LayerNormVisualizer'
import FFNVisualizer from '../components/charts/FFNVisualizer'
import RoPEVisualizer from '../components/charts/RoPEVisualizer'
import MultiAngle from '../components/ui/MultiAngle'
import ConceptQuiz from '../components/ui/ConceptQuiz'

const iconMap: Record<string, any> = {
  Calculator,
  Layers,
  GitBranch,
  Grid3X3,
  ChevronRight,
  Clock,
  Zap,
  Brain,
  BookOpen,
  Eye,
}

const iconMap2: Record<string, any> = {
  Calculator,
  Layers,
  GitBranch,
  Clock,
  Zap,
  Brain,
  ArrowRight,
}

interface PipelineStage {
  id: string
  nameZh: string
  nameEn: string
  descZh: string
  descEn: string
  icon: any
  color: string
  Component: React.ComponentType<any>
  defaultProps: Record<string, any>
}

const pipelineStages: PipelineStage[] = [
  {
    id: 'token',
    nameZh: '分词',
    nameEn: 'Tokenization',
    descZh: '将文本切分为 token',
    descEn: 'Split text into tokens',
    icon: Grid3X3,
    color: 'from-blue-500 to-blue-700',
    Component: TokenizerVisualizer,
    defaultProps: {},
  },
  {
    id: 'rope',
    nameZh: 'RoPE 位置编码',
    nameEn: 'RoPE Positional',
    descZh: '旋转向量编码位置',
    descEn: 'Rotate vectors for position',
    icon: Clock,
    color: 'from-cyan-500 to-cyan-700',
    Component: RoPEVisualizer,
    defaultProps: {},
  },
  {
    id: 'qkv',
    nameZh: 'Q/K/V 投影',
    nameEn: 'Q/K/V Projection',
    descZh: '三线性变换生成 Q/K/V',
    descEn: 'Three linear transforms',
    icon: Layers,
    color: 'from-indigo-500 to-indigo-700',
    Component: QKVProjectionVisualizer,
    defaultProps: {},
  },
  {
    id: 'causal',
    nameZh: '因果掩码',
    nameEn: 'Causal Mask',
    descZh: '防止偷看未来 token',
    descEn: 'Prevent looking ahead',
    icon: Clock,
    color: 'from-amber-500 to-amber-700',
    Component: CausalMaskVisualizer,
    defaultProps: {},
  },
  {
    id: 'softmax',
    nameZh: 'Softmax 归一化',
    nameEn: 'Softmax',
    descZh: '将分数转为概率分布',
    descEn: 'Normalize to probabilities',
    icon: Calculator,
    color: 'from-emerald-500 to-emerald-700',
    Component: SoftmaxVisualizer,
    defaultProps: {},
  },
  {
    id: 'attention',
    nameZh: '注意力热力图',
    nameEn: 'Attention Heatmap',
    descZh: '可视化注意力权重',
    descEn: 'Visualize attention weights',
    icon: Eye,
    color: 'from-blue-500 to-blue-700',
    Component: AttentionHeatmap,
    defaultProps: { seqLength: 4, headDim: 64, scaleFactor: 0.125 },
  },
  {
    id: 'multihead',
    nameZh: '多头注意力',
    nameEn: 'Multi-Head',
    descZh: '并行多个注意力头',
    descEn: 'Multiple parallel heads',
    icon: GitBranch,
    color: 'from-purple-500 to-purple-700',
    Component: MultiHeadVisualizer,
    defaultProps: {},
  },
  {
    id: 'residual',
    nameZh: '残差连接',
    nameEn: 'Residual Connection',
    descZh: '跳过子层的恒等路径',
    descEn: 'Identity path around sublayers',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-700',
    Component: ResidualVisualizer,
    defaultProps: {},
  },
  {
    id: 'layernorm',
    nameZh: 'LayerNorm',
    nameEn: 'LayerNorm',
    descZh: '归一化到零均值单位方差',
    descEn: 'Normalize per sample',
    icon: Calculator,
    color: 'from-teal-500 to-teal-700',
    Component: LayerNormVisualizer,
    defaultProps: {},
  },
  {
    id: 'ffn',
    nameZh: '前馈网络',
    nameEn: 'Feed-Forward',
    descZh: '两层 MLP + 非线性',
    descEn: 'Two-layer MLP with GELU',
    icon: Layers,
    color: 'from-pink-500 to-pink-700',
    Component: FFNVisualizer,
    defaultProps: {},
  },
]

export default function AttentionPage() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [selectedTopic, setSelectedTopic] = useState('math')
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'interactive'>('learn')
  const [activeStage, setActiveStage] = useState('token')

  const t = attentionContent[lang]
  const topics = attentionTopics[lang]
  const quizzes = attentionQuizzes[lang]
  const multiAngleData = attentionMultiAngle[lang]

  const renderTopicContent = () => {
    const topicsContent: Record<string, React.ReactNode> = {
      math: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">📐</span>
              {isZh ? '数学原理详解' : 'Mathematical Principles'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">1. Q/K/V {isZh ? '矩阵' : 'Matrices'}</h4>
                <p className="text-dark-400 mb-3">
                  {isZh ? '输入序列通过三个独立的线性变换得到 Query、Key、Value：' : 'Input sequence goes through three independent linear transformations to get Query, Key, Value:'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="font-mono text-primary mb-2">Q = XW_Q</div>
                    <p className="text-sm text-dark-400">{isZh ? 'Query：我正在寻找什么？' : 'Query: What am I looking for?'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="font-mono text-purple-400 mb-2">K = XW_K</div>
                    <p className="text-sm text-dark-400">{isZh ? 'Key：我包含什么信息？' : 'Key: What information do I contain?'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="font-mono text-green-400 mb-2">V = XW_V</div>
                    <p className="text-sm text-dark-400">{isZh ? 'Value：实际的内容表示' : 'Value: The actual content representation'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">2. {isZh ? '注意力分数计算' : 'Attention Score Calculation'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '通过点积计算 Query 和 Key 的相似度：' : 'Compute similarity between Query and Key via dot product:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">score(i, j) = Q_i · K_j^T</div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">3. {isZh ? '缩放因子' : 'Scale Factor'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '除以 √d_k 可以稳定 softmax 的梯度：' : 'Dividing by √d_k stabilizes softmax gradients:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">scaled_score = score / √d_k</div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">4. Softmax {isZh ? '归一化' : 'Normalization'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '对缩放后的分数应用 softmax，得到注意力权重：' : 'Apply softmax to scaled scores to get attention weights:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">attention_weights = softmax(scaled_scores)</div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">5. {isZh ? '加权求和' : 'Weighted Sum'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '用注意力权重对 Value 加权求和：' : 'Weighted sum of Values using attention weights:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">output_i = Σ_j attention_weight(i,j) × V_j</div>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="font-heading text-xl font-bold mb-4">{t.complexityTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-sm text-dark-400 mb-1">{t.timeComplexity}</div>
                <code className="text-xl font-mono text-primary">O(L² · d)</code>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-sm text-dark-400 mb-1">{t.spaceComplexity}</div>
                <code className="text-xl font-mono text-secondary">O(L²)</code>
              </div>
            </div>
          </Card>
        </div>
      ),
      multihead: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🎭</span>
              {isZh ? '多头注意力 (Multi-Head Attention)' : 'Multi-Head Attention'}
            </h3>
            <p className="text-dark-400 mb-6">{isZh ? '多个注意力头并行工作，每个头学习不同的注意力模式，然后拼接输出。' : 'Multiple attention heads work in parallel, each learning different attention patterns, then concatenated.'}</p>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '核心思想' : 'Core Idea'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '不同的注意力头可以关注不同的特征关系：' : 'Different attention heads can attend to different feature relationships:'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '数学公式' : 'Mathematical Formula'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W_O</div>
                <p className="text-sm text-dark-500 mt-2 text-center">{isZh ? '其中' : 'where'} head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)</p>
              </div>
            </div>
          </Card>
        </div>
      ),
      residual: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              {isZh ? '残差连接 (Residual Connection)' : 'Residual Connection'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '核心公式' : 'Core Formula'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">output = F(x) + x</div>
              </div>
            </div>
          </Card>
        </div>
      ),
      encoder: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🏗️</span>
              {isZh ? '编码器 (Encoder)' : 'Encoder'}
            </h3>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="space-y-2 font-mono text-sm">
              <div className="p-3 rounded bg-blue-500/20 text-center">x₀ = Input Embeddings + Positional Encoding</div>
              <div className="text-center text-dark-500">↓</div>
              <div className="p-3 rounded bg-purple-500/20 text-center">x₁ = LayerNorm(x₀ + MultiHead(x₀))</div>
              <div className="text-center text-dark-500">↓</div>
              <div className="p-3 rounded bg-green-500/20 text-center">x₂ = LayerNorm(x₁ + FFN(x₁))</div>
              </div>
            </div>
          </Card>
        </div>
      ),
      decoder: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">📤</span>
              {isZh ? '解码器 (Decoder)' : 'Decoder'}
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="space-y-2 font-mono text-sm">
                <div className="p-3 rounded bg-blue-500/20 text-center">Masked Multi-Head Self-Attention (Causal)</div>
                <div className="text-center text-dark-500">↓</div>
                <div className="p-3 rounded bg-purple-500/20 text-center">Multi-Head Cross-Attention</div>
                <div className="text-center text-dark-500">↓</div>
                <div className="p-3 rounded bg-green-500/20 text-center">Feed-Forward Network</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
      causal: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">⏱️</span>
              {isZh ? '因果掩码 (Causal Mask)' : 'Causal Mask'}
            </h3>
            <p className="text-dark-400 mb-6">{isZh ? '解码器在生成第 i 个 token 时，不能看到位置 i+1, i+2, ... 的信息。' : 'When generating token i, the decoder cannot see positions i+1, i+2, ...'}</p>
            <div className="p-4 rounded-xl bg-white/5 font-mono text-sm">attention_scores = attention_scores.masked_fill(torch.triu(torch.ones(L, L), diagonal=1).bool(), float('-inf'))</div>
          </Card>
        </div>
      ),
      rope: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🌀</span>
              {isZh ? 'RoPE 旋转位置编码' : 'RoPE (Rotary Position Embedding)'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '核心思想' : 'Core Idea'}</h4>
                <p className="text-dark-400">{isZh ? 'RoPE 不使用加性位置编码，而是通过旋转 Query 和 Key 向量来融入位置信息。' : 'RoPE rotates Query and Key vectors to incorporate positional information.'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                R(θ, m) · [q_a, q_b]^T = [q_a cos(mθ) - q_b sin(mθ), q_a sin(mθ) + q_b cos(mθ)]</div>
            </div>
          </Card>
        </div>
      ),
      advanced: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🔬</span>
              {isZh ? '进阶视角' : 'Advanced Perspectives'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5"><div className="font-medium text-primary">Flash Attention</div></div>
              <div className="p-4 rounded-xl bg-white/5"><div className="font-medium text-secondary">Sparse Attention</div></div>
              <div className="p-4 rounded-xl bg-white/5"><div className="font-medium text-accent">Linear Attention</div></div>
            </div>
          </Card>
        </div>
      ),
      token: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">✂️</span>
              {isZh ? '分词算法 (Tokenization)' : 'Tokenization'}
            </h3>
            <p className="text-dark-400 mb-3">{isZh ? 'BPE / WordPiece / Unigram 等算法逐步构建子词词汇表。' : 'BPE / WordPiece / Unigram algorithms build subword vocabularies step by step.'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5"><div className="font-medium mb-2">BPE</div><p className="text-sm text-dark-400">{isZh ? '贪心合并最高频字符对' : 'Greedy merging of most frequent pairs'}</p></div>
              <div className="p-4 rounded-xl bg-white/5"><div className="font-medium mb-2">WordPiece</div><p className="text-sm text-dark-400">{isZh ? '基于最大似然选择合并' : 'Max-likelihood based merging'}</p></div>
            </div>
          </Card>
        </div>
      ),
      training: (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              {isZh ? '训练核心技巧' : 'Core Training Techniques'}
            </h3>
            <div className="space-y-4">
              <div><h4 className="font-semibold text-lg mb-2">{isZh ? '权重初始化' : 'Weight Initialization'}</h4><div className="p-3 rounded-xl bg-white/5 font-mono text-sm">W ~ N(0, √(2/d_model))</div></div>
              <div><h4 className="font-semibold text-lg mb-2">{isZh ? '学习率调度 + 正则化' : 'LR Schedule + Regularization'}</h4><p className="text-dark-400 text-sm">{isZh ? 'Warmup → Cosine decay。Dropout + Weight Decay。' : 'Warmup → Cosine decay with Dropout and Weight Decay'}</p></div>
            </div>
          </Card>
        </div>
      ),
    }

    return topicsContent[selectedTopic]
  }

  const currentStage = pipelineStages.find(s => s.id === activeStage) || pipelineStages[0]
  const ActiveComponent = currentStage.Component

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 container-width">
            <div className="max-w-3xl">
              <h1 className="font-heading text-5xl font-bold mb-4 animate-slide-up">
                <span className="gradient-text">{t.heroTitle}</span>
              </h1>
              <p className="text-lg text-dark-400 mb-6 animate-slide-up animation-delay-100">
                {t.heroDesc}
              </p>
              <div className="glass-card p-6 animate-slide-up animation-delay-200">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold mb-2">{t.coreFormula}</h3>
                    <code className="font-mono text-lg bg-dark/50 px-4 py-2 rounded-lg block">Attention(Q, K, V) = softmax(QK^T / √d_k) V</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 -mt-4 relative z-10">
          <div className="container-width">
            <div className="flex flex-wrap gap-2 justify-center">
              {topics.map((topic) => {
                const Icon = iconMap[topic.iconName]
                const isSelected = selectedTopic === topic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isSelected ? `bg-gradient-to-r ${topic.color} text-white shadow-lg` : 'bg-white/10 hover:bg-white/20 text-dark-400'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {topic.name}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pt-8">
          <div className="container-width">
            <div className="flex gap-2 mb-8">
              {[
                { id: 'learn', label: t.learn, icon: BookOpen },
                { id: 'interactive', label: t.interactive, icon: Grid3X3 },
                { id: 'quiz', label: t.quiz, icon: Brain },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-dark-400'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {activeTab === 'learn' && (
          <section className="section-padding pt-0">
            <div className="container-width">
              <MultiAngle
                conceptId="attention"
                conceptName={multiAngleData.conceptName}
                angles={multiAngleData.angles.map(a => ({ ...a, icon: iconMap[a.iconName] }))}
              />
              <div className="mt-8">
                {renderTopicContent()}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'interactive' && (
          <section className="section-padding pt-0">
            <div className="container-width">
              <div className="mb-8">
                <h2 className="font-heading text-2xl font-bold mb-2">
                  {isZh ? '🔧 交互式 Transformer 流水线' : '🔧 Interactive Transformer Pipeline'}
                </h2>
                <p className="text-dark-400 mb-6">
                  {isZh ? '点击下方任意模块，深入了解 Transformer 每个子模块的工作原理。' : 'Click any module below to deep-dive into each sub-module of the Transformer.'}
                </p>
              </div>

              <div className="overflow-x-auto pb-4">
                <div className="flex gap-3 min-w-max mb-8">
                  {pipelineStages.map((stage, idx) => {
                    const Icon = stage.icon
                    const isActive = activeStage === stage.id
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setActiveStage(stage.id)}
                        className={[
                          'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 min-w-[120px] transition-all',
                          isActive
                            ? `bg-gradient-to-br ${stage.color} border-transparent shadow-lg scale-105`
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        ].join(' ')}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-1">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className={`font-semibold text-sm text-center ${isActive ? 'text-white' : 'text-dark-300'}`}>
                          {isZh ? stage.nameZh : stage.nameEn}
                        </div>
                        <div className={`text-xs text-center ${isActive ? 'text-white/80' : 'text-dark-500'}`}>
                          {isZh ? stage.descZh : stage.descEn}
                        </div>
                        {idx < pipelineStages.length - 1 && (
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-dark-500 z-10">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Card className="mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentStage.color} flex items-center justify-center`}>
                    {(() => { const Icon = currentStage.icon; return <Icon className="w-5 h-5 text-white" /> })()}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold">
                      {isZh ? currentStage.nameZh : currentStage.nameEn}
                    </h3>
                    <p className="text-sm text-dark-400">
                      {isZh ? currentStage.descZh : currentStage.descEn}
                    </p>
                  </div>
                </div>
                <div className="min-h-[400px]">
                  <ActiveComponent {...currentStage.defaultProps} />
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <h3 className="font-heading text-lg font-semibold mb-4">
                    {isZh ? '💡 学习提示' : '💡 Learning Tip'}
                  </h3>
                  <ul className="space-y-2 text-sm text-dark-400">
                    <li>• {isZh ? '从左到右依次点击每个模块，理解数据如何流动。' : 'Click modules left-to-right to see how data flows.'}</li>
                    <li>• {isZh ? '调节每个模块的滑块，观察输出如何变化。' : 'Adjust each slider and observe output changes.'}</li>
                    <li>• {isZh ? '注意力机制的核心是"查询-键-值"的加权平均。' : 'The core of attention is Q-K-V weighted averaging.'}</li>
                  </ul>
                </Card>
                <Card>
                  <h3 className="font-heading text-lg font-semibold mb-4">
                    {isZh ? '📦 模块总览' : '📦 Module Overview'}
                  </h3>
                  <p className="text-sm text-dark-400">
                    {isZh ? '完整的 Transformer 编码器层 = 多头注意力 + 残差连接 + LayerNorm + 前馈网络 + 残差连接 + LayerNorm。解码器还包含交叉注意力。' : 'A full Transformer encoder layer = Multi-Head Attention + Residual + LayerNorm + FFN + Residual + LayerNorm. The decoder additionally has cross-attention.'}
                  </p>
                </Card>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'quiz' && (
          <section className="section-padding pt-0">
            <div className="container-width max-w-2xl">
              <ConceptQuiz
                conceptId="attention"
                conceptName={isZh ? '注意力机制' : 'Attention Mechanism'}
                questions={quizzes}
                onComplete={(score) => {
                  console.log(`Quiz completed: ${score}/${quizzes.length}`)
                }}
              />
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
