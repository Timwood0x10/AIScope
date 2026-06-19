import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKeys } from './translations'

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: TranslationKeys
  isTransitioning: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'aiscope_lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'zh') {
        return saved
      }
      return 'zh'
    }
    return 'zh'
  })

  const [isTransitioning, setIsTransitioning] = useState(false)

  const setLang = (newLang: Language) => {
    if (newLang === lang) return
    
    // 触发过渡动画
    setIsTransitioning(true)
    
    // 短暂延迟后切换语言
    setTimeout(() => {
      setLangState(newLang)
      localStorage.setItem(STORAGE_KEY, newLang)
      
      // 延迟后恢复
      setTimeout(() => {
        setIsTransitioning(false)
      }, 200)
    }, 200)
  }

  const t = translations[lang]

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isTransitioning }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || path
}
