import { Sidebar } from "@/components/sidebar"
import { TodayActivity } from "@/components/today-activity"
import { ProgressStatistics } from "@/components/progress-statistics"
import { CaloriesCard } from "@/components/calories-card"
import { WorkoutVideo } from "@/components/workout-video"
import { Search, Bell } from "lucide-react"
import Image from "next/image"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#e8e0d5] p-4">
      <div className="flex gap-4">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#2d2d2d]">dynamy</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type here to search..."
                  className="bg-transparent outline-none text-sm text-gray-600 w-48"
                />
              </div>
              <button className="p-2 bg-white rounded-full">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src="/young-woman-avatar-professional.jpg"
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
          </header>

          {/* Dashboard Grid */}
          <div className="flex gap-4 flex-1">
            {/* Left Column */}
            <div className="flex-1">
              <TodayActivity />
            </div>

            {/* Right Column */}
            <div className="w-[420px] flex flex-col gap-4">
              <div className="flex gap-4">
                <ProgressStatistics />
                <CaloriesCard />
              </div>
              <WorkoutVideo />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
