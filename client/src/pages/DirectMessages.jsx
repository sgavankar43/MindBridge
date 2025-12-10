import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react"

// Dummy data
const dummyUsers = [
    {
        id: 1,
        name: "Dr. Sarah Mitchell",
        avatar: "SM",
        online: true,
        lastMessage: "How are you feeling today?",
        timestamp: "5m ago",
        unread: 2,
        color: "bg-purple-500"
    },
    {
        id: 2,
        name: "Alex Thompson",
        avatar: "AT",
        online: true,
        lastMessage: "Thanks for the support!",
        timestamp: "1h ago",
        unread: 0,
        color: "bg-blue-500"
    },
    {
        id: 3,
        name: "Emma Wilson",
        avatar: "EW",
        online: false,
        lastMessage: "See you in the next session",
        timestamp: "3h ago",
        unread: 1,
        color: "bg-green-500"
    },
    {
        id: 4,
        name: "Dr. John Davis",
        avatar: "JD",
        online: true,
        lastMessage: "Let's schedule our next appointment",
        timestamp: "5h ago",
        unread: 0,
        color: "bg-orange-500"
    },
    {
        id: 5,
        name: "Lisa Martinez",
        avatar: "LM",
        online: false,
        lastMessage: "Great progress this week!",
        timestamp: "Yesterday",
        unread: 0,
        color: "bg-teal-500"
    },
]

const dummyMessages = {
    1: [
        { id: 1, text: "Hi! How have you been?", sent: false, timestamp: "10:30 AM" },
        { id: 2, text: "I've been doing better, thanks for asking!", sent: true, timestamp: "10:32 AM" },
        { id: 3, text: "That's wonderful to hear! What's been helping?", sent: false, timestamp: "10:33 AM" },
        { id: 4, text: "The breathing exercises you recommended have been really helpful.", sent: true, timestamp: "10:35 AM" },
        { id: 5, text: "I'm so glad! Keep practicing them daily.", sent: false, timestamp: "10:36 AM" },
        { id: 6, text: "How are you feeling today?", sent: false, timestamp: "10:38 AM" },
    ],
    2: [
        { id: 1, text: "Thanks for the support!", sent: false, timestamp: "9:15 AM" },
        { id: 2, text: "You're welcome! I'm always here if you need to talk.", sent: true, timestamp: "9:20 AM" },
    ],
    3: [{ id: 1, text: "See you in the next session", sent: false, timestamp: "Yesterday" }],
    4: [{ id: 1, text: "Let's schedule our next appointment", sent: false, timestamp: "8:00 AM" }],
    5: [{ id: 1, text: "Great progress this week!", sent: false, timestamp: "Yesterday" }],
}

export default function DirectMessages() {
    const [selectedUser, setSelectedUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleUserSelect = (user) => {
        setSelectedUser(user)
        setMessages(dummyMessages[user.id] || [])
        setIsTyping(false)
    }

    const handleBack = () => {
        setSelectedUser(null)
        setMessages([])
    }

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: messageInput,
                sent: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages([...messages, newMessage])
            setMessageInput("")
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 2000)
        }
    }

    const filteredUsers = dummyUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sidebar Component
    const ChatSidebar = () => (
        <div className="flex flex-col h-full border-r border-gray-200 bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#2d2d2d] mb-4">Direct Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <p className="text-sm text-gray-500 text-center">No conversations found</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {filteredUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 text-left ${selectedUser?.id === user.id ? 'bg-gray-100' : ''
                                    }`}
                            >
                                <div className="relative">
                                    <div className={`w-12 h-12 ${user.color} rounded-full flex items-center justify-center`}>
                                        <span className="text-white font-bold text-sm">{user.avatar}</span>
                                    </div>
                                    {user.online && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="font-medium text-[#2d2d2d] truncate">{user.name}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{user.timestamp}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                                        {user.unread > 0 && (
                                            <span className="h-5 min-w-5 px-1.5 bg-[#e74c3c] rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                {user.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

    // Chat Window Component
    const ChatWindow = () => {
        if (!selectedUser) {
            // Empty state for desktop
            return (
                <div className="flex flex-col h-full items-center justify-center text-center p-8 bg-white">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2d2d2d] mb-2">No chat selected</h3>
                    <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
                </div>
            )
        }

        return (
            <div className="flex flex-col h-full min-h-0 overflow-hidden bg-white">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-200 p-4">
                    <button onClick={handleBack} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="relative">
                        <div className={`w-10 h-10 ${selectedUser.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{selectedUser.avatar}</span>
                        </div>
                        {selectedUser.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-[#2d2d2d] truncate">{selectedUser.name}</h2>
                        <p className="text-xs text-gray-400">{selectedUser.online ? 'Online' : 'Offline'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Phone className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="hidden md:block p-2 hover:bg-gray-100 rounded-lg">
                            <Video className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full p-8">
                                <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
                                    <div className="max-w-[75%] md:max-w-[60%]">
                                        <div className={`px-4 py-2.5 rounded-2xl ${message.sent
                                                ? 'bg-[#e74c3c] text-white rounded-br-sm'
                                                : 'bg-gray-100 text-[#2d2d2d] rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                        <span className={`text-xs text-gray-400 mt-1 px-1 block ${message.sent ? 'text-right' : 'text-left'}`}>
                                            {message.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="flex items-center gap-2 px-4 py-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm text-gray-500">Typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                        <button className="hidden md:block p-2 hover:bg-gray-100 rounded-lg">
                            <Paperclip className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Smile className="h-5 w-5 text-gray-600" />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim()}
                            className="p-2 bg-[#e74c3c] text-white rounded-lg hover:bg-[#c0392b] disabled:opacity-50"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#f5f0e8]">
            <Sidebar />

            <div className="flex-1 lg:ml-16 p-4 md:p-6 lg:p-8 pt-28">
                <Header />

                {/* Chat Container */}
                <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl shadow-sm">
                    {/* Desktop: Always show sidebar */}
                    <div className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0">
                        <ChatSidebar />
                    </div>

                    {/* Mobile: Show sidebar OR chat window */}
                    {/* Desktop: Always show chat window */}
                    <div className="flex-1 flex min-h-0">
                        {selectedUser ? (
                            <div className="flex-1 flex flex-col">
                                <ChatWindow />
                            </div>
                        ) : (
                            <>
                                {/* Mobile: Show sidebar when no user selected */}
                                <div className="flex-1 md:hidden">
                                    <ChatSidebar />
                                </div>
                                {/* Desktop: Show empty state */}
                                <div className="hidden md:flex flex-1">
                                    <ChatWindow />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
