import { Sidebar } from "@/components/sidebar"
import { TodayActivity } from "@/components/today-activity"
import { ProgressStatistics } from "@/components/progress-statistics"
import { CaloriesCard } from "@/components/calories-card"
import { WorkoutVideo } from "@/components/workout-video"
import { Header } from "@/components/header"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-16 p-8 pt-24"> 
        <Header />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 mt-8">

          <div className="col-span-4">
            <TodayActivity />
          </div>

          <div className="col-span-8 space-y-6">
            <div className="flex gap-6">
              <ProgressStatistics />
              <CaloriesCard />
            </div>

            <WorkoutVideo />
          </div>

        </div>
      </div>
    </div>
  )
}
