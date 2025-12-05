import * as React from "react"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatTime } from "@/services/chatService"

export function ChatSidebar({
  users,
  communities = [],
  selectedUserId,
  selectedCommunityId,
  isCommunityChat = false,
  onSelectUser,
  isLoading = false,
  className,
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("All")

  const allChats = React.useMemo(() => {
    return [...(users || []), ...(communities || [])]
  }, [users, communities])

  const filteredChats = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allChats.filter((chat) => {
      const matchesQuery = !q || (chat?.name || "").toLowerCase().includes(q)
      const role = (chat?.role || "").toString().toLowerCase()
      const filter = roleFilter.toLowerCase()
      const matchesRole = chat.isCommunity
        ? (filter === "all" || filter === "freelancer")
        : (filter === "all" || role === filter)
      return matchesQuery && matchesRole
    })
  }, [allChats, searchQuery, roleFilter])

  return (
    <div className={cn("flex flex-col h-full border-r bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "All" },
            { label: "Entrepreneur" },
            { label: "Freelancer" },
            { label: "Investor" },
          ].map((r) => (
            <Badge
              key={r.label}
              variant={roleFilter === r.label ? "default" : "secondary"}
              className="cursor-pointer select-none"
              onClick={() => setRoleFilter(r.label)}>
              {r.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Users List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery
                ? "No chats found"
                : "No chats available"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => {
              const isSelected = chat.isCommunity 
                ? (isCommunityChat && selectedCommunityId === chat.id)
                : (selectedUserId === chat.id)
              return (
              <button
                key={chat.id}
                onClick={() => onSelectUser(chat)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent text-left",
                  isSelected && "bg-accent"
                )}>
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {!chat.isCommunity && (
                    <Badge
                      variant={chat.status === "online" ? "default" : "secondary"}
                      className={cn(
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background p-0",
                        chat.status === "online" ? "bg-green-500" : "bg-gray-400"
                      )}>
                      <span className="sr-only">{chat.status}</span>
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 min-w-5 flex items-center justify-center px-1.5 rounded-full text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            )})}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

