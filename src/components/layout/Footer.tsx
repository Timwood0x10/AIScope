import { Github, Heart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/context'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/10 bg-dark/50 backdrop-blur-sm">
      <div className="container-width px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <span className="font-heading font-bold text-xl text-dark-700">
                <span className="gradient-text">AIScope</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-primary">{t.footer.motto}</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-dark-700 mb-4">{t.footer.learningPath}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/attention" className="text-dark-400 hover:text-primary transition-colors">
                  {t.footer.selfAttention}
                </Link>
              </li>
              <li>
                <Link to="/math" className="text-dark-400 hover:text-primary transition-colors">
                  {t.footer.math}
                </Link>
              </li>
              <li>
                <Link to="/rag" className="text-dark-400 hover:text-primary transition-colors">
                  {t.footer.rag}
                </Link>
              </li>
              <li>
                <Link to="/agent" className="text-dark-400 hover:text-primary transition-colors">
                  {t.footer.agent}
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-dark-400 hover:text-primary transition-colors">
                  {t.footer.games}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-dark-700 mb-4">{t.footer.about}</h4>
            <p className="text-dark-400 text-sm leading-relaxed">
              {t.footer.aboutDesc}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://github.com/TimWood0x10/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-dark-400 hover:text-white transition-all border border-white/10 hover:border-white/20"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium">TimWood0x10</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-400 text-sm flex items-center gap-2">
            {t.footer.madeWith} <Heart className="w-4 h-4 text-red-500 animate-pulse" />
          </p>
          <p className="text-dark-500 text-sm">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
