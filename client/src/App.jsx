import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Registration from './pages/Registration'

import Dashboard from './pages/Dashboard'
import Game from './pages/Game'
import GameMemoryMatch from './pages/games/gameMemoryMatch'
import GameBubblePop from './pages/games/gameBubblePop'
import GameTileSlider from './pages/games/gameTileSlider'
import GameGame2048 from './pages/games/gameGame2048'
import GameColoring from './pages/games/gameColoring'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/game" element={<Game />} />
      <Route path="/gameMemoryMatch" element={<GameMemoryMatch />} />
      <Route path="/gameBubblePop" element={<GameBubblePop />} />
      <Route path="/gameTileSlider" element={<GameTileSlider />} />
      <Route path="/game2048" element={<GameGame2048 />} />
      <Route path="/gameColoring" element={<GameColoring />} />
    </Routes>
  )
}

export default App
