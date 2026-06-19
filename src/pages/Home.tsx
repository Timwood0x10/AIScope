import { Link } from 'react-router-dom'
import { Brain, Calculator, BookOpen, Bot, ArrowRight, Sparkles } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { useStore } from '../stores/useStore'
import { useI18n } from '../i18n/context'

const labels = {
  zh: {
    tagline: '交互式 AI 学习平台',
    heroTitle: '探索',
    heroTitleAccent: 'AI 的核心原理',
    heroDesc: '通过交互式可视化，将复杂的 AI 概念变得简单直观。从注意力机制到 Agent 构建，开启你的 AI 学习之旅。',
    startLearning: '开始学习',
    browseMath: '浏览数学基础',
    learningPaths: '学习路径',
    choosePath: '选择你的',
    pathDesc: '从基础概念到高级主题，每条路径都配有交互式可视化，帮助你深入理解。',
    whyChoose: '为什么选择',
    modules: [
      {
        id: 'attention',
        path: '/attention',
        icon: Brain,
        title: '自注意力机制',
        description: '深入理解 Transformer 的核心 - Q/K/V 矩阵、注意力权重、多头注意力',
        color: 'from-primary to-secondary',
        gradient: 'bg-gradient-to-br from-primary/20 to-secondary/20',
        tags: ['Q/K/V', '多头注意力', 'RoPE', '复杂度分析'],
      },
      {
        id: 'math',
        path: '/math',
        icon: Calculator,
        title: '数学基础',
        description: '掌握 AI 背后的数学原理 - 从微积分到信息几何，构建完整的 AGI 数学基石',
        color: 'from-accent to-primary',
        gradient: 'bg-gradient-to-br from-accent/20 to-primary/20',
        tags: ['微积分', '矩阵论', '概率论', '信息几何', '因果推断', '博弈论'],
      },
      {
        id: 'rag',
        path: '/rag',
        icon: BookOpen,
        title: 'RAG 教程',
        description: '学习检索增强生成 - 向量检索、上下文构建、混合检索策略',
        color: 'from-secondary to-accent',
        gradient: 'bg-gradient-to-br from-secondary/20 to-accent/20',
        tags: ['向量嵌入', '相似度检索', '上下文', '混合检索'],
      },
      {
        id: 'agent',
        path: '/agent',
        icon: Bot,
        title: 'Agent 构建',
        description: '构建 AI Agent - ReAct 范式、工具调用、多 Agent 协作',
        color: 'from-emerald-500 to-teal-500',
        gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
        tags: ['ReAct', '工具调用', '多 Agent', '记忆管理'],
        comingSoon: true,
      },
    ],
    features: [
      {
        emoji: '🎨',
        title: '交互式可视化',
        description: '动态图表和动画让你直观理解复杂概念',
      },
      {
        emoji: '⚡',
        title: '纯前端计算',
        description: '无需后端，所有计算都在浏览器中完成',
      },
      {
        emoji: '🚀',
        title: '零门槛学习',
        description: '从入门到进阶，循序渐进的学习路径',
      },
    ],
    comingSoon: '即将上线',
    completed: '已学',
    startLearningBtn: '开始学习',
  },
  en: {
    tagline: 'Interactive AI Learning Platform',
    heroTitle: 'Explore',
    heroTitleAccent: 'Core AI Principles',
    heroDesc: 'Make complex AI concepts simple through interactive visualization. From attention mechanisms to agent building, start your AI learning journey.',
    startLearning: 'Start Learning',
    browseMath: 'Browse Math',
    learningPaths: 'Learning Paths',
    choosePath: 'Choose Your',
    pathDesc: 'From basics to advanced topics, each path includes interactive visualizations to help you understand deeply.',
    whyChoose: 'Why Choose',
    modules: [
      {
        id: 'attention',
        path: '/attention',
        icon: Brain,
        title: 'Self-Attention',
        description: 'Understand Transformer core - Q/K/V matrices, attention weights, multi-head attention',
        color: 'from-primary to-secondary',
        gradient: 'bg-gradient-to-br from-primary/20 to-secondary/20',
        tags: ['Q/K/V', 'Multi-Head', 'RoPE', 'Complexity'],
      },
      {
        id: 'math',
        path: '/math',
        icon: Calculator,
        title: 'Math Basics',
        description: 'Master the math behind AI - from calculus to information geometry',
        color: 'from-accent to-primary',
        gradient: 'bg-gradient-to-br from-accent/20 to-primary/20',
        tags: ['Calculus', 'Matrix', 'Probability', 'Info Geometry', 'Causality', 'Game Theory'],
      },
      {
        id: 'rag',
        path: '/rag',
        icon: BookOpen,
        title: 'RAG Tutorial',
        description: 'Learn RAG - vector retrieval, context building, hybrid search',
        color: 'from-secondary to-accent',
        gradient: 'bg-gradient-to-br from-secondary/20 to-accent/20',
        tags: ['Embeddings', 'Similarity', 'Context', 'Hybrid'],
      },
      {
        id: 'agent',
        path: '/agent',
        icon: Bot,
        title: 'Agent Building',
        description: 'Build AI Agents - ReAct paradigm, tool calling, multi-agent',
        color: 'from-emerald-500 to-teal-500',
        gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
        tags: ['ReAct', 'Tools', 'Multi-Agent', 'Memory'],
        comingSoon: true,
      },
    ],
    features: [
      {
        emoji: '🎨',
        title: 'Interactive Visualization',
        description: 'Dynamic charts and animations help you intuitively understand complex concepts',
      },
      {
        emoji: '⚡',
        title: 'Pure Frontend',
        description: 'No backend needed, all computations run in browser',
      },
      {
        emoji: '🚀',
        title: 'Zero Barrier',
        description: 'From beginner to advanced, progressive learning paths',
      },
    ],
    comingSoon: 'Coming Soon',
    completed: 'Completed',
    startLearningBtn: 'Start',
  },
}

export default function Home() {
  const progress = useStore((state) => state.progress)
  const { lang } = useI18n()
  const content = labels[lang] || labels.zh

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 container-width px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-dark-400">{content.tagline}</span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-dark-700">{content.heroTitle}</span>
            <br />
            <span className="gradient-text">{content.heroTitleAccent}</span>
          </h1>

          <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-12 animate-slide-up animation-delay-100">
            {content.heroDesc}
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-slide-up animation-delay-200">
            <Link
              to="/attention"
              className="glow-button px-8 py-4 rounded-xl font-heading font-semibold text-lg flex items-center gap-2"
            >
              {content.startLearning}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/math"
              className="px-8 py-4 rounded-xl font-heading font-semibold text-lg border border-white/20 hover:bg-white/5 transition-all"
            >
              {content.browseMath}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-dark-300 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-dark-300 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="section-padding">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4">
              {content.choosePath}<span className="gradient-text">{content.learningPaths}</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              {content.pathDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.modules.map((module, index) => {
              const Icon = module.icon
              const completedCount = progress[module.id as keyof typeof progress]?.length || 0

              return (
                <Link
                  key={module.id}
                  to={module.comingSoon ? '#' : module.path}
                  className={`block ${module.comingSoon ? 'pointer-events-none' : ''}`}
                >
                  <Card
                    hover={!module.comingSoon}
                    className={`relative overflow-hidden ${module.gradient} animate-slide-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {module.comingSoon && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary/30 text-secondary text-sm font-medium">
                        {content.comingSoon}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-heading text-xl font-semibold mb-2">
                          {module.title}
                        </h3>
                        <p className="text-dark-400 text-sm mb-4">
                          {module.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {module.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-md bg-white/5 text-dark-300 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {!module.comingSoon && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                                style={{ width: `${Math.min(100, (completedCount / 10) * 100)}%` }}
                              />
                            </div>
                            <span className="text-dark-400">
                              {completedCount > 0 ? `${completedCount} ${content.completed}` : content.startLearningBtn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!module.comingSoon && (
                      <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-6 h-6 text-dark-400" />
                      </div>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-dark-50/30">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4">
              {content.whyChoose} <span className="gradient-text">AIScope</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <Card
                key={feature.title}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
