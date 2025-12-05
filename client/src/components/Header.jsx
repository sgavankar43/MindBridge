import { useState, useRef, useEffect } from "react"
import { Search, Bell, Menu, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSidebar } from "@/context/SidebarContext"

export function Header() {
  const { toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  // Dummy notifications data
  const notifications = [
    {
      id: 1,
      title: "New Message",
      message: "Sarah Johnson sent you a message",
      time: "2 min ago",
      unread: true,
      type: "message"
    },
    {
      id: 2,
      title: "Workout Reminder",
      message: "Time for your evening workout session",
      time: "1 hour ago",
      unread: true,
      type: "reminder"
    },
    {
      id: 3,
      title: "Goal Achieved",
      message: "Congratulations! You've reached your weekly goal",
      time: "3 hours ago",
      unread: false,
      type: "achievement"
    },
    {
      id: 4,
      title: "Friend Request",
      message: "Mike Chen wants to connect with you",
      time: "5 hours ago",
      unread: false,
      type: "social"
    },
    {
      id: 5,
      title: "System Update",
      message: "New features are now available",
      time: "1 day ago",
      unread: false,
      type: "system"
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  return (
    <header className="fixed top-0 left-0 lg:left-16 right-0 z-40 h-20 bg-transparent flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-10 h-10 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-[#2d2d2d]">MindBridge</h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search Bar - Hidden on small screens */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Type here to search..."
            className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
          />
        </div>

        {/* Search Icon for mobile */}
        <button className="md:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Search className="w-5 h-5 text-gray-500" />
        </button>

        {/* Notification */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e74c3c] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-[#2d2d2d]">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-[#e74c3c]' : 'bg-transparent'
                            }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#2d2d2d] mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-400">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button className="w-full text-sm text-[#e74c3c] font-medium hover:text-[#c0392b] transition-colors">
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 bg-[#e74c3c] rounded-full flex items-center justify-center hover:bg-[#c0392b] transition-colors cursor-pointer"
        >
          <span className="text-white font-bold text-sm">U</span>
        </button>
      </div>
    </header>
  )
}
