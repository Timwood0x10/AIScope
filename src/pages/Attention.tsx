import { useState } from 'react'
import { Info, Brain, Layers, Grid3X3, Calculator, Clock, Eye, Zap, BookOpen, GitBranch, ChevronRight, Pause, Play, RefreshCw } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import AttentionHeatmap from '../components/charts/AttentionHeatmap'
import MultiAngle from '../components/ui/MultiAngle'
import ConceptQuiz from '../components/ui/ConceptQuiz'
import { useI18n } from '../i18n/context'
import { attentionTopics, attentionMultiAngle, attentionQuizzes, attentionContent } from '../i18n/attention'

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

export default function AttentionPage() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  
  const [selectedTopic, setSelectedTopic] = useState('math')
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'interactive'>('learn')
  const [seqLength, setSeqLength] = useState(4)
  const [headDim, setHeadDim] = useState(64)
  const [scaleFactor, setScaleFactor] = useState(0.125)

  const t = attentionContent[lang]
  const topics = attentionTopics[lang]
  const quizzes = attentionQuizzes[lang]
  const multiAngleData = attentionMultiAngle[lang]

  const renderTopicContent = () => {
    const topicsContent = {
      math: () => (
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
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  score(i, j) = Q_i · K_j^T
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? '位置 i 的 query 与位置 j 的 key 的点积结果，反映了 j 对 i 的重要程度。' : 'Dot product of query at position i and key at position j, reflecting j\'s importance to i.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">3. {isZh ? '缩放因子' : 'Scale Factor'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '除以 √d_k 可以稳定 softmax 的梯度：' : 'Dividing by √d_k stabilizes softmax gradients:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  scaled_score = score / √d_k
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? '当 d_k 很大时，score 的方差会很大，导致 softmax 梯度消失。除以 √d_k 可以将方差控制在 1。' : 'When d_k is large, score variance becomes large, causing vanishing gradients. Dividing by √d_k controls variance to 1.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">4. Softmax {isZh ? '归一化' : 'Normalization'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '对缩放后的分数应用 softmax，得到注意力权重：' : 'Apply softmax to scaled scores to get attention weights:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  attention_weights = softmax(scaled_scores)
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? 'softmax 确保所有权重为正且和为 1，可以解释为概率分布。' : 'Softmax ensures all weights are positive and sum to 1, interpretable as probability distribution.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-primary">5. {isZh ? '加权求和' : 'Weighted Sum'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '用注意力权重对 Value 加权求和：' : 'Weighted sum of Values using attention weights:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  output_i = Σ_j attention_weight(i,j) × V_j
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? '位置 i 的输出是所有位置 value 的加权和，权重由注意力权重决定。' : 'Output at position i is weighted sum of all position values, determined by attention weights.'}</p>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="font-heading text-xl font-bold mb-4">{t.complexityTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-sm text-dark-400 mb-1">{t.timeComplexity}</div>
                <code className="text-xl font-mono text-primary">O(L² · d)</code>
                <p className="text-sm text-dark-500 mt-2">{t.seqLengthDesc}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-sm text-dark-400 mb-1">{t.spaceComplexity}</div>
                <code className="text-xl font-mono text-secondary">O(L²)</code>
                <p className="text-sm text-dark-500 mt-2">{t.spaceDesc}</p>
              </div>
            </div>
            <p className="text-amber-400 mt-4 text-sm">⚠️ {t.bottleneck}</p>
          </Card>
        </div>
      ),
      multihead: () => (
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
                <ul className="space-y-2 text-dark-400">
                  <li>• <strong>{isZh ? '头1' : 'Head 1'}</strong>: {isZh ? '可能学习句法依赖（主语→动词）' : 'May learn syntactic dependencies (subject → verb)'}</li>
                  <li>• <strong>{isZh ? '头2' : 'Head 2'}</strong>: {isZh ? '可能学习语义相似（"狗"和"犬"）' : 'May learn semantic similarity ("dog" and "canine")'}</li>
                  <li>• <strong>{isZh ? '头3' : 'Head 3'}</strong>: {isZh ? '可能学习指代关系（代词→实体）' : 'May learn coreference (pronoun → entity)'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '数学公式' : 'Mathematical Formula'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W_O
                </div>
                <p className="text-sm text-dark-500 mt-2 text-center">{isZh ? '其中' : 'where'} head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '典型配置' : 'Typical Configuration'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-sm text-dark-400">{isZh ? '注意力头数' : 'Attention Heads'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-secondary">64</div>
                    <div className="text-sm text-dark-400">{isZh ? '每头维度' : 'Head Dimension'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-accent">512</div>
                    <div className="text-sm text-dark-400">{isZh ? '模型总维度' : 'Total Dimension'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-emerald-400">8×64</div>
                    <div className="text-sm text-dark-400">= 512</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
      residual: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              {isZh ? '残差连接 (Residual Connection)' : 'Residual Connection'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '核心公式' : 'Core Formula'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  output = F(x) + x
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? '其中 F(x) 是子层的变换，x 是输入的恒等映射。' : 'Where F(x) is the sublayer transformation and x is the identity mapping of input.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '为什么有效？' : 'Why It Works?'}</h4>
                <ul className="space-y-3 text-dark-400">
                  <li className="flex gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">1</span>
                    <div><strong>{isZh ? '梯度直接流动' : 'Direct Gradient Flow'}</strong><p className="text-sm">{isZh ? '恒等路径让梯度直接流过网络，解决深层网络的梯度消失问题。' : 'Identity path allows gradients to flow directly through the network, solving vanishing gradient problem.'}</p></div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">2</span>
                    <div><strong>{isZh ? '学习更简单' : 'Easier Learning'}</strong><p className="text-sm">{isZh ? '网络可以轻松学习恒等映射，F(x) 只需要学习残差。' : 'Network can easily learn identity mapping; F(x) only needs to learn the residual.'}</p></div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">3</span>
                    <div><strong>{isZh ? '特征复用' : 'Feature Reuse'}</strong><p className="text-sm">{isZh ? '低层特征可以直接传递到高层，不需要重新学习。' : 'Lower-level features can pass directly to higher layers without re-learning.'}</p></div>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '在 Transformer 中' : 'In Transformer'}</h4>
                <p className="text-dark-400">{isZh ? '每个子层（Multi-Head Attention / FFN）都有残差连接：' : 'Each sublayer (Multi-Head Attention / FFN) has a residual connection:'}</p>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-sm mt-2">
                  LayerNorm(x + Sublayer(x))
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
      encoder: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🏗️</span>
              {isZh ? '编码器 (Encoder)' : 'Encoder'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '结构组成' : 'Structure'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '每个编码器层包含两个子层：' : 'Each encoder layer contains two sublayers:'}</p>
                <ol className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">1</span>
                    <div><strong>Multi-Head Self-Attention</strong><p className="text-sm text-dark-400">{isZh ? '所有位置 Attend 到所有位置' : 'All positions attend to all positions'}</p></div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">2</span>
                    <div><strong>Feed-Forward Network</strong><p className="text-sm text-dark-400">{isZh ? '位置独立的全连接网络' : 'Position-independent fully connected network'}</p></div>
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '完整编码器层' : 'Complete Encoder Layer'}</h4>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="space-y-2">
                    <div className="p-3 rounded bg-blue-500/20 text-center">x₀ = Input Embeddings + Positional Encoding</div>
                    <div className="text-center text-dark-500">↓</div>
                    <div className="p-3 rounded bg-purple-500/20 text-center">x₁ = LayerNorm(x₀ + MultiHead(x₀))</div>
                    <div className="text-center text-dark-500">↓</div>
                    <div className="p-3 rounded bg-green-500/20 text-center">x₂ = LayerNorm(x₁ + FFN(x₁))</div>
                    <div className="text-center text-dark-500">↓</div>
                    <div className="p-3 rounded bg-amber-500/20 text-center">{isZh ? 'Output → (重复 N 次)' : 'Output → (Repeat N times)'}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
      decoder: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">📤</span>
              {isZh ? '解码器 (Decoder)' : 'Decoder'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '与编码器的区别' : 'Difference from Encoder'}</h4>
                <ul className="space-y-2 text-dark-400">
                  <li>• <strong>{isZh ? '掩码自注意力' : 'Masked Self-Attention'}</strong>: {isZh ? '只能看到当前位置及之前的 token' : 'Can only see current and previous tokens'}</li>
                  <li>• <strong>{isZh ? '交叉注意力' : 'Cross-Attention'}</strong>: {isZh ? 'Query 来自解码器，K/V 来自编码器' : 'Query from decoder, K/V from encoder'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '解码器层结构' : 'Decoder Layer Structure'}</h4>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="space-y-2">
                    <div className="p-3 rounded bg-blue-500/20 text-center">Masked Multi-Head Self-Attention (Causal)</div>
                    <div className="text-center text-dark-500">↓</div>
                    <div className="p-3 rounded bg-purple-500/20 text-center">Multi-Head Cross-Attention ({isZh ? 'Attend to Encoder' : '关注编码器'})</div>
                    <div className="text-center text-dark-500">↓</div>
                    <div className="p-3 rounded bg-green-500/20 text-center">Feed-Forward Network</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
      causal: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">⏱️</span>
              {isZh ? '因果掩码 (Causal Mask)' : 'Causal Mask'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '为什么需要？' : 'Why Needed?'}</h4>
                <p className="text-dark-400">{isZh ? '解码器在生成第 i 个 token 时，不能看到位置 i+1, i+2, ... 的信息（未来 token）。否则就是"作弊"，模型会直接复制答案。' : 'When generating token i, the decoder cannot see positions i+1, i+2, ... (future tokens). Otherwise it\'s "cheating" and would simply copy answers.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '掩码矩阵示意' : 'Mask Matrix Illustration'}</h4>
                <div className="p-4 rounded-xl bg-white/5 overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <tbody>
                      {[0, 1, 2, 3].map((i) => (
                        <tr key={i}>
                          {[0, 1, 2, 3].map((j) => (
                            <td key={j} className="p-2 text-center">
                              <span className={j <= i ? 'text-green-400' : 'text-red-400/50 line-through'}>{j <= i ? '1' : '0'}</span>
                            </td>
                          ))}
                          <td className="text-dark-500 pl-4">← {isZh ? '位置' : 'Position'} {i}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-center text-dark-500 mt-2">{isZh ? '绿色=可attend，红色=不可attend（被mask）' : 'Green = attendable, Red = masked (not attendable)'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '实现方式' : 'Implementation'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-sm">
                  {`attention_scores = attention_scores.masked_fill(
    torch.triu(torch.ones(L, L), diagonal=1).bool(),
    float('-inf')
)`}
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? '使用上三角矩阵将未来位置设为 -inf，softmax 后变为 0。' : 'Use upper triangular matrix to set future positions to -inf, which becomes 0 after softmax.'}</p>
              </div>
            </div>
          </Card>
        </div>
      ),
      rope: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🌀</span>
              {isZh ? 'RoPE 旋转位置编码' : 'RoPE (Rotary Position Embedding)'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '核心思想' : 'Core Idea'}</h4>
                <p className="text-dark-400">{isZh ? 'RoPE 不使用加性位置编码，而是通过旋转 Query 和 Key 向量来融入位置信息。' : 'RoPE doesn\'t use additive positional encoding. Instead, it rotates Query and Key vectors to incorporate positional information.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '二维旋转' : '2D Rotation'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-center">
                  R(θ, m) · [q_a, q_b]^T = [q_a cos(mθ) - q_b sin(mθ), q_a sin(mθ) + q_b cos(mθ)]
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? '位置 m 的向量旋转 mθ 角度，使得内积包含相对位置信息。' : 'Vector at position m rotates by mθ degrees, making inner product contain relative position info.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '与绝对位置编码对比' : 'Comparison with Absolute Encoding'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <div className="font-semibold mb-2">{isZh ? '绝对位置编码' : 'Absolute Positional Encoding'}</div>
                    <ul className="text-sm text-dark-400 space-y-1">
                      <li>• {isZh ? '位置信息直接加到 embedding' : 'Position info added directly to embedding'}</li>
                      <li>• {isZh ? '外推性差（超出训练长度表现差）' : 'Poor extrapolation (bad beyond training length)'}</li>
                      <li>• {isZh ? '计算简单' : 'Simple computation'}</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="font-semibold mb-2">RoPE</div>
                    <ul className="text-sm text-dark-400 space-y-1">
                      <li>• {isZh ? '旋转融入位置信息' : 'Position info via rotation'}</li>
                      <li>• {isZh ? '相对位置自然编码' : 'Relative positions naturally encoded'}</li>
                      <li>• {isZh ? '外推性更好' : 'Better extrapolation'}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-amber-400 font-medium">{isZh ? 'Llama, GLM, Falcon 等模型使用' : 'Used by Llama, GLM, Falcon and others'}</p>
                <p className="text-sm text-dark-400 mt-1">{isZh ? 'RoPE 已成为现代 LLM 的主流位置编码方案。' : 'RoPE has become the mainstream positional encoding scheme for modern LLMs.'}</p>
              </div>
            </div>
          </Card>
        </div>
      ),
      advanced: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🔬</span>
              {isZh ? '进阶视角' : 'Advanced Perspectives'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '矩阵几何视角' : 'Matrix-Geometric View'}</h4>
                <p className="text-dark-400 mb-3">{isZh ? '注意力可以理解为在高维球面上做"软性最近邻搜索"。' : 'Attention can be understood as "soft nearest-neighbor search" on a high-dimensional sphere.'}</p>
                <ul className="space-y-2 text-dark-400">
                  <li>• Q, K, V {isZh ? '是球面上的点' : 'are points on the sphere'}</li>
                  <li>• softmax {isZh ? '实现软性匹配' : 'implements soft matching'}</li>
                  <li>• {isZh ? '输出是 V 的加权平均（插值）' : 'Output is weighted average of V (interpolation)'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '复杂度优化' : 'Complexity Optimization'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium text-primary">Flash Attention</div>
                    <p className="text-sm text-dark-400 mt-1">{isZh ? 'IO-aware 优化，减少 HBM 访问' : 'IO-aware optimization, reduces HBM access'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium text-secondary">Sparse Attention</div>
                    <p className="text-sm text-dark-400 mt-1">{isZh ? '只计算部分注意力模式' : 'Only compute partial attention patterns'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium text-accent">Linear Attention</div>
                    <p className="text-sm text-dark-400 mt-1">{isZh ? '核函数近似，O(L) 复杂度' : 'Kernel approximation, O(L) complexity'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '注意力模式类型' : 'Attention Pattern Types'}</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="font-medium">Full Attention</div>
                    <p className="text-sm text-dark-400">{isZh ? '所有位置两两计算' : 'All positions compute pairwise'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="font-medium">Local / Window</div>
                    <p className="text-sm text-dark-400">{isZh ? '只关注局部窗口' : 'Only attend to local window'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="font-medium">Strided</div>
                    <p className="text-sm text-dark-400">{isZh ? '跳跃式采样' : 'Strided sampling'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="font-medium">Fixed / Global</div>
                    <p className="text-sm text-dark-400">{isZh ? '固定位置 + 局部窗口' : 'Fixed positions + local window'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
      token: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">✂️</span>
              {isZh ? '分词算法 (Tokenization)' : 'Tokenization'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '常见分词方法' : 'Common Tokenization Methods'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium mb-2">BPE (Byte-Pair Encoding)</div>
                    <p className="text-sm text-dark-400">{isZh ? '贪心合并最高频的字符对。GPT-2 使用。' : 'Greedy merging of most frequent pairs. Used by GPT-2.'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium mb-2">WordPiece</div>
                    <p className="text-sm text-dark-400">{isZh ? '基于最大似然选择合并。BERT 使用。' : 'Max-likelihood based merging. Used by BERT.'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium mb-2">Unigram</div>
                    <p className="text-sm text-dark-400">{isZh ? '从大词汇表开始删减。SentencePiece 使用。' : 'Start from large vocab, prune. Used by SentencePiece.'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-medium mb-2">Byte-level</div>
                    <p className="text-sm text-dark-400">{isZh ? '直接操作字节。Llama 使用。' : 'Operate directly on bytes. Used by Llama.'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? 'Token 数量的影响' : 'Impact of Token Count'}</h4>
                <ul className="space-y-2 text-dark-400">
                  <li>• <strong>{isZh ? '更多 token' : 'More tokens'}</strong>: {isZh ? '序列更短，Context 窗口利用率高' : 'Shorter sequences, better context utilization'}</li>
                  <li>• <strong>{isZh ? '更少 token' : 'Fewer tokens'}</strong>: {isZh ? '每个 token 携带更多语义，计算效率高' : 'Each token carries more semantics, higher compute efficiency'}</li>
                  <li>• <strong>{isZh ? '最佳实践' : 'Best practice'}</strong>: {isZh ? '中英文混合时，字节级 BPE 较优' : 'Byte-level BPE works best for mixed Chinese-English'}</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ),
      training: () => (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              {isZh ? '训练核心技巧' : 'Core Training Techniques'}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '权重初始化' : 'Weight Initialization'}</h4>
                <div className="p-4 rounded-xl bg-white/5 font-mono text-sm">
                  W ~ N(0, √(2/d_model))
                </div>
                <p className="text-sm text-dark-500 mt-2">{isZh ? 'Xavier/He 初始化的变体，确保信号在各层合理传播。' : 'Variant of Xavier/He initialization, ensures proper signal propagation.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '学习率调度' : 'Learning Rate Schedule'}</h4>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-primary"></span><span>Warmup (0 → peak)</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-secondary"></span><span>{isZh ? '保持峰值' : 'Maintain peak'}</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-accent"></span><span>Cosine {isZh ? '衰减' : 'Decay'}</span></div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '正则化' : 'Regularization'}</h4>
                <ul className="space-y-2 text-dark-400">
                  <li>• <strong>Dropout</strong>: {isZh ? '训练时随机置零部分激活 (p=0.1)' : 'Randomly zero activations during training (p=0.1)'}</li>
                  <li>• <strong>Label Smoothing</strong>: {isZh ? '软化标签，防止过自信' : 'Softens labels, prevents overconfidence'}</li>
                  <li>• <strong>Weight Decay</strong>: {isZh ? 'L2 正则化 (AdamW)' : 'L2 regularization (AdamW)'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{isZh ? '混合精度训练' : 'Mixed Precision Training'}</h4>
                <p className="text-dark-400">{isZh ? '使用 FP16 前向/反向，FP32 优化器状态。减少内存，加速训练。' : 'Use FP16 for forward/backward, FP32 for optimizer states. Reduces memory, accelerates training.'}</p>
              </div>
            </div>
          </Card>
        </div>
      ),
    }

    const renderFn = topicsContent[selectedTopic as keyof typeof topicsContent]
    return renderFn ? renderFn() : null
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
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
                    <code className="font-mono text-lg bg-dark/50 px-4 py-2 rounded-lg block">
                      Attention(Q, K, V) = softmax(QK^T / √d_k) V
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Topic Selector */}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${topic.color} text-white shadow-lg`
                        : 'bg-white/10 hover:bg-white/20 text-dark-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {topic.name}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tab Selector */}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-white/5 hover:bg-white/10 text-dark-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <section className="section-padding pt-0">
            <div className="container-width">
              {/* Multi-angle */}
              <MultiAngle
                conceptId="attention"
                conceptName={multiAngleData.conceptName}
                angles={multiAngleData.angles.map(a => ({ ...a, icon: iconMap[a.iconName] }))}
              />

              {/* Topic Content */}
              <div className="mt-8">
                {renderTopicContent()}
              </div>
            </div>
          </section>
        )}

        {/* Interactive Tab */}
        {activeTab === 'interactive' && (
          <section className="section-padding pt-0">
            <div className="container-width">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <Card className="lg:col-span-1">
                  <h3 className="font-heading text-lg font-semibold mb-6">{t.params}</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-dark-400 mb-2">
                        {t.seqLength} (L): {seqLength}
                      </label>
                      <input
                        type="range"
                        min={2}
                        max={8}
                        value={seqLength}
                        onChange={(e) => setSeqLength(parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-dark-500 mt-1">
                        <span>2</span>
                        <span>8</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-dark-400 mb-2">
                        {t.headDim} (d): {headDim}
                      </label>
                      <input
                        type="range"
                        min={16}
                        max={128}
                        step={16}
                        value={headDim}
                        onChange={(e) => setHeadDim(parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-dark-500 mt-1">
                        <span>16</span>
                        <span>128</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-dark-400 mb-2">
                        {t.scaleFactor}: {scaleFactor.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        value={scaleFactor}
                        onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="font-medium mb-2">{t.steps}</h4>
                      <ol className="space-y-2 text-sm text-dark-400">
                        <li>1. Q = XW_Q ({isZh ? '查询' : 'Query'})</li>
                        <li>2. K = XW_K ({isZh ? '键' : 'Key'})</li>
                        <li>3. V = XW_V ({isZh ? '值' : 'Value'})</li>
                        <li>4. QK^T ({isZh ? '相似度' : 'Similarity'})</li>
                        <li>5. ÷ √d ({isZh ? '缩放' : 'Scale'})</li>
                        <li>6. softmax ({isZh ? '归一化' : 'Normalize'})</li>
                        <li>7. × V ({isZh ? '加权求和' : 'Weighted Sum'})</li>
                      </ol>
                    </div>
                  </div>
                </Card>

                {/* Visualization */}
                <Card className="lg:col-span-2">
                  <h3 className="font-heading text-lg font-semibold mb-4">{t.heatmap}</h3>
                  <div className="h-[400px]">
                    <AttentionHeatmap
                      seqLength={seqLength}
                      headDim={headDim}
                      scaleFactor={scaleFactor}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Quiz Tab */}
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
