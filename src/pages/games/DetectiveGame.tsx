import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, Search, User, FileText, Scale, RotateCcw, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { useI18n } from '../../i18n/context'

// 嫌疑人和证据数据
const suspects = [
  { id: 'alice', name: 'Alice', emoji: '👩', occupationZh: '公司同事', occupationEn: 'Colleague', descriptionZh: '和你在同一层办公，经常加班到很晚', descriptionEn: 'Works on the same floor, often works late' },
  { id: 'bob', name: 'Bob', emoji: '👨', occupationZh: '前台保安', occupationEn: 'Security Guard', descriptionZh: '负责整栋楼的安保，熟悉所有住户', descriptionEn: 'Handles building security, knows all residents' },
  { id: 'carol', name: 'Carol', emoji: '👩‍🦰', occupationZh: '咖啡店店员', occupationEn: 'Coffee Shop Staff', descriptionZh: '楼下的咖啡店员工，有时会上来送外卖', descriptionEn: 'Coffee shop staff downstairs, sometimes delivers food upstairs' },
  { id: 'david', name: 'David', emoji: '🧔', occupationZh: '外卖骑手', occupationEn: 'Delivery Rider', descriptionZh: '经常出入大楼送餐，不固定', descriptionEn: 'Frequent building visitor for deliveries, irregular schedule' },
]

const clues = [
  {
    id: 'witness',
    titleZh: '目击者证词',
    titleEn: 'Witness Testimony',
    icon: '👁️',
    contentZh: '"我看到一个人在下午5点到6点之间进入了办公室。"',
    contentEn: '"I saw someone enter the office between 5pm and 6pm."',
    evidenceZh: '目击时间：下午5:23',
    evidenceEn: 'Witness time: 5:23 PM'
  },
  {
    id: 'badge',
    titleZh: '门禁记录',
    titleEn: 'Access Card Log',
    icon: '🔔',
    contentZh: '"系统显示：某人的门禁卡在下午5:15刷卡进入。"',
    contentEn: '"System shows: someone\'s access card was swiped in at 5:15 PM."',
    evidenceZh: '刷卡人：非住户（系统显示为公司员工）',
    evidenceEn: 'Swiped by: Non-resident (system shows company employee)'
  },
  {
    id: 'coffee',
    titleZh: '咖啡杯',
    titleEn: 'Coffee Cup',
    icon: '☕',
    contentZh: '"桌上有一杯已经凉了的咖啡，咖啡店logo显示是楼下那家。"',
    contentEn: '"A cold coffee cup on the table; logo matches the coffee shop downstairs."',
    evidenceZh: '杯子底部有口红印',
    evidenceEn: 'Lipstick mark on the bottom of the cup'
  },
  {
    id: 'parking',
    titleZh: '停车场监控',
    titleEn: 'Parking Surveillance',
    icon: '🚗',
    contentZh: '"监控显示：下午5:10有一辆白色轿车停在地下车库入口。"',
    contentEn: '"Surveillance: a white sedan stopped at the garage entrance at 5:10 PM."',
    evidenceZh: '车牌部分遮挡，无法辨认',
    evidenceEn: 'Partially covered plate, unidentifiable'
  }
]

// 真相：Carol 是犯人（她用同事的门禁卡进入，点了咖啡掩饰）
const ANSWER = 'carol'

const questionClueMapping: Record<string, string[]> = {
  alice: ['witness', 'badge', 'parking'],
  bob: ['witness', 'parking'],
  carol: ['witness', 'badge', 'coffee'],
  david: ['coffee'],
}

const suspectClues: Record<string, string[]> = {
  alice: ['badge'],
  bob: ['witness'],
  carol: ['coffee', 'badge'],
  david: ['parking', 'coffee'],
}

function BayesCalc({ prior, truePositive, falsePositive }: { prior: number; truePositive: number; falsePositive: number }) {
  const total = 10000
  const sick = Math.round((prior / 100) * total)
  const healthy = total - sick
  const sickPositive = Math.round((truePositive / 100) * sick)
  const healthyPositive = Math.round((falsePositive / 100) * healthy)
  const totalPositive = sickPositive + healthyPositive
  const prob = totalPositive > 0 ? (sickPositive / totalPositive) * 100 : 0
  return { prob, sickPositive, healthyPositive, totalPositive }
}

export default function DetectiveGame() {
  const { lang } = useI18n()
  const isZh = lang === 'zh'
  const [step, setStep] = useState(0)
  const [currentSuspect, setCurrentSuspect] = useState<string | null>(null)
  const [revealedClues, setRevealedClues] = useState<string[]>([])
  const [askedSuspect, setAskedSuspect] = useState<string | null>(null)
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null)
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null)
  const [bayesResult, setBayesResult] = useState<ReturnType<typeof BayesCalc> | null>(null)

  const revealClue = (clueId: string) => {
    if (!revealedClues.includes(clueId)) {
      setRevealedClues([...revealedClues, clueId])
    }
  }

  const askSuspect = (suspectId: string) => {
    setAskedSuspect(suspectId)
    const clues = questionClueMapping[suspectId] || []
    clues.forEach(c => revealClue(c))
  }

  const makeAccusation = (suspectId: string) => {
    setSelectedSuspect(suspectId)
    setStep(3)
    if (suspectId === ANSWER) {
      setGameResult('win')
    } else {
      setGameResult('lose')
    }
    // 计算贝叶斯
    const result = BayesCalc({ prior: 25, truePositive: 80, falsePositive: 20 })
    setBayesResult(result)
  }

  const reset = () => {
    setStep(0)
    setCurrentSuspect(null)
    setRevealedClues([])
    setAskedSuspect(null)
    setSelectedSuspect(null)
    setGameResult(null)
    setBayesResult(null)
  }

  const complete = () => {
    try {
      const data = JSON.parse(localStorage.getItem('aiscope_progress') || '{}')
      data.detective = { completed: true, score: gameResult === 'win' ? 100 : 50 }
      localStorage.setItem('aiscope_progress', JSON.stringify(data))
    } catch (e) {}
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4">
        <div className="container-width max-w-4xl">
          <Link to="/games" className="text-sm text-dark-500 hover:text-dark-400 flex items-center gap-1 mb-6">
            <ArrowLeft className="w-4 h-4" /> {isZh ? '返回游戏大厅' : 'Back to Games'}
          </Link>

          <div className="glass-card p-8">
            {/* 顶部 */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-5xl mb-3">🕵️</div>
                <h1 className="font-heading text-3xl font-bold mb-1">{isZh ? '侦探贝叶斯' : 'Detective Bayes'}</h1>
                <p className="text-dark-400 text-sm">{isZh ? '用侦探推理的方式理解条件概率' : 'Understand conditional probability through detective work'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-500">{isZh ? '步骤' : 'Step'} {step + 1}/4</div>
                <div className="w-32 h-2 bg-dark-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* 案件背景 */}
            {step === 0 && (
              <div className="animate-fade-in space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-yellow-400" />
                    <h2 className="font-heading text-lg font-semibold text-yellow-400">{isZh ? '案件档案 #2024-001' : 'Case File #2024-001'}</h2>
                  </div>
                  <div className="space-y-3 text-dark-300">
                    <p><strong className="text-white">{isZh ? '案件：' : 'Case:'}</strong>{isZh ? '办公室失窃案' : 'Office Theft'}</p>
                    <p><strong className="text-white">{isZh ? '失窃物品：' : 'Stolen:'}</strong>{isZh ? '一台笔记本电脑 + 若干文件' : 'A laptop + several files'}</p>
                    <p><strong className="text-white">{isZh ? '损失估值：' : 'Loss Value:'}</strong>{isZh ? '约 2 万元' : 'About 20,000 CNY'}</p>
                    <p><strong className="text-white">{isZh ? '案件经过：' : 'Case History:'}</strong></p>
                    <p className="text-sm pl-4 border-l-2 border-slate-500">
                      {isZh
                        ? '昨天下午下班后（大约5-6点），办公室遭到闯入。门没有被撬痕迹，但监控显示有人刷卡进入。现场留下一杯咖啡和一张外卖小票。'
                        : 'Yesterday evening (around 5-6pm), the office was broken into. No signs of forced entry, but surveillance shows someone swiped in. A coffee cup and a food delivery receipt were left at the scene.'}
                    </p>
                    <p className="text-sm text-yellow-400/70 mt-3">
                      {isZh
                        ? '💡 提示：你有 4 个嫌疑人。先调查线索，再逐个询问嫌疑人，最后指认凶手。'
                        : '💡 Tip: You have 4 suspects. Investigate clues first, then interrogate suspects one by one, finally identify the culprit.'}
                    </p>
                  </div>
                </div>

                {/* 4 个嫌疑人 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {suspects.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setCurrentSuspect(s.id); setStep(1) }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-emerald-500/50 transition-all text-center group"
                    >
                      <div className="text-4xl mb-2">{s.emoji}</div>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-dark-500">{isZh ? s.occupationZh : s.occupationEn}</div>
                      <div className="mt-2 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">{isZh ? '调查 →' : 'Investigate →'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 调查线索阶段 */}
            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold mb-1">{isZh ? '🔍 调查线索' : '🔍 Investigate Clues'}</h2>
                    <p className="text-dark-400 text-sm">{isZh ? `点击线索查看详情（已解锁 ${revealedClues.length}/4）` : `Click a clue for details (${revealedClues.length}/4 unlocked)`}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
                    >
                      {isZh ? '询问嫌疑人 →' : 'Interrogate →'}
                    </button>
                  </div>
                </div>

                {/* 线索卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clues.map(clue => {
                    const isRevealed = revealedClues.includes(clue.id)
                    return (
                      <button
                        key={clue.id}
                        onClick={() => revealClue(clue.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isRevealed
                            ? 'bg-white/5 border-emerald-500/50'
                            : 'bg-white/5 border-transparent hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{clue.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium mb-1 flex items-center gap-2">
                              {isZh ? clue.titleZh : clue.titleEn}
                              {isRevealed && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                              {!isRevealed && <span className="text-xs text-dark-500">{isZh ? '🔒 点击解锁' : '🔒 Click to unlock'}</span>}
                            </div>
                            {isRevealed && (
                              <>
                                <p className="text-sm text-dark-400 mb-2">{isZh ? clue.contentZh : clue.contentEn}</p>
                                <div className="text-xs text-yellow-400/80 bg-yellow-400/10 rounded px-2 py-1 inline-block">
                                  📋 {isZh ? clue.evidenceZh : clue.evidenceEn}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* 当前嫌疑人信息 */}
                {currentSuspect && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{suspects.find(s => s.id === currentSuspect)?.emoji}</span>
                      <div>
                        <div className="font-medium">{suspects.find(s => s.id === currentSuspect)?.name}</div>
                        <div className="text-sm text-dark-400">{isZh ? suspects.find(s => s.id === currentSuspect)?.descriptionZh : suspects.find(s => s.id === currentSuspect)?.descriptionEn}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 询问嫌疑人阶段 */}
            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold mb-1">{isZh ? '💬 询问嫌疑人' : '💬 Interrogate Suspects'}</h2>
                    <p className="text-dark-400 text-sm">{isZh ? '点击嫌疑人提问（会揭示相关线索）' : 'Click a suspect to question (will reveal related clues)'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
                    >
                      {isZh ? '指认凶手 →' : 'Identify Culprit →'}
                    </button>
                  </div>
                </div>

                {/* 嫌疑人列表 */}
                <div className="space-y-3">
                  {suspects.map(s => {
                    const hasClues = suspectClues[s.id]?.length > 0
                    const wasAsked = askedSuspect === s.id
                    return (
                      <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-transparent hover:border-emerald-500/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-3xl">{s.emoji}</span>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {s.name}
                                <span className="text-xs text-dark-500">{isZh ? `(${s.occupationZh})` : `(${s.occupationEn})`}</span>
                                {wasAsked && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                              </div>
                              <div className="text-sm text-dark-400 mt-1">{isZh ? s.descriptionZh : s.descriptionEn}</div>
                              {wasAsked && (
                                <div className="mt-2 text-xs text-yellow-400">
                                  🔍 {isZh ? '提供的线索：' : 'Provided clues:'}{isZh
                                    ? suspectClues[s.id]?.map(c => clues.find(cl => cl.id === c)?.titleZh).join('、')
                                    : suspectClues[s.id]?.map(c => clues.find(cl => cl.id === c)?.titleEn).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => askSuspect(s.id)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              wasAsked
                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                : 'bg-white/10 hover:bg-white/20 text-dark-300'
                            }`}
                          >
                              {wasAsked ? (isZh ? '已询问' : 'Questioned') : (isZh ? '询问' : 'Question')}
                            </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 已解锁线索 */}
                {revealedClues.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-sm text-emerald-400 font-medium mb-2">{isZh ? '📋 已解锁线索' : '📋 Unlocked Clues'}</div>
                    <div className="flex flex-wrap gap-2">
                      {revealedClues.map(cId => {
                        const clue = clues.find(c => c.id === cId)
                        return (
                          <span key={cId} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                            {clue?.icon} {isZh ? clue?.titleZh : clue?.titleEn}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 指认凶手 */}
            {step === 3 && (
              <div className="animate-fade-in space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-red-900/30 to-red-950/50 border border-red-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Scale className="w-6 h-6 text-red-400" />
                    <h2 className="font-heading text-xl font-bold text-red-400">{isZh ? '指认凶手' : 'Identify the Culprit'}</h2>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">
                    {isZh
                      ? '根据你收集的线索和询问结果，判断谁是犯人。选择错误也不会立即结束——你还有机会重新分析！'
                      : 'Based on collected clues and interrogation results, determine who is guilty. Wrong selection won\'t end the game — you still have a chance to re-analyze!'}
                  </p>

                  {/* 嫌疑人选择 */}
                  <div className="grid grid-cols-2 gap-3">
                    {suspects.map(s => (
                      <button
                        key={s.id}
                        onClick={() => makeAccusation(s.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          selectedSuspect === s.id
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-transparent bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-3xl mb-1">{s.emoji}</div>
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-xs text-dark-500">{isZh ? s.occupationZh : s.occupationEn}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 结果 */}
                {gameResult && (
                  <div className={`p-6 rounded-2xl border-2 animate-fade-in ${
                    gameResult === 'win'
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-red-500/10 border-red-500/50'
                  }`}>
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">{gameResult === 'win' ? '🎉' : '😱'}</div>
                      <h3 className={`font-heading text-2xl font-bold ${gameResult === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                        {gameResult === 'win' ? (isZh ? '推理正确！' : 'Correct!') : (isZh ? '推理错误！' : 'Wrong!')}
                      </h3>
                      <p className="text-dark-400 text-sm mt-2">
                        {gameResult === 'win'
                          ? `${isZh ? '凶手确实是' : 'The culprit is indeed'} ${suspects.find(s => s.id === ANSWER)?.emoji} ${suspects.find(s => s.id === ANSWER)?.name}！`
                          : `${isZh ? '凶手是' : 'The culprit is'} ${suspects.find(s => s.id === ANSWER)?.emoji} ${suspects.find(s => s.id === ANSWER)?.name}${isZh ? '，不是' : ', not'} ${suspects.find(s => s.id === selectedSuspect)?.emoji} ${suspects.find(s => s.id === selectedSuspect)?.name}.`
                        }
                      </p>
                    </div>

                    {/* 案件复盘 */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">{isZh ? '📋 案件复盘' : '📋 Case Recap'}</h4>
                      <div className="space-y-2 text-sm text-dark-400">
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-emerald-400 font-medium mb-1">{isZh ? '✅ 关键线索 1：门禁记录' : '✅ Key Clue 1: Access Card Log'}</div>
                          <p>{isZh ? '刷卡人是公司员工（非住户），说明凶手有公司门禁卡。' : 'The swiper is a company employee (non-resident), meaning the culprit has company access.'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-emerald-400 font-medium mb-1">{isZh ? '✅ 关键线索 2：咖啡杯' : '✅ Key Clue 2: Coffee Cup'}</div>
                          <p>{isZh ? '咖啡店员工 Carol 有机会接触公司门禁（公司常订她们店的咖啡做活动）。' : 'Coffee shop staff Carol has access to company entry (the company often orders coffee from her shop for events).'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-emerald-400 font-medium mb-1">{isZh ? '✅ 关键线索 3：外卖小票' : '✅ Key Clue 3: Delivery Receipt'}</div>
                          <p>{isZh ? '现场有外卖小票，骑手 David 和 Carol 都可能接触。但 Carol 有门禁卡嫌疑。' : 'A delivery receipt was found; both David and Carol could have touched it. But Carol is the access card suspect.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 贝叶斯视角 */}
                    <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-blue-400">{isZh ? '🧠 用贝叶斯思维分析' : '🧠 Bayesian Analysis'}</h4>
                      </div>
                      <p className="text-sm text-dark-400 mb-3">
                        {isZh
                          ? '在没有新证据前，每个人是凶手的概率是 25%。但加入线索后，概率会重新分配：'
                          : 'Without evidence, everyone has a 25% chance of being guilty. But with clues, probabilities shift:'}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6">👩</span>
                          <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '20%' }}></div>
                          </div>
                          <span className="text-xs text-dark-500 w-12">20%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-6">👨</span>
                          <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '10%' }}></div>
                          </div>
                          <span className="text-xs text-dark-500 w-12">10%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-6">👩‍🦰</span>
                          <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: '55%' }}></div>
                          </div>
                          <span className="text-xs text-red-400 w-12 font-bold">55%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-6">🧔</span>
                          <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '15%' }}></div>
                          </div>
                          <span className="text-xs text-dark-500 w-12">15%</span>
                        </div>
                      </div>
                      <p className="text-xs text-dark-500 mt-2">
                        {isZh
                          ? '💡 结合门禁卡（有公司员工权限）+ 咖啡（咖啡店员工）+ 作案时间匹配，Carol 的嫌疑最大。'
                          : '💡 Combining access card (company employee) + coffee (coffee shop staff) + matching time, Carol is the primary suspect.'}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-dark-400 transition-all flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> {isZh ? '重新推理' : 'Re-analyze'}
                      </button>
                      <Link
                        to="/games"
                        onClick={complete}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-center hover:opacity-90 transition-all"
                      >
                        {isZh ? '返回游戏大厅' : 'Back to Games'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 底部导航 */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-dark-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← {isZh ? '上一步' : 'Previous'}
              </button>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-emerald-400' : 'bg-white/20'}`}
                  />
                ))}
              </div>
              <div className="w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
