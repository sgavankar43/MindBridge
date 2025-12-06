import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import Login from './pages/Login'
import Registration from './pages/Registration'
import NotFound from './pages/NotFound'

import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import DirectMessages from './pages/DirectMessages'
import Profile from './pages/Profile'
import Game from './pages/Game'
import Community from './pages/Community'
import GameMemoryMatch from './pages/games/gameMemoryMatch'
import GameBubblePop from './pages/games/gameBubblePop'
import GameTileSlider from './pages/games/gameTileSlider'
import GameGame2048 from './pages/games/gameGame2048'
import GameColoring from './pages/games/gameColoring'

function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-chat" element={<Messages />} />
        <Route path="/direct-messages" element={<DirectMessages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/game" element={<Game />} />
        <Route path="/community" element={<Community />} />
        <Route path="/gameMemoryMatch" element={<GameMemoryMatch />} />
        <Route path="/gameBubblePop" element={<GameBubblePop />} />
        <Route path="/gameTileSlider" element={<GameTileSlider />} />
        <Route path="/game2048" element={<GameGame2048 />} />
        <Route path="/gameColoring" element={<GameColoring />} />

        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SidebarProvider>
  )
}

export default App
