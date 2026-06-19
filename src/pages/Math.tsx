import { useState } from 'react'
import { TrendingDown, Grid3X3, Brain, GitBranch, Zap, Layers, BarChart3, Sigma, BookOpen, Calculator, Clock, Eye, Info } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import MultiAngle from '../components/ui/MultiAngle'
import ConceptQuiz from '../components/ui/ConceptQuiz'
import GradientDescent3D from '../components/charts/GradientDescent3D'
import { useI18n } from '../i18n/context'
import { mathContent, mathMultiAngleConcepts, mathQuizzes } from '../i18n/math'

const iconMap: Record<string, any> = {
  TrendingDown,
  Grid3X3,
  Brain,
  GitBranch,
  Zap,
  Layers,
  BarChart3,
  Sigma,
  BookOpen,
  Calculator,
  Clock,
  Eye,
  Info,
}

const practices = {
  zh: {
    calculus: {
      title: '梯度下降模拟',
      description: '手动计算一步梯度下降',
      fields: [
        { name: 'w', label: '当前权重 w', default: 10 },
        { name: 'gradient', label: '梯度 ∂L/∂w', default: 0.8 },
        { name: 'learning_rate', label: '学习率 η', default: 0.1 },
      ],
      check: (values: any) => {
        const { w, gradient, learning_rate } = values
        const expected = w - learning_rate * gradient
        return { correct: Math.abs(expected - 9.2) < 0.01, message: `新权重应该是 ${expected.toFixed(1)}` }
      },
    },
    matrix: {
      title: '矩阵形状计算',
      description: '计算矩阵乘法结果的形状',
      fields: [
        { name: 'm', label: '样本数 m', default: 1000 },
        { name: 'd_in', label: '输入维度 d_in', default: 784 },
        { name: 'd_out', label: '输出维度 d_out', default: 10 },
      ],
      check: (values: any) => {
        const { m, d_out } = values
        return { correct: true, message: `输出形状应该是 ${m}×${d_out}` }
      },
    },
    probability: {
      title: '贝叶斯定理计算',
      description: '计算后验概率',
      fields: [
        { name: 'p_a', label: '先验 P(A)', default: 0.01 },
        { name: 'p_pos_given_a', label: '似然 P(B|A)', default: 0.99 },
        { name: 'p_pos_given_not_a', label: 'P(B|¬A)', default: 0.05 },
      ],
      check: (values: any) => {
        const { p_a, p_pos_given_a, p_pos_given_not_a } = values
        const p_not_a = 1 - p_a
        const p_pos = p_pos_given_a * p_a + p_pos_given_not_a * p_not_a
        const p_a_given_pos = (p_pos_given_a * p_a) / p_pos
        return { correct: true, message: `后验概率约为 ${(p_a_given_pos * 100).toFixed(1)}%` }
      },
    },
  },
  en: {
    calculus: {
      title: 'Gradient Descent Simulation',
      description: 'Manually calculate one step of gradient descent',
      fields: [
        { name: 'w', label: 'Current weight w', default: 10 },
        { name: 'gradient', label: 'Gradient ∂L/∂w', default: 0.8 },
        { name: 'learning_rate', label: 'Learning rate η', default: 0.1 },
      ],
      check: (values: any) => {
        const { w, gradient, learning_rate } = values
        const expected = w - learning_rate * gradient
        return { correct: Math.abs(expected - 9.2) < 0.01, message: `New weight should be ${expected.toFixed(1)}` }
      },
    },
    matrix: {
      title: 'Matrix Shape Calculation',
      description: 'Calculate matrix multiplication result shape',
      fields: [
        { name: 'm', label: 'Samples m', default: 1000 },
        { name: 'd_in', label: 'Input dimension d_in', default: 784 },
        { name: 'd_out', label: 'Output dimension d_out', default: 10 },
      ],
      check: (values: any) => {
        const { m, d_out } = values
        return { correct: true, message: `Output shape should be ${m}×${d_out}` }
      },
    },
    probability: {
      title: 'Bayes\' Theorem Calculation',
      description: 'Calculate posterior probability',
      fields: [
        { name: 'p_a', label: 'Prior P(A)', default: 0.01 },
        { name: 'p_pos_given_a', label: 'Likelihood P(B|A)', default: 0.99 },
        { name: 'p_pos_given_not_a', label: 'P(B|¬A)', default: 0.05 },
      ],
      check: (values: any) => {
        const { p_a, p_pos_given_a, p_pos_given_not_a } = values
        const p_not_a = 1 - p_a
        const p_pos = p_pos_given_a * p_a + p_pos_given_not_a * p_not_a
        const p_a_given_pos = (p_pos_given_a * p_a) / p_pos
        return { correct: true, message: `Posterior probability ≈ ${(p_a_given_pos * 100).toFixed(1)}%` }
      },
    },
  },
}

export default function MathPage() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const t = mathContent[lang]
  
  const [selectedTopic, setSelectedTopic] = useState('calculus')
  const [showVisualization, setShowVisualization] = useState(false)
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'practice'>('learn')

  const topics = [
    { id: 'calculus', name: t.topics.calculus, icon: TrendingDown, color: 'from-orange-500 to-red-500' },
    { id: 'matrix', name: t.topics.matrix, icon: Grid3X3, color: 'from-blue-500 to-cyan-500' },
    { id: 'probability', name: t.topics.probability, icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { id: 'entropy', name: t.topics.entropy, icon: Sigma, color: 'from-emerald-500 to-teal-500' },
    { id: 'attention', name: t.topics.attention, icon: Eye, color: 'from-primary to-secondary' },
  ]

  const currentMultiAngle = mathMultiAngleConcepts[lang][selectedTopic] || mathMultiAngleConcepts[lang].calculus
  const currentQuiz = mathQuizzes[lang][selectedTopic] || mathQuizzes[lang].calculus
  const currentPractice = practices[lang][selectedTopic] || null

  const renderTopicContent = () => {
    switch (selectedTopic) {
      case 'calculus':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">📐</span>
                {t.whatIsDerivative}
              </h3>
              <p className="text-dark-400 mb-4">{t.derivativeDesc}</p>
              
              <div className="p-4 rounded-xl bg-white/5 mb-4">
                <h4 className="font-semibold mb-2">{t.derivativeFormula}</h4>
                <div className="font-mono text-center text-lg">
                  f'(x) = lim<sub>Δx→0</sub> [f(x + Δx) - f(x)] / Δx
                </div>
                <p className="text-sm text-dark-500 mt-2">{t.derivativeFormulaDesc}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">{t.commonDerivatives}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { f: 'x^n', df: 'nx^(n-1)' },
                    { f: 'e^x', df: 'e^x' },
                    { f: 'ln(x)', df: '1/x' },
                    { f: 'sin(x)', df: 'cos(x)' },
                  ].map(d => (
                    <div key={d.f} className="p-2 rounded-lg bg-white/5 font-mono text-sm">
                      <div className="text-dark-400">{d.f}</div>
                      <div className="text-primary">→ {d.df}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <h4 className="font-semibold text-primary mb-2">{t.dlSignificance}</h4>
                <ul className="text-sm text-dark-400 space-y-1">
                  {t.dlSignificanceItems.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.derivativeToGradient}</h3>
              <p className="text-dark-400 mb-4">{t.gradientDesc}</p>
              <div className="font-mono text-center p-4 rounded-xl bg-white/5">
                ∇f = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂x_n]
              </div>
              <div className="mt-4 p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                <h4 className="font-semibold text-secondary mb-2">{t.gradientMeaning}</h4>
                <p className="text-sm text-dark-400">{t.gradientMeaningDesc}</p>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/30">
                <h4 className="font-semibold text-accent mb-2">{t.directionMatters}</h4>
                <p className="text-sm text-dark-400">{t.directionMattersDesc}</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.gradientDescent}</h3>
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className="mb-4 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all"
              >
                {showVisualization ? t.hide : t.show} {t.gradientDescent}
              </button>
              {showVisualization && (
                <div className="h-[300px]">
                  <GradientDescent3D />
                </div>
              )}
            </Card>
          </div>
        )

      case 'matrix':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">🧮</span>
                {t.matrixTitle}
              </h3>
              <p className="text-dark-400 mb-4">{t.matrixDesc}</p>

              <div className="p-4 rounded-xl bg-white/5 mb-4">
                <h4 className="font-semibold mb-2">{t.matrixMultiplication}</h4>
                <div className="font-mono text-center">
                  C = A × B  →  C[i,j] = Σ_k A[i,k] × B[k,j]
                </div>
                <p className="text-sm text-dark-500 mt-2">{t.matrixMultiplicationKey}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">{t.linearTransformTypes}</h4>
                <ul className="text-dark-400 space-y-1">
                  {t.linearTransformItems.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <h4 className="font-semibold text-primary mb-2">{t.whyNonlinear}</h4>
                <p className="text-sm text-dark-400">{t.whyNonlinearDesc}</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.mnistExample}</h3>
              <div className="p-4 rounded-xl bg-white/5 font-mono text-sm">
                <div>X: {isZh ? '输入图像' : 'Input image'} (1×784) — {isZh ? '28×28像素展平' : '28×28 pixels flattened'}</div>
                <div className="text-primary mt-2">W: {isZh ? '权重矩阵' : 'Weight matrix'} (784×10) — {isZh ? '10类数字' : '10 digit classes'}</div>
                <div className="text-secondary mt-2">b: {isZh ? '偏置' : 'Bias'} (1×10)</div>
                <div className="text-accent mt-2">y = XW + b → (1×10) {isZh ? '概率分布' : 'probability distribution'}</div>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.eigenTitle}</h3>
              <p className="text-dark-400 mb-4">{t.eigenDesc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">{t.bigEigen}</h4>
                  <p className="text-sm text-dark-400">{t.bigEigenDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">{t.smallEigen}</h4>
                  <p className="text-sm text-dark-400">{t.smallEigenDesc}</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/30">
                <h4 className="font-semibold text-accent mb-2">{t.eigenDL}</h4>
                <p className="text-sm text-dark-400">{t.eigenDLDesc}</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.matrixShapes}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {[
                  { shape: 'X: m×d_in', desc: isZh ? '输入数据' : 'Input data' },
                  { shape: 'W: d_in×d_out', desc: isZh ? '权重' : 'Weights' },
                  { shape: 'XW: m×d_out', desc: isZh ? '线性变换' : 'Linear transform' },
                  { shape: 'Attention: L×L', desc: isZh ? '注意力矩阵' : 'Attention matrix' },
                ].map(s => (
                  <div key={s.shape} className="p-2 rounded-lg bg-white/5">
                    <div className="font-mono text-primary">{s.shape}</div>
                    <div className="text-dark-500">{s.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )

      case 'probability':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">🎲</span>
                {t.probabilityTitle}
              </h3>
              <p className="text-dark-400 mb-4">{t.probabilityDesc}</p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">{t.modelOutput}</h4>
                  <p className="text-sm text-dark-400">{t.modelOutputDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">{t.lossFunction}</h4>
                  <p className="text-sm text-dark-400">{t.lossFunctionDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <h4 className="font-semibold text-accent mb-2">{t.regularization}</h4>
                  <p className="text-sm text-dark-400">{t.regularizationDesc}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.basicConcepts}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="font-semibold mb-2">{t.jointProb}</h4>
                  <p className="text-sm text-dark-400">{t.jointProbDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="font-semibold mb-2">{t.condProb}</h4>
                  <p className="text-sm text-dark-400">{t.condProbDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="font-semibold mb-2">{t.independence}</h4>
                  <p className="text-sm text-dark-400">{t.independenceDesc}</p>
                  <p className="text-xs text-dark-500 mt-1">{t.independenceNote}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="font-semibold mb-2">{t.expectation}</h4>
                  <p className="text-sm text-dark-400">{t.expectationDesc}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.bayesTitle}</h3>
              <div className="p-4 rounded-xl bg-white/5 font-mono text-center mb-4">
                P(A|B) = P(B|A) × P(A) / P(B)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">{t.prior}</h4>
                  <p className="text-sm text-dark-400">{t.priorDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">{t.likelihood}</h4>
                  <p className="text-sm text-dark-400">{t.likelihoodDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <h4 className="font-semibold text-accent mb-2">{t.evidence}</h4>
                  <p className="text-sm text-dark-400">{t.evidenceDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-semibold text-emerald-400 mb-2">{t.posterior}</h4>
                  <p className="text-sm text-dark-400">{t.posteriorDesc}</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-amber-400 font-medium">{t.bayesCore}</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.klTitle}</h3>
              <p className="text-dark-400 mb-4">{t.klDesc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">{t.klZero}</h4>
                  <p className="text-sm text-dark-400">{t.klZeroDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">{t.klCrossEntropy}</h4>
                  <p className="text-sm text-dark-400">{t.klCrossEntropyDesc}</p>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'entropy':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">📊</span>
                {t.entropyTitle}
              </h3>
              <p className="text-dark-400 mb-4">{t.entropyDesc}</p>

              <div className="p-4 rounded-xl bg-white/5 mb-4">
                <h4 className="font-semibold mb-2">{t.entropyDef}</h4>
                <div className="font-mono text-center">
                  H(P) = -Σ p(x) log p(x)
                </div>
                <p className="text-sm text-dark-500 mt-2">{t.entropyDefDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">{t.certain}</h4>
                  <p className="text-sm text-dark-400">{t.certainDesc}</p>
                  <div className="font-mono text-lg mt-2">H = 0</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">{t.uniform2}</h4>
                  <p className="text-sm text-dark-400">{t.uniform2Desc}</p>
                  <div className="font-mono text-lg mt-2">H = 1</div>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <h4 className="font-semibold text-accent mb-2">{t.uniformN}</h4>
                  <p className="text-sm text-dark-400">{t.uniformNDesc}</p>
                  <div className="font-mono text-lg mt-2">H = log N</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <h4 className="font-semibold text-primary mb-2">{t.llmEntropy}</h4>
                <p className="text-sm text-dark-400 mb-2">{t.llmEntropyDesc}</p>
                <ul className="text-sm text-dark-400 space-y-1">
                  {t.llmEntropyItems.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.mutualInfo}</h3>
              <p className="text-dark-400 mb-4">{t.mutualInfoDesc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">{t.miZero}</h4>
                  <p className="text-sm text-dark-400">{t.miZeroDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">{t.miLarge}</h4>
                  <p className="text-sm text-dark-400">{t.miLargeDesc}</p>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'attention':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">👁️</span>
                {t.attentionQKV}
              </h3>
              <p className="text-dark-400 mb-4">{t.attentionLibrary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">Query (Q)</h4>
                  <p className="text-sm text-dark-400">{t.queryDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <h4 className="font-semibold text-purple-400 mb-2">Keys (K)</h4>
                  <p className="text-sm text-dark-400">{t.keyDesc}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2">Values (V)</h4>
                  <p className="text-sm text-dark-400">{t.valueDesc}</p>
                </div>
              </div>

              <p className="text-dark-400">{t.attentionResult}</p>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.attentionFlow}</h3>
              <div className="space-y-4">
                {t.attentionSteps.map((step, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5">
                    <div className="font-mono text-primary mb-1">{step.step}</div>
                    <div className="font-mono text-lg">{step.formula}</div>
                    <p className="text-sm text-dark-500 mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-xl font-bold mb-4">{t.keyFormulas}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {t.formulas.map(f => (
                  <div key={f.name} className="p-3 rounded-lg bg-white/5">
                    <div className="text-sm text-dark-400">{f.name}</div>
                    <div className="font-mono text-primary">{f.formula}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 container-width">
            <h1 className="font-heading text-5xl font-bold mb-4 animate-slide-up">
              <span className="gradient-text">{t.heroTitle}</span>
            </h1>
            <p className="text-lg text-dark-400 mb-8 animate-slide-up animation-delay-100">
              {t.heroDesc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up animation-delay-200">
              <div className="glass-card p-4 flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-semibold">{t.multiAngle}</div>
                  <div className="text-sm text-dark-400">{t.multiAngleDesc}</div>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-secondary" />
                <div>
                  <div className="font-semibold">{t.quiz}</div>
                  <div className="text-sm text-dark-400">{t.quizDesc}</div>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-semibold">{t.practice}</div>
                  <div className="text-sm text-dark-400">{t.practiceDesc}</div>
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
                    <topic.icon className="w-4 h-4" />
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
                { id: 'quiz', label: t.quiz, icon: Brain },
                { id: 'practice', label: t.practiceTab, icon: Calculator },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-white/5 hover:bg-white/10 text-dark-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding pt-0">
          <div className="container-width">
            {activeTab === 'learn' && (
              <>
                <MultiAngle
                  conceptId={selectedTopic}
                  conceptName={currentMultiAngle.conceptName}
                  angles={currentMultiAngle.angles.map(a => ({ ...a, icon: iconMap[a.iconName] }))}
                />
                <div className="mt-8">{renderTopicContent()}</div>
              </>
            )}

            {activeTab === 'quiz' && (
              <div className="max-w-2xl mx-auto">
                <ConceptQuiz
                  conceptId={selectedTopic}
                  conceptName={currentMultiAngle.conceptName}
                  questions={currentQuiz}
                />
              </div>
            )}

            {activeTab === 'practice' && currentPractice && (
              <div className="max-w-xl mx-auto">
                <Card>
                  <h3 className="font-heading text-xl font-bold mb-4">{currentPractice.title}</h3>
                  <p className="text-dark-400 mb-4">{currentPractice.description}</p>
                  <div className="space-y-4">
                    {currentPractice.fields.map((field: any) => (
                      <div key={field.name}>
                        <label className="block text-sm text-dark-400 mb-1">{field.label}</label>
                        <input
                          type="number"
                          defaultValue={field.default}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-dark-700"
                          id={field.name}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const values = currentPractice.fields.reduce((acc: any, f: any) => {
                          acc[f.name] = parseFloat((document.getElementById(f.name) as HTMLInputElement).value)
                          return acc
                        }, {})
                        const result = currentPractice.check(values)
                        alert(result.message)
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                    >
                      {isZh ? '检查答案' : 'Check Answer'}
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'practice' && !currentPractice && (
              <div className="text-center py-12">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-dark-500 opacity-50" />
                <p className="text-dark-400">{t.topics[selectedTopic] || selectedTopic} {t.practiceDeveloping}</p>
              </div>
            )}
          </div>
        </section>

        {/* Learning Paths */}
        <section className="section-padding bg-dark-50/30">
          <div className="container-width">
            <h2 className="font-heading text-3xl font-bold mb-8">{t.learningPaths}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  {t.beginnerPath}
                </h3>
                <ul className="space-y-2 text-dark-400">
                  {t.beginnerSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  {t.advancedPath}
                </h3>
                <ul className="space-y-2 text-dark-400">
                  {t.advancedSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-secondary">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  {t.expertPath}
                </h3>
                <ul className="space-y-2 text-dark-400">
                  {t.expertSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="section-padding">
          <div className="container-width">
            <h2 className="font-heading text-3xl font-bold mb-8">{t.quickRef}</h2>
            <Card>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {t.symbols.map(s => (
                  <div key={s.symbol} className="p-3 rounded-lg bg-white/5 text-center">
                    <div className="font-mono text-2xl text-primary">{s.symbol}</div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-dark-500">{s.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}