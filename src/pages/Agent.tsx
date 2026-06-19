import { Bot, Wrench, Users, MemoryStick, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { useI18n } from '../i18n/context'
import { agentContent } from '../i18n/agent'

const iconMap = { Bot, Wrench, Users, MemoryStick }

export default function AgentPage() {
  const { lang } = useI18n()
  const t = agentContent[lang]

  const features = t.features.map((f, i) => ({
    ...f,
    icon: [Bot, Wrench, Users, MemoryStick][i],
    color: ['from-primary to-secondary', 'from-accent to-primary', 'from-secondary to-accent', 'from-emerald-500 to-teal-500'][i],
  }))

  const workflow = t.workflow.map((w, i) => ({
    ...w,
    color: ['border-primary', 'border-secondary', 'border-accent', 'border-emerald-400'][i],
  }))

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 container-width">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-dark-400">{t.comingSoon}</span>
              </div>

              <h1 className="font-heading text-5xl font-bold mb-6 animate-slide-up">
                <span className="gradient-text">{t.heroTitle}</span>
              </h1>
              <p className="text-xl text-dark-400 mb-8 animate-slide-up animation-delay-100">
                {t.heroDesc}
              </p>

              {/* Coming Soon Preview */}
              <div className="glass-card p-8 animate-slide-up animation-delay-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {workflow.map((item) => (
                    <div key={item.step} className="text-center">
                      <div className={`w-12 h-12 rounded-xl border-2 ${item.color} mx-auto mb-3 flex items-center justify-center text-xl font-bold`}>
                        {item.step}
                      </div>
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-xs text-dark-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="section-padding">
          <div className="container-width">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold mb-4">
                {lang === 'zh' ? (
                  <>将学到的<span className="gradient-text">核心概念</span></>
                ) : (
                  <>Core Concepts <span className="gradient-text">You'll Learn</span></>
                )}
              </h2>
              <p className="text-dark-400 max-w-2xl mx-auto">
                {t.coreConceptsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 text-2xl`}>
                        {feature.emoji}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-dark-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Agent Workflow */}
        <section className="section-padding bg-dark-50/30">
          <div className="container-width">
            <h2 className="font-heading text-3xl font-bold mb-8">
              {lang === 'zh' ? (
                <>Agent <span className="gradient-text">工作流</span></>
              ) : (
                <>Agent <span className="gradient-text">Workflow</span></>
              )}
            </h2>

            <Card className="mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {workflow.map((step, index) => (
                  <div key={step.step} className="flex items-center">
                    <div className={`w-20 h-20 rounded-2xl border-2 ${step.color} flex flex-col items-center justify-center`}>
                      <span className="text-2xl font-bold">{step.step}</span>
                      <span className="text-xs mt-1">{step.title}</span>
                    </div>
                    {index < workflow.length - 1 && (
                      <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-white/20 to-transparent mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-heading text-lg font-semibold mb-4">🔄 {t.reactTitle}</h3>
                <p className="text-dark-400 text-sm mb-4">
                  {t.reactDesc}
                </p>
                <div className="p-4 rounded-xl bg-primary/10 font-mono text-sm">
                  <p className="text-primary">{t.thinking}: {t.thinkingExample}</p>
                  <p className="text-secondary mt-2">{t.action}: {t.actionExample}</p>
                  <p className="text-accent mt-2">{t.observation}: {t.observationExample}</p>
                  <p className="text-emerald-400 mt-2">{t.answer}: {t.answerExample}</p>
                </div>
              </Card>

              <Card>
                <h3 className="font-heading text-lg font-semibold mb-4">🛠️ {t.toolsTitle}</h3>
                <p className="text-dark-400 text-sm mb-4">
                  {t.toolsDesc}
                </p>
                <div className="space-y-3">
                  {t.tools.map((tool) => (
                    <div key={tool.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-xl">{tool.icon}</span>
                      <div>
                        <code className="text-sm text-primary">{tool.name}</code>
                        <p className="text-xs text-dark-500">{tool.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-width">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold mb-4">
                {lang === 'zh' ? (
                  <>准备好成为 <span className="gradient-text">Agent 开发者</span>？</>
                ) : (
                  <>Ready to Become an <span className="gradient-text">Agent Developer</span>?</>
                )}
              </h2>
              <p className="text-dark-400 mb-8 max-w-xl mx-auto">
                {t.ctaDesc}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="#"
                  className="px-8 py-4 rounded-xl font-heading font-semibold text-lg glass-card hover:bg-white/10 transition-all cursor-not-allowed opacity-50"
                >
                  {t.stayTuned}
                </a>
                <Link
                  to="/attention"
                  className="px-8 py-4 rounded-xl font-heading font-semibold text-lg glow-button"
                >
                  {t.learnAttention}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}