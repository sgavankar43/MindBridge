import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { UserProvider, useUser } from './context/UserContext'
import Login from './pages/Login'
import Registration from './pages/Registration'
import VerificationPending from './pages/VerificationPending'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import AITherapist from './pages/AITherapist'
import DirectMessages from './pages/DirectMessages'
import Profile from './pages/Profile'
import Game from './pages/Game'
import Community from './pages/Community'
import Settings from './pages/Settings'
import GameMemoryMatch from './pages/games/gameMemoryMatch'
import GameBubblePop from './pages/games/gameBubblePop'
import GameTileSlider from './pages/games/gameTileSlider'
import GameGame2048 from './pages/games/gameGame2048'
import GameColoring from './pages/games/gameColoring'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0e6d6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading MindBridge...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component (redirect to dashboard if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0e6d6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading MindBridge...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
        <Route path="/verification-pending" element={<VerificationPending />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AITherapist /></ProtectedRoute>} />
        <Route path="/direct-messages" element={<ProtectedRoute><DirectMessages /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/gameMemoryMatch" element={<ProtectedRoute><GameMemoryMatch /></ProtectedRoute>} />
        <Route path="/gameBubblePop" element={<ProtectedRoute><GameBubblePop /></ProtectedRoute>} />
        <Route path="/gameTileSlider" element={<ProtectedRoute><GameTileSlider /></ProtectedRoute>} />
        <Route path="/game2048" element={<ProtectedRoute><GameGame2048 /></ProtectedRoute>} />
        <Route path="/gameColoring" element={<ProtectedRoute><GameColoring /></ProtectedRoute>} />

        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SidebarProvider>
  )
}

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App
