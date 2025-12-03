import { Search, Bell } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-100% h-20 bg-[#f5f0e8] flex items-center justify-between px-8   rounded-3xl">
      <h1 className="text-3xl font-bold text-[#2d2d2d]">dynamy</h1>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Type here to search..."
            className="pl-10 pr-4 py-2 w-96 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
          />
        </div>

        {/* Notification */}
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-[#e74c3c] to-[#f39c12] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">U</span>
        </div>
      </div>
    </header>
  )
}
