import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react"
import { apiRequest } from "../config/api"
import { useUser } from "../context/UserContext"
import { io } from "socket.io-client"

export default function DirectMessages() {
    const { user } = useUser()
    const location = useLocation()
    const [selectedUser, setSelectedUser] = useState(null)
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const messagesEndRef = useRef(null)
    const socketRef = useRef(null)
    const selectedUserRef = useRef(null) // Keep track of selectedUser for socket callback

    // Update ref whenever selectedUser changes
    useEffect(() => {
        selectedUserRef.current = selectedUser;
        if (selectedUser) {
            fetchMessages(selectedUser.id || selectedUser._id);
        }
    }, [selectedUser]);

    // Initial setup: Connect socket and fetch conversations
    useEffect(() => {
        // Initialize socket connection
        const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5002", {
            withCredentials: true
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to socket server");
            if (user?._id) {
                socket.emit("join_user_room", user._id);
            }
        });

        socket.on("receive_message", (message) => {
            // For simplicity, we'll refresh conversations list to update previews/unread
            fetchConversations();

            // Check against ref to see if we are currently chatting with the sender/recipient
            const currentUser = selectedUserRef.current;

            if (currentUser && (message.sender === currentUser.id || message.sender === currentUser._id ||
                message.recipient === currentUser.id || message.recipient === currentUser._id)) {

               setMessages(prev => {
                   // Avoid duplicates if we already optimistically added it (though ID check helps)
                   if (prev.some(m => m.id === message._id)) return prev;

                   return [...prev, {
                       id: message._id,
                       text: message.text,
                       sent: message.sender === user?._id,
                       timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                   }]
               });
            }
        });

        fetchConversations();

        // Check if we navigated here with a specific user to chat with
        const stateUser = location.state?.selectedUser;
        if (stateUser) {
            handleUserSelect(stateUser);
        }

        return () => {
            socket.disconnect();
        };
    }, [user?._id]);

    // Re-join room if user changes (e.g. login)
    useEffect(() => {
        if (socketRef.current && user?._id) {
            socketRef.current.emit("join_user_room", user._id);
        }
    }, [user?._id]);

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchConversations = async () => {
        try {
            const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/messages/conversations`)

            const formatted = data.map(c => ({
                id: c.id,
                _id: c.id, // Keep both for compatibility
                name: c.name,
                avatar: c.name ? c.name.substring(0, 2).toUpperCase() : "??",
                online: false, // Need online status logic (e.g. via socket)
                lastMessage: c.lastMessage,
                timestamp: new Date(c.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                    ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date(c.timestamp).toLocaleDateString(),
                unread: c.unread,
                color: "bg-blue-500" // Random or deterministic color
            }));

            setConversations(formatted);

        } catch (error) {
            console.error("Error fetching conversations:", error)
        }
    }

    const fetchMessages = async (userId) => {
        try {
            const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/messages/${userId}`)

            const formatted = data.map(m => ({
                id: m._id,
                text: m.text,
                sent: m.sender === user?._id,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setMessages(formatted);

            // Mark as read locally (backend does it on fetch)
            setConversations(prev => prev.map(c => {
                if (c.id === userId) {
                    return { ...c, unread: 0 };
                }
                return c;
            }));

        } catch (error) {
            console.error("Error fetching messages:", error)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleUserSelect = (userData) => {
        // Normalise user object
        const userObj = {
            id: userData.id || userData._id,
            _id: userData.id || userData._id,
            name: userData.name,
            avatar: userData.name ? userData.name.substring(0, 2).toUpperCase() : "??",
            color: "bg-blue-500", // Default
            ...userData
        };
        setSelectedUser(userObj);
        // Messages fetched via useEffect
    }

    const handleBack = () => {
        setSelectedUser(null)
        setMessages([])
    }

    const handleSendMessage = async () => {
        if (messageInput.trim() && selectedUser) {
            const tempId = Date.now();
            const text = messageInput;

            // Optimistic update
            const newMessage = {
                id: tempId,
                text: text,
                sent: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, newMessage]);
            setMessageInput("");

            try {
                await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/messages`, {
                    method: 'POST',
                    body: JSON.stringify({
                        recipientId: selectedUser.id || selectedUser._id,
                        text: text
                    })
                });

                // Refresh conversations to update last message
                fetchConversations();

            } catch (error) {
                console.error("Error sending message:", error);
                // Remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.id !== tempId));
                alert("Failed to send message");
            }
        }
    }

    const filteredUsers = conversations.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        {filteredUsers.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => handleUserSelect(u)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 text-left ${selectedUser?.id === u.id ? 'bg-gray-100' : ''
                                    }`}
                            >
                                <div className="relative">
                                    <div className={`w-12 h-12 ${u.color} rounded-full flex items-center justify-center`}>
                                        <span className="text-white font-bold text-sm">{u.avatar}</span>
                                    </div>
                                    {u.online && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="font-medium text-[#2d2d2d] truncate">{u.name}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{u.timestamp}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm text-gray-500 truncate">{u.lastMessage}</p>
                                        {u.unread > 0 && (
                                            <span className="h-5 min-w-5 px-1.5 bg-[#e74c3c] rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                {u.unread}
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
