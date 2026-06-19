import { Globe } from 'lucide-react'
import { useI18n } from '../../i18n/context'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  const [transitioning, setTransitioning] = useState(false)
  const [displayLang, setDisplayLang] = useState(lang)

  const handleSwitch = (newLang: 'zh' | 'en') => {
    if (newLang === lang || transitioning) return
    
    // 触发过渡动画
    setTransitioning(true)
    
    // 短暂延迟后切换语言
    setTimeout(() => {
      setLang(newLang)
      setDisplayLang(newLang)
      
      // 淡入
      setTimeout(() => {
        setTransitioning(false)
      }, 150)
    }, 150)
  }

  // 同步 displayLang
  useEffect(() => {
    setDisplayLang(lang)
  }, [lang])

  return (
    <div className="relative flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
      {/* 滑动背景 */}
      <div
        className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
        style={{
          transform: lang === 'zh' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))',
        }}
      />
      
      <button
        onClick={() => handleSwitch('zh')}
        disabled={transitioning}
        className={clsx(
          'relative z-10 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
          lang === 'zh'
            ? 'text-white'
            : 'text-dark-400 hover:text-dark-300',
          transitioning && 'pointer-events-none'
        )}
      >
        中文
      </button>
      <button
        onClick={() => handleSwitch('en')}
        disabled={transitioning}
        className={clsx(
          'relative z-10 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
          lang === 'en'
            ? 'text-white'
            : 'text-dark-400 hover:text-dark-300',
          transitioning && 'pointer-events-none'
        )}
      >
        EN
      </button>
      
      {/* 语言图标 */}
      <Globe className={clsx(
        'relative z-10 w-4 h-4 ml-1 transition-all duration-300',
        transitioning ? 'opacity-50 scale-75' : 'opacity-100 scale-100',
        lang === 'zh' ? 'text-cyan-300' : 'text-blue-300'
      )} />
    </div>
  )
}
