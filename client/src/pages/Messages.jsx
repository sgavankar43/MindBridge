import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { Send, Plus, MessageSquare, Trash2, MoreVertical } from "lucide-react"
import { apiRequest } from "../config/api"

export default function Messages() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const messagesEndRef = useRef(null)

  const activeSession = sessions.find(s => s._id === activeSessionId)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages, isTyping])

  const fetchSessions = async () => {
    setLoadingSessions(true)
    try {
      const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/sessions`)
      setSessions(data)
      if (data.length > 0) {
        setActiveSessionId(data[0]._id)
      } else {
        // Automatically start a new session if none exist
        // handleNewSession()
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() && (activeSessionId || sessions.length === 0)) {
      const userMessage = inputMessage;
      setInputMessage("");

      // Optimistic update
      const newMessage = {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString()
      };

      if (activeSessionId) {
        setSessions(prev => prev.map(session => {
          if (session._id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: new Date().toISOString()
            }
          }
          return session
        }));
      }

      setIsTyping(true);

      try {
        const response = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/message`, {
          method: 'POST',
          body: JSON.stringify({
            sessionId: activeSessionId,
            message: userMessage
          })
        });

        const aiMessage = {
          role: "model",
          content: response.response,
          timestamp: new Date().toISOString()
        };

        if (activeSessionId) {
            setSessions(prev => prev.map(session => {
              if (session._id === activeSessionId) {
                return {
                  ...session,
                  title: response.sessionTitle, // Update title if it changed
                  messages: [...session.messages, aiMessage],
                  updatedAt: new Date().toISOString()
                }
              }
              return session
            }));
        } else {
            // New session was created on the fly
            const newSession = {
                _id: response.sessionId,
                title: response.sessionTitle,
                messages: [newMessage, aiMessage],
                updatedAt: new Date().toISOString()
            };
            setSessions([newSession, ...sessions]);
            setActiveSessionId(response.sessionId);
        }

      } catch (error) {
        console.error("Error sending message:", error);
        // Revert optimistic update or show error?
      } finally {
        setIsTyping(false);
      }
    } else if (inputMessage.trim() && !activeSessionId) {
        // If no active session, create one
        handleNewSession(inputMessage);
    }
  }

  const handleNewSession = async (initialMessage = null) => {
    if (initialMessage) {
        // We will just let handleSendMessage handle creation on the fly
        // effectively treating "no active session" + "message" as "create new"
        const userMessage = initialMessage;
        setInputMessage("");
        setIsTyping(true);

        try {
            const response = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/message`, {
                method: 'POST',
                body: JSON.stringify({
                    message: userMessage
                })
            });

            const newSession = {
                _id: response.sessionId,
                title: response.sessionTitle,
                messages: [
                    { role: "user", content: userMessage, timestamp: new Date().toISOString() },
                    { role: "model", content: response.response, timestamp: new Date().toISOString() }
                ],
                updatedAt: new Date().toISOString()
            };
            setSessions([newSession, ...sessions]);
            setActiveSessionId(response.sessionId);
        } catch (error) {
            console.error("Error creating new session with message:", error);
        } finally {
            setIsTyping(false);
        }
        return;
    }

    try {
        const response = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/sessions`, {
            method: 'POST'
        });
        setSessions([response, ...sessions]);
        setActiveSessionId(response._id);
    } catch (error) {
        console.error("Error creating session:", error);
    }
  }

  const handleDeleteSession = async (sessionId) => {
    try {
        await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/ai/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        const newSessions = sessions.filter(s => s._id !== sessionId);
        setSessions(newSessions);
        if (activeSessionId === sessionId) {
            setActiveSessionId(newSessions.length > 0 ? newSessions[0]._id : null);
        }
    } catch (error) {
        console.error("Error deleting session:", error);
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
                onClick={() => handleNewSession()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Chat History</h3>
              {loadingSessions ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading history...</div>
              ) : (
                <div className="space-y-1">
                    {sessions.map((session) => (
                    <div
                        key={session._id}
                        className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeSessionId === session._id
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveSessionId(session._id)}
                    >
                        <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#2d2d2d] truncate">
                            {session.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {session.messages && session.messages.length > 0
                                ? session.messages[session.messages.length - 1].content
                                : "Empty conversation"}
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block">
                            {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        </div>
                        <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session._id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                        >
                        <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    ))}
                </div>
              )}
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
            {activeSession || (!activeSessionId && sessions.length === 0) ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#2d2d2d]">
                          {activeSession ? activeSession.title : "New Conversation"}
                      </h2>
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
                  {(!activeSession || activeSession.messages.length === 0) ? (
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
                      {activeSession.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {(message.role === 'model' || message.role === 'ai') && (
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">AI</span>
                            </div>
                          )}
                          <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                  ? 'bg-[#e74c3c] text-white rounded-br-sm'
                                  : 'bg-gray-100 text-[#2d2d2d] rounded-bl-sm'
                                }`}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                            <span className={`text-xs text-gray-400 mt-1 px-1 block ${message.role === 'user' ? 'text-right' : 'text-left'
                              }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {message.role === 'user' && (
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
