import { useState } from 'react'
import { Eye, Brain, Grid3X3, Sigma } from 'lucide-react'
import Card from './Card'
import { useI18n } from '../../i18n/context'

interface Angle {
  id: string
  icon: typeof Eye
  name: string
  title: string
  description: string
  example: string
  color: string
}

interface MultiAngleProps {
  conceptId: string
  conceptName: string
  angles: Angle[]
}

export default function MultiAngle({
  conceptId,
  conceptName,
  angles
}: MultiAngleProps) {
  const [activeAngle, setActiveAngle] = useState(0)
  const { lang } = useI18n()
  const isZh = lang === 'zh'

  const current = angles[activeAngle]

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-secondary" />
        <h3 className="font-heading text-lg font-semibold">
          {isZh ? '多角度理解：' : 'Multi-Angle Understanding: '}{conceptName}
        </h3>
      </div>

      {/* Angle Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {angles.map((angle, index) => {
          const Icon = angle.icon
          const isActive = index === activeAngle

          return (
            <button
              key={angle.id}
              onClick={() => setActiveAngle(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? `${angle.color} text-white`
                  : 'bg-white/5 hover:bg-white/10 text-dark-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{angle.name}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className={`p-6 rounded-xl ${current.color} bg-opacity-10 border border-current border-opacity-20`}>
        <div className="flex items-center gap-3 mb-3">
          {(() => {
            const Icon = current.icon
            return <Icon className="w-6 h-6" />
          })()}
          <h4 className="font-heading text-xl font-semibold">{current.title}</h4>
        </div>
        <p className="text-dark-300 mb-4">{current.description}</p>
        <div className="p-4 rounded-lg bg-black/20">
          <p className="text-sm text-dark-400 mb-1">{isZh ? '💡 例子' : '💡 Example'}</p>
          <p className="text-dark-200">{current.example}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setActiveAngle((a) => Math.max(0, a - 1))}
          disabled={activeAngle === 0}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          {isZh ? '← 上一个视角' : '← Previous'}
        </button>
        <span className="text-dark-500 text-sm">
          {activeAngle + 1}/{angles.length}
        </span>
        <button
          onClick={() => setActiveAngle((a) => Math.min(angles.length - 1, a + 1))}
          disabled={activeAngle === angles.length - 1}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          {isZh ? '下一个视角 →' : 'Next →'}
        </button>
      </div>
    </Card>
  )
}
