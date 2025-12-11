import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { CheckCircle, Circle, Plus, Trash2, Flame, Calendar, Smile, Meh, Frown, Play, Pause, Heart, MessageCircle } from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate()

  // Task Manager State
  const [tasks, setTasks] = useState([
    { id: 1, text: "Morning meditation", completed: true },
    { id: 2, text: "Journal my thoughts", completed: true },
    { id: 3, text: "Take a 15-minute walk", completed: false },
    { id: 4, text: "Practice gratitude", completed: false },
    { id: 5, text: "Evening reflection", completed: false }
  ])
  const [newTask, setNewTask] = useState("")

  // Streak Manager State
  const [currentStreak, setCurrentStreak] = useState(7)
  const [longestStreak, setLongestStreak] = useState(15)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weekStatus = [true, true, true, true, true, true, true]

  // Mood Tracker State
  const [selectedMood, setSelectedMood] = useState("good")
  const moods = [
    { id: "great", label: "Great", icon: Smile, color: "bg-green-500", emoji: "😊" },
    { id: "good", label: "Good", icon: Smile, color: "bg-blue-500", emoji: "🙂" },
    { id: "okay", label: "Okay", icon: Meh, color: "bg-yellow-500", emoji: "😐" },
    { id: "bad", label: "Bad", icon: Frown, color: "bg-orange-500", emoji: "😟" },
    { id: "terrible", label: "Terrible", icon: Frown, color: "bg-red-500", emoji: "😢" }
  ]

  // Video Carousel State
  const videos = [
    { id: 1, title: "5-Minute Meditation for Anxiety", videoId: "inpok4MKVLM" },
    { id: 2, title: "Breathing Exercises for Stress Relief", videoId: "tybOi4hjZFQ" },
    { id: 3, title: "Guided Relaxation Technique", videoId: "1vx8iUvfyCY" },
    { id: 4, title: "Mindfulness for Beginners", videoId: "6p_yaNFSYao" }
  ]
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Auto-scroll videos
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isPlaying, videos.length])

  // Task Manager Functions
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }])
      setNewTask("")
    }
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const completedTasks = tasks.filter(t => t.completed).length

  // Community Updates State
  const communityUpdates = [
    {
      id: 1,
      author: "Dr. Sarah Mitchell",
      avatar: "SM",
      color: "bg-purple-500",
      content: "New mindfulness workshop starting next week! Join us for daily sessions.",
      likes: 45,
      comments: 12,
      time: "2h ago"
    },
    {
      id: 2,
      author: "Alex Thompson",
      avatar: "AT",
      color: "bg-blue-500",
      content: "Just completed my 30-day meditation streak! Feeling amazing 🎉",
      likes: 89,
      comments: 24,
      time: "5h ago"
    },
    {
      id: 3,
      author: "Emma Wilson",
      avatar: "EW",
      color: "bg-green-500",
      content: "Remember: Progress, not perfection. Every small step counts! 💪",
      likes: 156,
      comments: 31,
      time: "1d ago"
    }
  ]

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
        <Header />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-8">

          {/* Left Column - Task Manager & Community Updates */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Task Manager */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#2d2d2d]">Today's Tasks</h2>
                <div className="px-3 py-1 bg-[#e74c3c] text-white rounded-full text-xs sm:text-sm font-medium">
                  {completedTasks}/{tasks.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-[#e74c3c]">
                    {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e74c3c] to-[#c0392b] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completedTasks === tasks.length && tasks.length > 0
                    ? "🎉 All tasks completed!"
                    : `${tasks.length - completedTasks} task${tasks.length - completedTasks !== 1 ? 's' : ''} remaining`}
                </p>
              </div>

              {/* Add Task */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add a new task..."
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
                <button
                  onClick={handleAddTask}
                  className="p-2 bg-[#e74c3c] text-white rounded-xl hover:bg-[#c0392b] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2 overflow-y-auto max-h-64">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-[#2d2d2d]'}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks yet. Add one to get started!
                </div>
              )}
            </div>

            {/* Community Updates */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#2d2d2d]">Community Updates</h2>
                <button
                  onClick={() => navigate('/community')}
                  className="text-xs text-[#e74c3c] font-medium hover:text-[#c0392b] transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {communityUpdates.map((update) => (
                  <div
                    key={update.id}
                    onClick={() => navigate('/community')}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-10 h-10 ${update.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-xs">{update.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#2d2d2d] truncate">
                          {update.author}
                        </h4>
                        <p className="text-xs text-gray-400">{update.time}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {update.content}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">{update.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">{update.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/community')}
                className="w-full mt-4 px-4 py-2 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors text-sm"
              >
                Go to Community
              </button>
            </div>
          </div>

          {/* Right Column - Streak, Mood & Videos */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Streak Manager & Mood Tracker */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

              {/* Streak Manager */}
              <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#2d2d2d]">Streak Manager</h2>
                    <p className="text-xs text-gray-500">Keep your momentum going!</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-3xl font-bold text-[#e74c3c]">{currentStreak} days</p>
                    </div>
                    <Flame className="w-12 h-12 text-orange-500" />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Longest Streak</p>
                    <p className="text-2xl font-bold text-[#2d2d2d]">{longestStreak} days</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-3">This Week</p>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day, index) => (
                        <div key={day} className="text-center">
                          <div className={`w-full aspect-square rounded-lg flex items-center justify-center mb-1 ${weekStatus[index] ? 'bg-green-500' : 'bg-gray-200'
                            }`}>
                            {weekStatus[index] && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <p className="text-xs text-gray-500">{day}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mood Tracker */}
              <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Smile className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#2d2d2d]">Mood Tracker</h2>
                    <p className="text-xs text-gray-500">How are you feeling today?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedMood === mood.id
                        ? `${mood.color} text-white shadow-lg scale-105`
                        : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className={`flex-1 text-left font-medium ${selectedMood === mood.id ? 'text-white' : 'text-[#2d2d2d]'
                        }`}>
                        {mood.label}
                      </span>
                      {selectedMood === mood.id && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Weekly Average</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-[#2d2d2d]">Good</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Carousel */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#2d2d2d]">Wellness Videos</h2>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Play className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                  <iframe
                    key={currentVideoIndex}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videos[currentVideoIndex].videoId}?autoplay=0`}
                    title={videos[currentVideoIndex].title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-[#2d2d2d] mb-2">{videos[currentVideoIndex].title}</h3>
                  <div className="flex gap-2">
                    {videos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentVideoIndex(index)}
                        className={`flex-1 h-1 rounded-full transition-all ${index === currentVideoIndex ? 'bg-[#e74c3c]' : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`p-2 rounded-lg text-xs text-left transition-colors ${index === currentVideoIndex
                      ? 'bg-[#e74c3c] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {video.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
