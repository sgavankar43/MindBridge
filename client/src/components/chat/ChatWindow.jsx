import * as React from "react"
import { ArrowLeft, Video, Edit2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { TypingIndicator } from "./TypingIndicator"
import { cn } from "@/lib/utils"
import { getCurrentUser, communityAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export function ChatWindow({
  user,
  messages,
  onSendMessage,
  onBack,
  isTyping = false,
  connectionStatus = "connected",
  isCommunityChat = false,
  className,
}) {
  const { toast } = useToast()
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [communityDetails, setCommunityDetails] = React.useState(null)
  const [showMembers, setShowMembers] = React.useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false)
  const [leaving, setLeaving] = React.useState(false)

  const handleStartMeeting = React.useCallback(() => {
    if (!user || !user.id) return

    // Generate room name based on chat type
    let roomName
    if (isCommunityChat) {
      // For community chats, use community ID
      roomName = `community-${user.id}`
    } else {
      // For individual chats, use sorted user IDs to ensure same room for both users
      const currentUserId = localStorage.getItem('uid')
      const userIds = [currentUserId, user.id].sort()
      roomName = `chat-${userIds[0]}-${userIds[1]}`
    }

    // Navigate to video call page with room name
    window.location.href = `/videocall?room=${encodeURIComponent(roomName)}`
  }, [user, isCommunityChat])

  const getUserRole = React.useCallback(() => {
    try {
      const cuStr = localStorage.getItem("currentUser")
      if (cuStr) {
        const cu = JSON.parse(cuStr)
        if (cu && cu.role) return cu.role
      }
    } catch {}
    const r = localStorage.getItem("role")
    return r || "entrepreneur"
  }, [])

  const role = getUserRole()
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : ""
  const messagesEndRef = React.useRef(null)
  const scrollAreaRef = React.useRef(null)

  // Load community details when community is selected
  React.useEffect(() => {
    if (isCommunityChat && user?.id) {
      const loadCommunityDetails = async () => {
        try {
          const details = await communityAPI.getCommunityDetails(user.id)
          setCommunityDetails(details)
        } catch (error) {
          console.error('Error loading community details:', error)
        }
      }
      loadCommunityDetails()
    }
  }, [isCommunityChat, user?.id])

  const handleEditName = React.useCallback(() => {
    setNewName(user?.name || "")
    setIsEditingName(true)
  }, [user?.name])

  const handleSaveName = React.useCallback(async () => {
    if (!newName.trim() || !user?.id) return

    try {
      await communityAPI.updateCommunityName(user.id, newName.trim())
      toast({
        title: "Success",
        description: "Community name updated successfully",
      })
      setIsEditingName(false)
      // Update the user object to reflect the new name
      user.name = newName.trim()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update community name",
        variant: "destructive",
      })
    }
  }, [newName, user, toast])

  const handleCancelEdit = React.useCallback(() => {
    setIsEditingName(false)
    setNewName("")
  }, [])

  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
        }, 100)
      }
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  if (!user) {
    return (
      <div
        className={cn(
          "flex flex-col h-full min-h-0 overflow-hidden items-center justify-center text-center p-8",
          className
        )}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No chat selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a user from the sidebar to start a conversation
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 border-b bg-background p-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                className="h-8 text-sm"
                maxLength={50}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveName} disabled={!newName.trim()}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2
                className={cn("font-semibold truncate", isCommunityChat && "cursor-pointer")}
                onClick={() => {
                  if (isCommunityChat && communityDetails?.members) setShowMembers(true)
                }}
                title={isCommunityChat ? "View community members" : undefined}
              >
                {user.name}
              </h2>
              {isCommunityChat && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditName}
                  className="h-6 w-6"
                  title="Edit community name"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
              {!isCommunityChat && (
                <Badge
                  variant={user.status === "online" ? "default" : "secondary"}
                  className={cn(
                    "h-2 w-2 rounded-full p-0",
                    user.status === "online" ? "bg-green-500" : "bg-gray-400"
                  )}>
                  <span className="sr-only">{user.status}</span>
                </Badge>
              )}
              {isCommunityChat && communityDetails?.members && (
                <Dialog open={showMembers} onOpenChange={setShowMembers}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {communityDetails.members.length} members
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Community Members</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {communityDetails.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name || member.email || 'User')}`}
                              alt={member.name || 'User'}
                            />
                            <AvatarFallback className="text-xs">
                              {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.name || member.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {member.role || 'Member'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground capitalize">
            {user.status}
          </p>
        </div>
        {isCommunityChat && (
          <>
            <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave Community</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Are you sure you want to leave this community? You will no longer receive messages or updates from this group.
                </DialogDescription>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLeaveConfirm(false)} disabled={leaving}>Cancel</Button>
                  <Button onClick={async () => {
                    if (!user?.id) return
                    try {
                      setLeaving(true)
                      await communityAPI.leaveCommunity(user.id)
                      setShowLeaveConfirm(false)
                      toast({ title: "Left community", description: "You have left the community." })
                      if (onBack) onBack()
                      else window.history.back()
                      // Force refresh so community list reloads without the left community
                      setTimeout(() => { window.location.reload() }, 100)
                    } catch (error) {
                      toast({ title: "Error", description: error.message || "Failed to leave community", variant: "destructive" })
                    } finally {
                      setLeaving(false)
                    }
                  }} disabled={leaving}>
                    {leaving ? 'Leaving...' : 'Leave'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => setShowLeaveConfirm(true)}
              title="Leave community"
            >
              Leave
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Start meeting"
          onClick={handleStartMeeting}
          title="Start Meeting"
        >
          <Video className="h-5 w-5" />
        </Button>
        <Badge
          variant={connectionStatus === "connected" ? "default" : "secondary"}
          className="text-xs">
          {connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {roleLabel}
        </Badge>
      </div>

      <Separator />

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const currentUser = getCurrentUser()
              const currentUserId = localStorage.getItem('uid')
              const isOwn = message.senderId === currentUserId || message.senderId === currentUser?.uid
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showSenderName={isCommunityChat && !isOwn}
                />
              )
            })
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Input Area */}
      <MessageInput
        onSend={onSendMessage}
        disabled={false}
      />
    </div>
  )
}