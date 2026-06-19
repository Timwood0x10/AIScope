import { Link, useLocation } from 'react-router-dom'
import { Brain, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useI18n } from '../../i18n/context'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { lang, t } = useI18n()

  const navItems = [
    { path: '/', key: 'home', icon: '🏠' },
    { path: '/attention', key: 'attention', icon: '🧠' },
    { path: '/math', key: 'math', icon: '📐' },
    { path: '/rag', key: 'rag', icon: '📚' },
    { path: '/agent', key: 'agent', icon: '🤖' },
    { path: '/games', key: 'games', icon: '🎮' },
  ] as const

  const getLabel = (key: keyof typeof t.nav) => {
    return t.nav[key] || key
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <nav className="container-width px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-dark-700">
            <span className="gradient-text">AIScope</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                'hover:bg-white/5',
                location.pathname === item.path
                  ? 'text-primary bg-primary/10'
                  : 'text-dark-400 hover:text-dark-700'
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {getLabel(item.key)}
            </Link>
          ))}
        </div>

        {/* Language Switcher & Mobile Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-dark-700" />
            ) : (
              <Menu className="w-6 h-6 text-dark-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 glass-card border-t border-white/5 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <div className="px-4 py-2 mb-2">
              <LanguageSwitcher />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'block px-4 py-3 rounded-lg font-medium transition-all',
                  location.pathname === item.path
                    ? 'text-primary bg-primary/10'
                    : 'text-dark-400 hover:bg-white/5 hover:text-dark-700'
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {getLabel(item.key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
