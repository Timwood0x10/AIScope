import { useState, useEffect } from 'react'
import { Brain, GraduationCap, Trophy, Sparkles, Target } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/context'

const labels = {
  zh: {
    title: '寓教于乐',
    subtitle: 'Learn by Playing',
    heroTitle: '玩一下，',
    heroTitleAccent: '你就懂 AI 了',
    heroDesc: '没有公式，不需要先学数学。你只需要',
    heroDescAccent: '玩',
    heroDescSuffix: '，知识会悄悄地装进你的脑子。',
    completed: '已完成',
    progress: '学习进度',
    scoreUnit: '分',
    separator: '：',
    afterGames: '玩完这',
    gamesYouWill: '个游戏，你会明白：',
    attentionMechanism: '注意力机制',
    attentionMechanismDesc: 'Transformer 的核心直觉',
    attentionWeights: '注意力权重',
    attentionWeightsDesc: '模型关注哪些词',
    gradientDescent: '梯度下降',
    gradientDescentDesc: '模型"学习"的基本动作',
    learningRate: '学习率',
    learningRateDesc: '调整步伐大小避免震荡',
    llmTraining: 'LLM 训练',
    llmTrainingDesc: '模型是怎么学会猜下一个字的',
    bayesian: '贝叶斯概率',
    bayesianDesc: 'AI 推理的底层直觉',
  },
  en: {
    title: 'Learning Games',
    subtitle: 'Learn by Playing',
    heroTitle: 'Play a bit,',
    heroTitleAccent: 'you\'ll understand AI',
    heroDesc: 'No formulas, no need to learn math first. Just',
    heroDescAccent: 'play',
    heroDescSuffix: ', and knowledge will quietly sink into your brain.',
    completed: 'Completed',
    progress: 'Progress',
    scoreUnit: 'pts',
    separator: ' — ',
    afterGames: 'After these',
    gamesYouWill: 'games, you will understand:',
    attentionMechanism: 'Attention Mechanism',
    attentionMechanismDesc: 'Core intuition of Transformer',
    attentionWeights: 'Attention Weights',
    attentionWeightsDesc: 'Which words the model focuses on',
    gradientDescent: 'Gradient Descent',
    gradientDescentDesc: 'Basic action of model "learning"',
    learningRate: 'Learning Rate',
    learningRateDesc: 'Adjust step size to avoid oscillation',
    llmTraining: 'LLM Training',
    llmTrainingDesc: 'How models learn to predict next words',
    bayesian: 'Bayesian Probability',
    bayesianDesc: 'Intuition behind AI reasoning',
  },
}

const games = [
  {
    id: 'library',
    title: '图书馆管理员',
    titleEn: 'Library Admin',
    subtitle: '注意力机制 · Q / K / V',
    subtitleEn: 'Attention Q/K/V',
    emoji: '📚',
    gradient: 'from-violet-500 to-fuchsia-500',
    description: '通过查找书籍，理解 Query / Key / Value 是如何工作的',
    descriptionEn: 'Understand Query/Key/Value by finding books',
    duration: '约 5 分钟',
    durationEn: '~5 min',
    difficulty: '🌱 入门',
    difficultyEn: '🌱 Beginner',
    path: '/games/library'
  },
  {
    id: 'tokenizer',
    title: 'Token 切割师',
    titleEn: 'Token Slicer',
    subtitle: '文本如何变成数字',
    subtitleEn: 'Text → Numbers',
    emoji: '✂️',
    gradient: 'from-cyan-500 to-blue-500',
    description: '看看 LLM 是怎么把文字切成一小块一小块的',
    descriptionEn: 'See how LLMs slice text into chunks',
    duration: '约 4 分钟',
    durationEn: '~4 min',
    difficulty: '🌱 入门',
    difficultyEn: '🌱 Beginner',
    path: '/games/tokenizer'
  },
  {
    id: 'attention',
    title: '注意力填词',
    titleEn: 'Attention Fill',
    subtitle: '大模型注意力机制',
    subtitleEn: 'LLM Attention',
    emoji: '👁️',
    gradient: 'from-purple-500 to-pink-500',
    description: '看看模型在预测下一个词时，在关注哪些词——可视化注意力权重',
    descriptionEn: 'Visualize which words the model focuses on',
    duration: '约 4 分钟',
    durationEn: '~4 min',
    difficulty: '🌱 入门',
    difficultyEn: '🌱 Beginner',
    path: '/games/attention'
  },
  {
    id: 'valley',
    title: '山谷探险',
    titleEn: 'Valley Adventure',
    subtitle: '梯度下降',
    subtitleEn: 'Gradient Descent',
    emoji: '🏔️',
    gradient: 'from-orange-500 to-red-500',
    description: '蒙眼走下山谷！体验梯度和学习率的直觉',
    descriptionEn: 'Walk down the valley! Feel gradient and learning rate',
    duration: '约 5 分钟',
    durationEn: '~5 min',
    difficulty: '🌱 入门',
    difficultyEn: '🌱 Beginner',
    path: '/games/valley'
  },
  {
    id: 'embedding',
    title: '词向量空间',
    titleEn: 'Word Vector Space',
    subtitle: '词语的语义位置',
    subtitleEn: 'Semantic Positions',
    emoji: '🧭',
    gradient: 'from-violet-500 to-purple-500',
    description: '在向量空间中探索词语的含义——相似的词靠得更近',
    descriptionEn: 'Explore word meanings in vector space',
    duration: '约 6 分钟',
    durationEn: '~6 min',
    difficulty: '🌱 入门',
    difficultyEn: '🌱 Beginner',
    path: '/games/embedding'
  },
  {
    id: 'gradient',
    title: '梯度赛车',
    titleEn: 'Gradient Racing',
    subtitle: '学习率优化挑战',
    subtitleEn: 'Learning Rate Challenge',
    emoji: '🏎️',
    gradient: 'from-amber-500 to-yellow-500',
    description: '调整学习率，让小球平稳滚到山谷！体验梯度下降的震荡问题',
    descriptionEn: 'Adjust learning rate to reach the valley smoothly',
    duration: '约 6 分钟',
    durationEn: '~6 min',
    difficulty: '🚀 进阶',
    difficultyEn: '🚀 Intermediate',
    path: '/games/gradient'
  },
  {
    id: 'guess',
    title: '猜字大师',
    titleEn: 'Guess Master',
    subtitle: 'LLM 训练过程',
    subtitleEn: 'LLM Training',
    emoji: '🤖',
    gradient: 'from-blue-500 to-cyan-500',
    description: '亲手训练一个"迷你模型"，看它怎么从随机猜测→学会猜字',
    descriptionEn: 'Train a mini model from random to smart',
    duration: '约 8 分钟',
    durationEn: '~8 min',
    difficulty: '🚀 进阶',
    difficultyEn: '🚀 Intermediate',
    path: '/games/guess'
  },
  {
    id: 'transformer-stack',
    title: 'Transformer 堆叠',
    titleEn: 'Transformer Stack',
    subtitle: '层数与理解深度',
    subtitleEn: 'Layers & Depth',
    emoji: '🏗️',
    gradient: 'from-amber-500 to-orange-500',
    description: '看看堆叠更多 Transformer 层如何让理解越来越深',
    descriptionEn: 'See how stacking more layers deepens understanding',
    duration: '约 7 分钟',
    durationEn: '~7 min',
    difficulty: '🚀 进阶',
    difficultyEn: '🚀 Intermediate',
    path: '/games/transformer-stack'
  },
  {
    id: 'loss-surface',
    title: 'Loss 曲面探险',
    titleEn: 'Loss Surface Explorer',
    subtitle: '优化器可视化',
    subtitleEn: 'Optimizer Visualization',
    emoji: '🌋',
    gradient: 'from-emerald-500 to-teal-500',
    description: '在高维 Loss 曲面上导航，对比不同优化器的效果',
    descriptionEn: 'Navigate the loss surface with different optimizers',
    duration: '约 8 分钟',
    durationEn: '~8 min',
    difficulty: '🚀 进阶',
    difficultyEn: '🚀 Intermediate',
    path: '/games/loss-surface'
  },
  {
    id: 'detective',
    title: '侦探贝叶斯',
    titleEn: 'Detective Bayes',
    subtitle: '概率推理 · 贝叶斯定理',
    subtitleEn: 'Bayesian Reasoning',
    emoji: '🕵️',
    gradient: 'from-emerald-500 to-teal-500',
    description: '用侦探推理的方式理解条件概率和先验的力量',
    descriptionEn: 'Understand conditional probability through detective work',
    duration: '约 6 分钟',
    durationEn: '~6 min',
    difficulty: '🎯 值得',
    difficultyEn: '🎯 Worth it',
    path: '/games/detective'
  },
  {
    id: 'training',
    title: '训练之旅',
    titleEn: 'Training Journey',
    subtitle: '大模型训练流程',
    subtitleEn: 'LLM Training Pipeline',
    emoji: '🏋️',
    gradient: 'from-indigo-500 to-violet-500',
    description: '探索预训练→SFT→RLHF/DPO，了解 ChatGPT 是如何变聪明的',
    descriptionEn: 'Explore Pretrain→SFT→RLHF/DPO, see how ChatGPT became smart',
    duration: '约 7 分钟',
    durationEn: '~7 min',
    difficulty: '🚀 进阶',
    difficultyEn: '🚀 Intermediate',
    path: '/games/training'
  }
]

// 用 localStorage 存游戏进度
function getProgress(): Record<string, { completed: boolean; score: number }> {
  try {
    const data = localStorage.getItem('aiscope_progress')
    if (data) return JSON.parse(data)
  } catch (e) {}
  return {}
}

export default function GamesPage() {
  const [progress, setProgress] = useState<Record<string, { completed: boolean; score: number }>>({})
  const { lang } = useI18n()
  const content = labels[lang] || labels.zh

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  const completedCount = Object.values(progress).filter(p => p.completed).length

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10 container-width">
            <div className="flex items-center gap-3 mb-4 animate-slide-up">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-accent font-medium">{content.title} · {content.subtitle}</span>
            </div>
            <h1 className="font-heading text-5xl font-bold mb-6 animate-slide-up animation-delay-100">
              {content.heroTitle}<span className="gradient-text">{content.heroTitleAccent}</span>
            </h1>
            <p className="text-xl text-dark-400 mb-8 max-w-2xl animate-slide-up animation-delay-200">
              {content.heroDesc}<span className="text-primary font-medium">{content.heroDescAccent}</span>{content.heroDescSuffix}
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-300">
              <div className="glass-card px-6 py-4 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{completedCount}/11</div>
                  <div className="text-xs text-dark-500">{content.completed}</div>
                </div>
              </div>
              <div className="glass-card px-6 py-4 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(completedCount / 11 * 100)}%</div>
                  <div className="text-xs text-dark-500">{content.progress}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="section-padding pt-0">
          <div className="container-width">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game, idx) => {
                const gameProgress = progress[game.id]
                const isCompleted = gameProgress?.completed
                const score = gameProgress?.score || 0
                const isZh = lang === 'zh'

                return (
                  <Link key={game.id} to={game.path} className="block group">
                    <Card hover className="relative overflow-hidden h-full" style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${game.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

                      {isCompleted && (
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-green-400" />
                        </div>
                      )}

                      <div className="text-6xl mb-4">{game.emoji}</div>
                      <h3 className="font-heading text-2xl font-bold mb-2">
                        {isZh ? game.title : game.titleEn}
                      </h3>
                      <p className="text-primary text-sm font-medium mb-3">
                        {isZh ? game.subtitle : game.subtitleEn}
                      </p>
                      <p className="text-dark-400 text-sm mb-6">
                        {isZh ? game.description : game.descriptionEn}
                      </p>

                      <div className="flex items-center justify-between text-xs text-dark-500 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <span>{isZh ? game.duration : game.durationEn}</span>
                          <span>{isZh ? game.difficulty : game.difficultyEn}</span>
                        </div>
                        <div className={`text-sm font-medium ${isCompleted ? 'text-green-400' : 'text-primary group-hover:translate-x-1 transition-transform'}`}>
                          {isCompleted ? `✓ ${content.completed} ${score > 0 ? `(${score}${content.scoreUnit})` : ''}` : '→'}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* 游戏后的知识 */}
            <Card className="mt-12">
              <div className="flex items-start gap-4">
                <Brain className="w-10 h-10 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-xl font-semibold mb-2">
                    {content.afterGames} 11 {content.gamesYouWill}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-dark-400 mt-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary shrink-0" />
                      <span><strong>{content.attentionMechanism}</strong>{content.separator}{content.attentionMechanismDesc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-secondary shrink-0" />
                      <span><strong>{content.attentionWeights}</strong>{content.separator}{content.attentionWeightsDesc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent shrink-0" />
                      <span><strong>{content.gradientDescent}</strong>{content.separator}{content.gradientDescentDesc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span><strong>{content.learningRate}</strong>{content.separator}{content.learningRateDesc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400 shrink-0" />
                      <span><strong>{content.llmTraining}</strong>{content.separator}{content.llmTrainingDesc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400 shrink-0" />
                      <span><strong>{content.bayesian}</strong>{content.separator}{content.bayesianDesc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}
