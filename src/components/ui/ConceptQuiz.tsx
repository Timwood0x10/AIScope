import { useState } from 'react'
import { CheckCircle, XCircle, Lightbulb, Brain, Target, Compass } from 'lucide-react'
import Card from './Card'
import { useI18n } from '../../i18n/context'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  hint?: string
}

interface ConceptQuizProps {
  conceptId: string
  conceptName: string
  questions: QuizQuestion[]
  onComplete?: (score: number) => void
}

export default function ConceptQuiz({
  conceptId,
  conceptName,
  questions,
  onComplete
}: ConceptQuizProps) {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (index: number) => {
    if (showExplanation) return

    setSelectedAnswer(index)
    setShowExplanation(true)

    if (index === question.correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setIsCompleted(true)
      onComplete?.(score)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setIsCompleted(false)
  }

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 60

    return (
      <Card className="text-center">
        <div className="text-6xl mb-4">
          {passed ? '🎉' : '💪'}
        </div>
        <h3 className="font-heading text-2xl font-bold mb-2">
          {passed ? (isZh ? '太棒了！' : 'Great!') : (isZh ? '继续加油！' : 'Keep going!')}
        </h3>
        <p className="text-dark-400 mb-4">
          {isZh ? `你在 "${conceptName}" 的测验中得到了` : `Your "${conceptName}" quiz score:`}
        </p>
        <div className="text-5xl font-bold gradient-text mb-4">
          {percentage}%
        </div>
        <p className="text-dark-500 text-sm mb-6">
          {isZh ? `正确 ${score}/${questions.length} 题` : `Correct: ${score}/${questions.length}`}
        </p>
        <button
          onClick={resetQuiz}
          className="px-6 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        >
          {isZh ? '再试一次' : 'Try Again'}
        </button>
      </Card>
    )
  }

  return (
    <Card>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-dark-400 mb-2">
          <span>问题 {currentQuestion + 1}/{questions.length}</span>
          <span>{score} 分</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="font-heading text-lg font-semibold mb-4">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          let bgClass = 'bg-white/5 hover:bg-white/10'
          let borderClass = 'border-white/10'

          if (showExplanation) {
            if (index === question.correctIndex) {
              bgClass = 'bg-green-500/20 border-green-500'
            } else if (index === selectedAnswer) {
              bgClass = 'bg-red-500/20 border-red-500'
            }
          } else if (index === selectedAnswer) {
            bgClass = 'bg-primary/20 border-primary'
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-xl border ${borderClass} transition-all ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {showExplanation && index === question.correctIndex && (
                  <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                )}
                {showExplanation && index === selectedAnswer && index !== question.correctIndex && (
                  <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`p-4 rounded-xl mb-4 ${
          selectedAnswer === question.correctIndex
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          <div className="flex items-start gap-3">
            <Lightbulb className={`w-5 h-5 shrink-0 mt-0.5 ${
              selectedAnswer === question.correctIndex ? 'text-green-400' : 'text-amber-400'
            }`} />
            <div>
              <p className="font-medium mb-1">
                {selectedAnswer === question.correctIndex ? '回答正确！' : '答案解析'}
              </p>
              <p className="text-dark-400 text-sm">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {question.hint && !showExplanation && (
        <details className="mb-4">
          <summary className="text-sm text-accent cursor-pointer hover:underline">
            需要提示？
          </summary>
          <p className="text-dark-500 text-sm mt-2 pl-4 border-l-2 border-accent/30">
            {question.hint}
          </p>
        </details>
      )}

      {/* Next Button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-medium hover:opacity-90 transition-opacity"
        >
          {currentQuestion < questions.length - 1 ? '下一题 →' : '查看结果'}
        </button>
      )}
    </Card>
  )
}
