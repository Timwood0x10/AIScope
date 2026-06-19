import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useI18n } from '../../i18n/context'
import { clsx } from 'clsx'

function LayoutContent({ children }: { children: ReactNode }) {
  const { isTransitioning } = useI18n()
  
  return (
    <div 
      className={clsx(
        'min-h-screen flex flex-col transition-opacity duration-200',
        isTransitioning ? 'opacity-90' : 'opacity-100'
      )}
    >
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return <LayoutContent>{children}</LayoutContent>
}
