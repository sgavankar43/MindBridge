import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { apiRequest } from "@/config/api"
import { useUser } from "@/context/UserContext"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DirectMessages() {
  const { user } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  // Check if we navigated here with a specific target user
  useEffect(() => {
    if (location.state?.targetUser) {
      handleSelectUser(location.state.targetUser)
    }
    loadConversations()
  }, [location.state])

  const loadConversations = async () => {
    try {
      const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/chat/conversations`)
      // data is array of { user: {...}, lastMessage: {...} }
      // We map it to what we need
      const mapped = data.map(c => ({
        ...c.user,
        lastMessage: c.lastMessage
      }))
      setConversations(mapped)
    } catch (error) {
      console.error("Failed to load conversations", error)
    }
  }

  const handleSelectUser = async (targetUser) => {
    setActiveUser(targetUser)
    // Load messages
    try {
      const msgs = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/chat/messages/${targetUser._id || targetUser.id}`)
      const formatted = msgs.map(m => ({
        id: m._id,
        content: m.content,
        senderId: m.sender,
        timestamp: m.createdAt
      }))
      setMessages(formatted)
    } catch (error) {
      console.error("Failed to load messages", error)
    }
  }

  const handleSendMessage = async (text) => {
    if (!activeUser) return

    // Optimistic
    const tempId = Date.now()
    const newMsg = {
      id: tempId,
      content: text,
      senderId: user.id || localStorage.getItem('uid'),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMsg])

    try {
      const response = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/chat/send`, {
        method: 'POST',
        body: JSON.stringify({
          recipientId: activeUser._id || activeUser.id,
          content: text
        })
      })

      // Update with real ID if needed, or just leave it
      // Refresh conversations list to update last message
      loadConversations()
    } catch (error) {
      console.error("Failed to send message", error)
      // Ideally show error toast
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden md:flex w-64 flex-col border-r bg-card" />

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List Sidebar */}
        <div className={`w-80 border-r flex flex-col ${activeUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet. Start chatting from the Community page!
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv._id}
                  onClick={() => handleSelectUser(conv)}
                  className={`flex items-center gap-3 p-4 hover:bg-accent cursor-pointer ${activeUser?._id === conv._id ? 'bg-accent' : ''}`}
                >
                  <Avatar>
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback>{conv.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{conv.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage?.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeUser ? 'hidden md:flex' : 'flex'}`}>
           {activeUser ? (
             <ChatWindow
               user={{
                 ...activeUser,
                 id: activeUser._id || activeUser.id, // Normalize ID
                 status: 'offline' // TODO: Real-time status
               }}
               messages={messages}
               onSendMessage={handleSendMessage}
               onBack={() => setActiveUser(null)}
               isTyping={isTyping}
             />
           ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Select a conversation or start a new one
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
