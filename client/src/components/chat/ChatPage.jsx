import * as React from "react"
import { io } from "socket.io-client"
import { ChatSidebar } from "./ChatSidebar"
import { ChatWindow } from "./ChatWindow"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatAPI, communityAPI } from "@/services/api"
import { getAuthToken, setAuthToken } from "@/services/api"
import { getAuth } from "firebase/auth"
import API_BASE_URL, { SOCKET_URL } from "@/config/api"

export function ChatPage({ className }) {
  const [selectedUserId, setSelectedUserId] = React.useState(null)
  const [selectedCommunityId, setSelectedCommunityId] = React.useState(null)
  const [isCommunityChat, setIsCommunityChat] = React.useState(false)
  const [messages, setMessages] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [communities, setCommunities] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTyping, setIsTyping] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState("disconnected")
  const [socket, setSocket] = React.useState(null)
  const { toast } = useToast()
  const currentUserId = React.useMemo(() => localStorage.getItem('uid'), [])

  // Load conversations from database
  React.useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true)
        // Ensure we have a fresh Firebase ID token
        try {
          const auth = getAuth()
          if (auth?.currentUser) {
            const fresh = await auth.currentUser.getIdToken(true)
            if (fresh) setAuthToken(fresh)
          }
        } catch { }
        const [conversations, communitiesData] = await Promise.all([
          chatAPI.getConversations(),
          communityAPI.getCommunities().catch(() => []),
        ])

        // Transform conversations to user list format
        const usersList = conversations.map(conv => ({
          id: conv.otherUserId,
          name: conv.otherUser?.name || conv.otherUserId?.substring(0, 8) || 'User',
          avatar: conv.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(conv.otherUser?.name || conv.otherUserId)}`,
          status: 'online', // TODO: Implement real status
          lastMessage: conv.lastMessage || '',
          lastMessageTime: new Date(conv.lastMessageTime),
          unreadCount: conv.unreadCount || 0,
          role: conv.otherUser?.role || '',
          isCommunity: false,
        }))

        // Transform communities to user list format
        const communitiesList = communitiesData.map(comm => ({
          id: comm.id,
          name: comm.name || `Community (${comm.members?.length || 0} members)`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(comm.id)}`,
          status: 'online',
          lastMessage: comm.lastMessage || '',
          lastMessageTime: comm.lastMessageTime ? new Date(comm.lastMessageTime) : new Date(),
          unreadCount: 0,
          role: '',
          isCommunity: true,
          members: comm.members || [],
        }))

        setUsers(usersList)
        setCommunities(communitiesList)

        // Check if there's a target user from URL
        const params = new URLSearchParams(window.location.search)
        const targetUid = params.get('with') || localStorage.getItem('chatTargetUid')
        if (targetUid) {
          // If target user not in conversations, fetch their info
          if (!usersList.find(u => u.id === targetUid)) {
            try {
              const res = await fetch(`${API_BASE_URL}/api/auth/get-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: targetUid })
              })
              if (res.ok) {
                const data = await res.json()
                // Handle both success with user and success with null user
                if (data?.success && data?.user) {
                  const name = data.user.name || (data.user.email ? data.user.email.split('@')[0] : 'User')
                  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
                  setUsers(prev => [{
                    id: targetUid,
                    name,
                    avatar,
                    status: 'online',
                    unreadCount: 0,
                    role: data.user.role || ''
                  }, ...prev])
                } else {
                  // User not found, use fallback
                  const name = 'User'
                  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetUid)}`
                  setUsers(prev => [{
                    id: targetUid,
                    name,
                    avatar,
                    status: 'online',
                    unreadCount: 0,
                    role: ''
                  }, ...prev])
                }
              }
            } catch (err) {
              console.error('Error fetching target user:', err)
            }
          }
          setSelectedUserId(targetUid)
          localStorage.removeItem('chatTargetUid')
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUserId) {
      loadConversations()
    }
  }, [currentUserId, toast])

  // Initialize Socket.IO connection
  React.useEffect(() => {
    if (!currentUserId) return

    const token = getAuthToken()
    if (!token) {
      console.error('No auth token available for Socket.IO')
      return
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
    })

    newSocket.on('connect', () => {
      console.log('Socket.IO connected')
      setConnectionStatus("connected")
    })

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      setConnectionStatus("disconnected")
      toast({
        title: "Disconnected",
        description: "Connection to chat server lost",
        variant: "destructive",
      })
    })

    newSocket.on('message', (message) => {
      // New message received (only from other users, not our own messages)
      if (message.senderId !== currentUserId && (message.senderId === selectedUserId || message.receiverId === currentUserId)) {
        setMessages(prev => {
          // Avoid duplicates by checking message ID
          if (prev.find(m => m.id === message.id)) return prev
          return [...prev, {
            ...message,
            timestamp: new Date(message.timestamp),
          }].sort((a, b) => {
            const timeA = a.timestamp?.getTime?.() || new Date(a.timestamp).getTime()
            const timeB = b.timestamp?.getTime?.() || new Date(b.timestamp).getTime()
            return timeA - timeB
          })
        })
      }

      // Update user's last message in sidebar
      setUsers(prev => prev.map(u =>
        (u.id === message.senderId || u.id === message.receiverId) ? {
          ...u,
          lastMessage: message.content,
          lastMessageTime: new Date(message.timestamp),
        } : u
      ))
    })

    newSocket.on('message-sent', (message) => {
      // Message sent confirmation - only update if not already in list
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp),
        }].sort((a, b) => {
          const timeA = a.timestamp?.getTime?.() || new Date(a.timestamp).getTime()
          const timeB = b.timestamp?.getTime?.() || new Date(b.timestamp).getTime()
          return timeA - timeB
        })
      })
    })

    newSocket.on('typing', (data) => {
      if (data.userId === selectedUserId) {
        setIsTyping(data.isTyping)
      }
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
      toast({
        title: "Connection Error",
        description: error.message || "Socket connection error",
        variant: "destructive",
      })
    })

    // Listen for community invite notifications
    newSocket.on('community-invite', async (data) => {
      console.log('[ChatPage] Received community-invite notification:', data);
      const { requestId, senderId, senderInfo } = data

      // Show notification toast with accept/reject actions
      toast({
        title: "Community Invitation",
        description: `${senderInfo?.name || 'Someone'} invited you to join a community`,
        duration: 10000,
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await communityAPI.respondToRequest(requestId, 'reject')
                  toast({
                    title: "Request Rejected",
                    description: "Community invitation has been rejected",
                  })
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to reject request",
                    variant: "destructive",
                  })
                }
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await communityAPI.respondToRequest(requestId, 'accept')
                  toast({
                    title: "Community Created!",
                    description: "You have successfully joined the community",
                  })
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to accept request",
                    variant: "destructive",
                  })
                }
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        ),
      })
    })

    newSocket.on('community-invite-accepted', async (data) => {
      console.log('[ChatPage] Received community-invite-accepted notification:', data);
      const { receiverInfo } = data
      toast({
        title: "Invitation Accepted!",
        description: `${receiverInfo?.name || 'The freelancer'} accepted your community invitation`,
      })
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [currentUserId, selectedUserId, toast])

  // Reconnect socket when token is refreshed
  React.useEffect(() => {
    const onRefreshed = async (e) => {
      const newToken = e?.detail?.token
      if (!newToken) return

      console.log('[ChatPage] Token refreshed, reconnecting Socket.IO...')

      // Disconnect old socket
      if (socket) {
        try {
          socket.removeAllListeners()
          socket.disconnect()
        } catch (err) {
          console.warn('[ChatPage] Error disconnecting old socket:', err)
        }
      }

      // Create new socket with fresh token
      const newSocket = io(SOCKET_URL, {
        auth: { token: newToken },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      // Re-setup all event listeners
      newSocket.on('connect', () => {
        console.log('[ChatPage] Socket reconnected after token refresh')
        setConnectionStatus("connected")
      })

      newSocket.on('disconnect', () => {
        console.log('[ChatPage] Socket disconnected')
        setConnectionStatus("disconnected")
      })

      newSocket.on('message', (message) => {
        if (message.senderId !== currentUserId && (message.senderId === selectedUserId || message.receiverId === currentUserId)) {
          setMessages(prev => {
            if (prev.find(m => m.id === message.id)) return prev
            return [...prev, {
              ...message,
              timestamp: new Date(message.timestamp),
            }].sort((a, b) => {
              const timeA = a.timestamp?.getTime?.() || new Date(a.timestamp).getTime()
              const timeB = b.timestamp?.getTime?.() || new Date(b.timestamp).getTime()
              return timeA - timeB
            })
          })
        }

        setUsers(prev => prev.map(u =>
          (u.id === message.senderId || u.id === message.receiverId) ? {
            ...u,
            lastMessage: message.content,
            lastMessageTime: new Date(message.timestamp),
          } : u
        ))
      })

      newSocket.on('message-sent', (message) => {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev
          return [...prev, {
            ...message,
            timestamp: new Date(message.timestamp),
          }].sort((a, b) => {
            const timeA = a.timestamp?.getTime?.() || new Date(a.timestamp).getTime()
            const timeB = b.timestamp?.getTime?.() || new Date(b.timestamp).getTime()
            return timeA - timeB
          })
        })
      })

      newSocket.on('typing', (data) => {
        if (data.userId === selectedUserId) {
          setIsTyping(data.isTyping)
        }
      })

      newSocket.on('error', (error) => {
        console.error('[ChatPage] Socket error:', error)
        toast({
          title: "Connection Error",
          description: error.message || "Socket connection error",
          variant: "destructive",
        })
      })

      // Re-setup community invite listeners
      newSocket.on('community-invite', async (data) => {
        console.log('[ChatPage] Received community-invite notification:', data);
        const { requestId, senderId, senderInfo } = data

        toast({
          title: "Community Invitation",
          description: `${senderInfo?.name || 'Someone'} invited you to join a community`,
          duration: 10000,
          action: (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await communityAPI.respondToRequest(requestId, 'reject')
                    toast({
                      title: "Request Rejected",
                      description: "Community invitation has been rejected",
                    })
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error.message || "Failed to reject request",
                      variant: "destructive",
                    })
                  }
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await communityAPI.respondToRequest(requestId, 'accept')
                    toast({
                      title: "Community Created!",
                      description: "You have successfully joined the community",
                    })
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error.message || "Failed to accept request",
                      variant: "destructive",
                    })
                  }
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          ),
        })
      })

      newSocket.on('community-invite-accepted', async (data) => {
        console.log('[ChatPage] Received community-invite-accepted notification:', data);
        const { receiverInfo } = data
        toast({
          title: "Invitation Accepted!",
          description: `${receiverInfo?.name || 'The freelancer'} accepted your community invitation`,
        })
      })

      setSocket(newSocket)
    }

    window.addEventListener('auth:token-refreshed', onRefreshed)
    return () => window.removeEventListener('auth:token-refreshed', onRefreshed)
  }, [socket, currentUserId, selectedUserId, toast])

  // Load messages when user/community is selected
  React.useEffect(() => {
    const loadMessages = async () => {
      if (!currentUserId) {
        setMessages([])
        return
      }

      if (isCommunityChat && selectedCommunityId) {
        try {
          const messagesData = await chatAPI.getCommunityMessages(selectedCommunityId)

          // Batch get all unique sender IDs
          const uniqueSenderIds = [...new Set(messagesData.map(msg => msg.senderId).filter(Boolean))]
          const userMap = new Map()

          if (uniqueSenderIds.length > 0) {
            try {
              // Batch fetch users (split into chunks of 100 if needed)
              const chunkSize = 100
              for (let i = 0; i < uniqueSenderIds.length; i += chunkSize) {
                const chunk = uniqueSenderIds.slice(i, i + chunkSize)
                const res = await fetch(`${API_BASE_URL}/api/auth/get-users-batch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ uids: chunk })
                })
                if (res.ok) {
                  const data = await res.json()
                  if (data?.users) {
                    data.users.forEach(user => {
                      userMap.set(user.uid, user)
                    })
                  }
                }
              }
            } catch (err) {
              console.error('Error batch fetching senders:', err)
            }
          }

          // Transform messages with sender names from batch lookup
          const transformedMessages = messagesData.map((msg) => {
            const sender = userMap.get(msg.senderId)
            const senderName = sender?.name || sender?.email?.split('@')[0] || 'Unknown'
            return {
              ...msg,
              timestamp: new Date(msg.timestamp),
              senderName,
            }
          })
          setMessages(transformedMessages)
        } catch (error) {
          console.error('Error loading community messages:', error)
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          })
        }
      } else if (selectedUserId) {
        try {
          const messagesData = await chatAPI.getMessages(selectedUserId)
          const transformedMessages = messagesData.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(transformedMessages)

          // Mark messages as read and update sidebar
          setUsers(prevUsers =>
            prevUsers.map((user) =>
              user.id === selectedUserId ? { ...user, unreadCount: 0 } : user
            )
          )
        } catch (error) {
          console.error('Error loading messages:', error)
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          })
        }
      } else {
        setMessages([])
      }
    }

    loadMessages()
  }, [selectedUserId, selectedCommunityId, isCommunityChat, currentUserId, toast])

  // Handle sending a message
  const handleSendMessage = React.useCallback(
    async (content) => {
      if (!content.trim() || !currentUserId) return

      try {
        let response
        if (isCommunityChat && selectedCommunityId) {
          // Send community message
          response = await chatAPI.sendCommunityMessage(selectedCommunityId, content.trim())
        } else if (selectedUserId) {
          // Send individual message
          response = await chatAPI.sendMessage(selectedUserId, content.trim())
        } else {
          return
        }

        if (response.success && response.message) {
          const newMessage = {
            ...response.message,
            timestamp: new Date(response.message.timestamp),
          }

          // Optimistically update UI (check for duplicates)
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })

          // Update last message in sidebar
          if (isCommunityChat && selectedCommunityId) {
            setCommunities((prevCommunities) =>
              prevCommunities.map((comm) =>
                comm.id === selectedCommunityId
                  ? {
                    ...comm,
                    lastMessage: content.trim(),
                    lastMessageTime: newMessage.timestamp,
                  }
                  : comm
              )
            )
          } else {
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === selectedUserId
                  ? {
                    ...user,
                    lastMessage: content.trim(),
                    lastMessageTime: newMessage.timestamp,
                  }
                  : user
              )
            )
          }
        }
      } catch (error) {
        console.error('Error sending message:', error)
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    },
    [selectedUserId, selectedCommunityId, isCommunityChat, currentUserId, toast]
  )

  // Handle user/community selection
  const handleSelectUser = React.useCallback((user) => {
    if (user.isCommunity) {
      setSelectedCommunityId(user.id)
      setIsCommunityChat(true)
      setSelectedUserId(null)
    } else {
      setSelectedUserId(user.id)
      setIsCommunityChat(false)
      setSelectedCommunityId(null)
    }
    setIsTyping(false)
  }, [])

  // Get selected user/community object from current list
  const selectedUser = React.useMemo(() => {
    if (isCommunityChat && selectedCommunityId) {
      return communities.find(c => c.id === selectedCommunityId) || null
    } else if (selectedUserId) {
      return users.find(u => u.id === selectedUserId) || null
    }
    return null
  }, [selectedUserId, selectedCommunityId, isCommunityChat, users, communities])

  return (
    <div className={cn("flex h-full w-full overflow-hidden min-h-0", className)}>
      <div className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0">
        <ChatSidebar
          users={users}
          communities={communities}
          selectedUserId={selectedUserId}
          selectedCommunityId={selectedCommunityId}
          isCommunityChat={isCommunityChat}
          onSelectUser={handleSelectUser}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile: Show sidebar or chat window */}
      <div className="flex-1 flex min-h-0">
        {(selectedUserId || selectedCommunityId) ? (
          <div className="flex-1 flex flex-col">
            <ChatWindow
              user={selectedUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => {
                setSelectedUserId(null)
                setSelectedCommunityId(null)
                setIsCommunityChat(false)
              }}
              isTyping={isTyping}
              connectionStatus={connectionStatus}
              isCommunityChat={isCommunityChat}
            />
          </div>
        ) : (
          <div className="flex-1 md:hidden">
            <ChatSidebar
              users={users}
              communities={communities}
              selectedUserId={selectedUserId}
              selectedCommunityId={selectedCommunityId}
              isCommunityChat={isCommunityChat}
              onSelectUser={handleSelectUser}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      <Toaster />
    </div>
  )
}

