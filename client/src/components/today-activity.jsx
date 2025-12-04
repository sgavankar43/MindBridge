import { Check, MoreHorizontal } from "lucide-react"

const weekDays = [
  { day: "S", completed: true },
  { day: "M", completed: true },
  { day: "T", completed: true },
  { day: "W", active: true },
  { day: "T", icon: "running" },
  { day: "F", icon: "yoga" },
  { day: "S", icon: "running" },
]

const workouts = [
  { name: "Stretching", duration: "30 minutes", date: "Today", color: "bg-[#9b59b6]" },
  { name: "Push-ups", duration: "25 minutes", date: "Aug 11", color: "bg-[#f1c40f]" },
  { name: "Strength Training", duration: "45 minutes", date: "Aug 12", color: "bg-[#3498db]" },
]

export function TodayActivity() {
  return (
    <div className="relative">
      {/* Add Button - Positioned outside the masked container */}
      <button className="absolute top-0 right-1 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-[#e74c3c] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg hover:bg-[#c0392b] transition-colors">
        <span className="text-white text-xl sm:text-2xl font-light leading-none">+</span>
      </button>

      <div
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full relative"
        style={{
          '--r': '20px',
          '--s': '30px',
          '--x': '20px',
          '--y': '10px',
          '--_m': '/calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%,#0000 72%)',
          '--_g': 'conic-gradient(at calc(100% - var(--r)) var(--r),#0000 25%,#000 0)',
          '--_d': 'calc(var(--s) + var(--r))',
          mask: 'calc(100% - var(--_d) - var(--x)) 0 var(--_m), 100% calc(var(--_d) + var(--y)) var(--_m), radial-gradient(var(--s) at 100% 0,#0000 99%,#000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(var(--r) + var(--y)), var(--_g) calc(-1*var(--_d) - var(--x)) 0, var(--_g) 0 calc(var(--_d) + var(--y))',
          maskRepeat: 'no-repeat'
        }}
      >

        <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-3 sm:mb-4">TODAY&apos;S ACTIVITY</h2>

        {/* Activity Ring */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <svg className="w-32 h-20 sm:w-40 sm:h-24" viewBox="0 0 160 100">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f39c12" />
                  <stop offset="100%" stopColor="#e74c3c" />
                </linearGradient>
              </defs>
              <path
                d="M 20 90 A 60 60 0 0 1 140 90"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 20 90 A 60 60 0 0 1 140 90"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="188"
                strokeDashoffset="37"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
              <div className="bg-[#f5f0e8] px-3 py-1 rounded-full">
                <span className="text-sm font-semibold">
                  8.0<span className="text-xs text-gray-400">/km</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Week Days */}
        <div className="flex justify-between mb-4 sm:mb-6 px-1 sm:px-2">
          {weekDays.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-[10px] sm:text-xs text-gray-400">{item.day}</span>
              {item.completed ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#f5f0e8] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#2d2d2d]" />
                </div>
              ) : item.active ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#f1e14c] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#2d2d2d]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {item.icon === "running" ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H6z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Workouts */}
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">UPCOMING WORKOUTS</h3>
            <button className="text-[10px] sm:text-xs text-gray-400">View All</button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {workouts.map((workout, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl sm:rounded-2xl">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${workout.color} rounded-lg sm:rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="text-white text-base sm:text-xl">💪</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#2d2d2d] text-sm sm:text-base truncate">{workout.name}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-400">{workout.duration}</p>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{workout.date}</span>
                <button className="shrink-0">
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-end justify-between mt-4 sm:mt-6">
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">STEPS</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-4xl font-bold text-[#2d2d2d]">11.000</span>
              <span className="text-xs sm:text-sm text-gray-400">/steps</span>
            </div>
            <div className="w-24 sm:w-32 h-1.5 sm:h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full w-3/4 bg-[#e74c3c] rounded-full" />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] sm:text-xs text-gray-400">Daily Goal</span>
            <p className="text-xs sm:text-sm font-medium">15.000 /steps</p>
          </div>
        </div>
      </div>
    </div>
  )
}