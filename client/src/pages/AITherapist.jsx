import React, { useState, useEffect } from "react"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { apiRequest } from "@/config/api"
import { useUser } from "@/context/UserContext"

export default function AITherapist() {
  const { user } = useUser()
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const aiUser = {
    id: "ai-therapist",
    name: "MindBridge AI",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MindBridge",
    status: "online",
    role: "therapist"
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const history = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/history`)
      const formattedMessages = history.map(msg => ({
        id: msg._id || Date.now() + Math.random(),
        content: msg.content,
        senderId: msg.role === 'user' ? user.id : 'ai-therapist',
        timestamp: msg.timestamp
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Failed to load history", error)
    }
  }

  const handleSendMessage = async (text) => {
    // Optimistic update
    const userMsg = {
      id: Date.now(),
      content: text,
      senderId: user.id || localStorage.getItem('uid'),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: text })
      })

      const aiMsg = {
        id: Date.now() + 1,
        content: data.response,
        senderId: 'ai-therapist',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error("AI Chat error", error)
      const errorMsg = {
        id: Date.now() + 1,
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        senderId: 'ai-therapist',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <ChatWindow
        user={aiUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        onBack={() => window.history.back()}
        isTyping={isTyping}
        connectionStatus="connected"
        className="h-full"
      />
    </div>
  )
}
