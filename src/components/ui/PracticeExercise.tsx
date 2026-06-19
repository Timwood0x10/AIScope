import { useState } from 'react'
import { Play, RotateCcw, Check } from 'lucide-react'
import Card from './Card'
import Button from './Button'
import { useI18n } from '../../i18n/context'

interface Practice {
  id: string
  title: string
  description: string
  initialValues: Record<string, number>
  validate: (values: Record<string, number>) => { correct: boolean; feedback: string }
}

interface PracticeExerciseProps {
  practice: Practice
  onComplete?: () => void
}

export default function PracticeExercise({ practice, onComplete }: PracticeExerciseProps) {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(practice.initialValues).map(([k, v]) => [k, v])
    )
  )
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null)
  const [isChecked, setIsChecked] = useState(false)

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setValues((v) => ({ ...v, [key]: numValue }))
    setIsChecked(false)
    setResult(null)
  }

  const handleCheck = () => {
    const validation = practice.validate(values)
    setResult(validation)
    setIsChecked(true)
    if (validation.correct) {
      onComplete?.()
    }
  }

  const handleReset = () => {
    setValues(
      Object.fromEntries(
        Object.entries(practice.initialValues).map(([k, v]) => [k, v])
      )
    )
    setResult(null)
    setIsChecked(false)
  }

  return (
    <Card>
      <h3 className="font-heading text-lg font-semibold mb-2">{practice.title}</h3>
      <p className="text-dark-400 text-sm mb-4">{practice.description}</p>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.entries(values).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm text-dark-400 mb-1 capitalize">
              {key.replace(/_/g, ' ')}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-dark border border-white/10 text-dark-700 focus:outline-none focus:border-primary font-mono"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <Button onClick={handleCheck} variant="primary" size="sm" className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          {isZh ? '检查答案' : 'Check Answer'}
        </Button>
        <Button onClick={handleReset} variant="ghost" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          {isZh ? '重置' : 'Reset'}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl ${
          result.correct
            ? 'bg-green-500/20 border border-green-500/30'
            : 'bg-amber-500/20 border border-amber-500/30'
        }`}>
          <p className={result.correct ? 'text-green-400 font-medium' : 'text-amber-400 font-medium'}>
            {result.correct ? (isZh ? '✓ 正确！' : '✓ Correct!') : (isZh ? '提示' : 'Hint')}
          </p>
          <p className="text-dark-300 text-sm mt-1">{result.feedback}</p>
        </div>
      )}
    </Card>
  )
}
