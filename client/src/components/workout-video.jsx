import { Play, ArrowUpRight } from "lucide-react"

export function WorkoutVideo() {
  return (
    <div className="relative rounded-3xl overflow-hidden flex-1 min-h-[300px] bg-gradient-to-br from-gray-700 to-gray-900">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800')] bg-cover bg-center" />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top Left - Members */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-white text-xs font-bold">
            B
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
            C
          </div>
        </div>
        <div className="text-white">
          <p className="text-lg font-bold">1.2k+</p>
          <p className="text-xs opacity-80">Members</p>
        </div>
      </div>

      {/* Top Right - Arrow Button */}
      <button className="absolute top-4 right-4 w-10 h-10 bg-[#e74c3c] rounded-xl flex items-center justify-center hover:bg-[#c0392b] transition-colors">
        <ArrowUpRight className="w-5 h-5 text-white" />
      </button>

      {/* Play Button */}
      <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
        <Play className="w-6 h-6 text-[#2d2d2d] ml-1" fill="currentColor" />
      </button>

      {/* Bottom Content */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div>
          <h3 className="text-white text-lg font-semibold">Your Daily Challenge –</h3>
          <p className="text-white text-lg font-semibold">Push Your Limits Today</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-[#e74c3c]">2</span>
          <span className="text-white text-sm">/7 Days</span>
        </div>
      </div>
    </div>
  )
}
