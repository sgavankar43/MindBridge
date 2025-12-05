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
      <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
        <Header />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-8">

          <div className="lg:col-span-4">
            <TodayActivity />
          </div>

          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
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
