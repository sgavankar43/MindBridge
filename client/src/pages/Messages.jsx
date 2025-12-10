import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { Send, Plus, MessageSquare, Trash2, Edit2, MoreVertical } from "lucide-react"

export default function Messages() {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: "Anxiety Management",
      timestamp: "Today, 2:30 PM",
      preview: "I've been feeling anxious lately...",
      messages: [
        { id: 1, text: "I've been feeling anxious lately and I'm not sure how to cope.", sender: "user", timestamp: "2:30 PM" },
        { id: 2, text: "I understand you're experiencing anxiety. It's completely normal to feel this way, and I'm here to help. Can you tell me more about what triggers these feelings?", sender: "ai", timestamp: "2:31 PM" },
        { id: 3, text: "It usually happens when I have a lot of work deadlines approaching.", sender: "user", timestamp: "2:32 PM" },
        { id: 4, text: "Work-related stress is a common trigger for anxiety. Let's explore some coping strategies together. Have you tried any relaxation techniques like deep breathing or mindfulness?", sender: "ai", timestamp: "2:33 PM" }
      ]
    },
    {
      id: 2,
      title: "Sleep Issues",
      timestamp: "Yesterday, 9:15 PM",
      preview: "I'm having trouble sleeping...",
      messages: [
        { id: 1, text: "I'm having trouble sleeping at night. Any suggestions?", sender: "user", timestamp: "9:15 PM" },
        { id: 2, text: "Sleep difficulties can significantly impact your well-being. Let's work on establishing a healthy sleep routine. What time do you usually go to bed?", sender: "ai", timestamp: "9:16 PM" }
      ]
    },
    {
      id: 3,
      title: "Stress Relief Techniques",
      timestamp: "2 days ago",
      preview: "What are some good stress relief...",
      messages: [
        { id: 1, text: "What are some good stress relief techniques I can practice daily?", sender: "user", timestamp: "3:45 PM" },
        { id: 2, text: "Great question! Here are some effective daily stress relief techniques:\n\n1. Deep breathing exercises (5-10 minutes)\n2. Regular physical activity\n3. Mindfulness meditation\n4. Journaling\n5. Progressive muscle relaxation\n\nWould you like me to guide you through any of these?", sender: "ai", timestamp: "3:46 PM" }
      ]
    }
  ])

  const [activeSessionId, setActiveSessionId] = useState(1)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages, isTyping])

  const handleSendMessage = () => {
    if (inputMessage.trim() && activeSession) {
      const newMessage = {
        id: activeSession.messages.length + 1,
        text: inputMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setSessions(sessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, newMessage],
            preview: inputMessage.substring(0, 50) + "...",
            timestamp: "Just now"
          }
        }
        return session
      }))

      setInputMessage("")
      setIsTyping(true)

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: activeSession.messages.length + 2,
          text: "Thank you for sharing that with me. I'm here to support you through this. Let's explore this further - how long have you been experiencing these feelings?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setSessions(sessions.map(session => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, newMessage, aiResponse]
            }
          }
          return session
        }))
        setIsTyping(false)
      }, 2000)
    }
  }

  const handleNewSession = () => {
    const newSession = {
      id: sessions.length + 1,
      title: "New Conversation",
      timestamp: "Just now",
      preview: "Start a new conversation...",
      messages: []
    }
    setSessions([newSession, ...sessions])
    setActiveSessionId(newSession.id)
  }

  const handleDeleteSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId && sessions.length > 1) {
      setActiveSessionId(sessions[0].id === sessionId ? sessions[1].id : sessions[0].id)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />

      <div className="flex-1 lg:ml-16 pt-28 pb-4">
        <Header />

        <div className="h-[calc(100vh-8rem)] flex">
          {/* Session History Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={handleNewSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Chat History</h3>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeSessionId === session.id
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                      }`}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#2d2d2d] truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {session.preview}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {session.timestamp}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSession(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-[#e74c3c] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#2d2d2d]">MindBridge AI</h4>
                  <p className="text-xs text-gray-500">Your Mental Health Assistant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {activeSession ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#2d2d2d]">{activeSession.title}</h2>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {activeSession.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#2d2d2d] mb-2">
                        Start a conversation with MindBridge AI
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        I'm here to listen and support you. Share what's on your mind, and let's work through it together.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {activeSession.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender === 'ai' && (
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">AI</span>
                            </div>
                          )}
                          <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl ${message.sender === 'user'
                                  ? 'bg-[#e74c3c] text-white rounded-br-sm'
                                  : 'bg-gray-100 text-[#2d2d2d] rounded-bl-sm'
                                }`}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                            </div>
                            <span className={`text-xs text-gray-400 mt-1 px-1 block ${message.sender === 'user' ? 'text-right' : 'text-left'
                              }`}>
                              {message.timestamp}
                            </span>
                          </div>
                          {message.sender === 'user' && (
                            <div className="w-8 h-8 bg-[#e74c3c] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">U</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">AI</span>
                          </div>
                          <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Type your message here..."
                        className="flex-1 px-4 py-3 bg-white rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e74c3c] min-h-[48px] max-h-32"
                        rows={1}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="p-3 bg-[#e74c3c] text-white rounded-xl hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      MindBridge AI can make mistakes. Consider checking important information.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2d2d2d] mb-2">No conversation selected</h3>
                  <p className="text-gray-500">Start a new chat to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
