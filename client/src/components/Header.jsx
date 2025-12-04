import { Search, Bell, Menu } from "lucide-react"
import { useSidebar } from "@/context/SidebarContext"

export function Header() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="fixed top-0 left-0 lg:left-16 right-0 z-40 h-20 bg-[#f5f0e8] flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-10 h-10 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-[#2d2d2d]">dynamy</h1>
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
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 bg-[#e74c3c] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">U</span>
        </div>
      </div>
    </header>
  )
}
