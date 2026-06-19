import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/context'
import Home from './pages/Home'
import Attention from './pages/Attention'
import Math from './pages/Math'
import RAG from './pages/RAG'
import Agent from './pages/Agent'
import Playground from './pages/Playground'
import LibraryGame from './pages/games/LibraryGame'
import ValleyGame from './pages/games/ValleyGame'
import GuessGame from './pages/games/GuessGame'
import DetectiveGame from './pages/games/DetectiveGame'
import AttentionGame from './pages/games/AttentionGame'
import GradientGame from './pages/games/GradientGame'
import TrainingGame from './pages/games/TrainingGame'
import TokenizerGame from './pages/games/TokenizerGame'
import EmbeddingGame from './pages/games/EmbeddingGame'
import TransformerStackGame from './pages/games/TransformerStackGame'
import LossSurfaceGame from './pages/games/LossSurfaceGame'

// vite.config.ts 的 base 在构建时注入到 import.meta.env.BASE_URL，
// 这里去掉末尾的 / 作为 BrowserRouter 的 basename，
// 这样 GitHub Pages 子路径部署时路由才会正常工作
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

function App() {
  return (
    <I18nProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attention" element={<Attention />} />
          <Route path="/math" element={<Math />} />
          <Route path="/rag" element={<RAG />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/games" element={<Playground />} />
          <Route path="/games/library" element={<LibraryGame />} />
          <Route path="/games/valley" element={<ValleyGame />} />
          <Route path="/games/guess" element={<GuessGame />} />
          <Route path="/games/detective" element={<DetectiveGame />} />
          <Route path="/games/attention" element={<AttentionGame />} />
          <Route path="/games/gradient" element={<GradientGame />} />
          <Route path="/games/training" element={<TrainingGame />} />
          <Route path="/games/tokenizer" element={<TokenizerGame />} />
          <Route path="/games/embedding" element={<EmbeddingGame />} />
          <Route path="/games/transformer-stack" element={<TransformerStackGame />} />
          <Route path="/games/loss-surface" element={<LossSurfaceGame />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
