import * as React from "react"
// Avoid using useNavigate (requires Router context). Use direct navigation to support non-Router contexts.
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/services/chatService"
import { getCurrentUser } from "@/services/api"

export function MessageBubble({ message, isOwn = false, showSenderName = false }) {
  const time = formatMessageTime(message.timestamp)
  // no-router navigation fallback
  const navigateToInvite = (invite) => {
    try {
      if (invite.inviteId) {
        const url = `/videocall?room=${encodeURIComponent(invite.roomName || '')}&inviteId=${encodeURIComponent(invite.inviteId)}`
        window.location.href = url
      } else if (invite.token && invite.url) {
        // Fallback: encode token/url in URL (not recommended for production)
        const url = `/videocall?room=${encodeURIComponent(invite.roomName || '')}&token=${encodeURIComponent(invite.token)}&url=${encodeURIComponent(invite.url)}`
        window.location.href = url
      } else {
        // Simple room join
        const url = `/videocall?room=${encodeURIComponent(invite.roomName || '')}`
        window.location.href = url
      }
    } catch (err) {
      console.error('navigation failed', err)
    }
  }

  // Try to parse invite payload if present
  let invite = null
  try {
    if (message.meta?.isInvite && typeof message.content === 'string') {
      const parsed = JSON.parse(message.content)
      if (parsed && parsed.type === 'livekit-invite') invite = parsed
    } else if (typeof message.content === 'string') {
      const parsed = JSON.parse(message.content)
      if (parsed && parsed.type === 'livekit-invite') invite = parsed
    }
  } catch (e) {
    // Not an invite or invalid JSON
    invite = null
  }

  return (
    <div
      className={cn(
        "flex w-full mb-4 px-4",
        isOwn ? "justify-end" : "justify-start"
      )}>
        <div
          className={cn(
            "flex flex-col max-w-[75%] md:max-w-[60%]",
            isOwn ? "items-end" : "items-start"
          )}>
          {showSenderName && !isOwn && (
            <span className="text-xs text-muted-foreground mb-1 px-1">
              {message.senderName || "Unknown"}
            </span>
          )}
          <div
            className={cn(
              "rounded-2xl px-4 py-2 shadow-sm",
              isOwn
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted text-foreground rounded-tl-sm"
            )}>
            {invite ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Video call invite</p>
                <p className="text-xs text-muted-foreground">
                  From: {message.senderName || message.senderId}
                </p>
                <p className="text-xs whitespace-pre-wrap break-words text-muted-foreground">
                  Room: {invite.roomName || 'default'}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded bg-primary text-white text-sm"
                    onClick={() => {
                      try {
                        // If invite payload contains an inviteId, pass that to videocall so it can fetch token securely
                        if (invite.inviteId) {
                          navigateToInvite(invite)
                        } else {
                          // Fallback: if token/url are embedded (older messages), pass them directly
                          navigateToInvite(invite)
                        }
                      } catch (err) {
                        console.error('Failed to navigate to videocall with invite:', err)
                      }
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {time}
        </span>
      </div>
    </div>
  )
}

