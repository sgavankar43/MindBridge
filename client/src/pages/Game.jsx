import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Clock, Brain, Users, Sparkles, Grid3x3, Palette } from "lucide-react";

export default function Game() {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "Memory Match",
      description: "Test your memory by matching pairs of cards",
      icon: <Brain className="w-10 h-10 text-white" />,
      route: "/gameMemoryMatch",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      stats: [
        { label: "Difficulty", value: "Easy" },
        { label: "Players", value: "1" },
        { label: "Time", value: "5-10 min" }
      ]
    },
    {
      id: 2,
      title: "Bubble Pop",
      description: "Relax and pop calming bubbles before they float away",
      icon: <Sparkles className="w-10 h-10 text-white" />,
      route: "/gameBubblePop",
      color: "bg-gradient-to-br from-cyan-400 to-blue-500",
      stats: [
        { label: "Difficulty", value: "Easy" },
        { label: "Players", value: "1" },
        { label: "Time", value: "30 sec" }
      ]
    },
    {
      id: 3,
      title: "Tile Slider",
      description: "Slide tiles to order them in this classic 15-puzzle",
      icon: <Grid3x3 className="w-10 h-10 text-white" />,
      route: "/gameTileSlider",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      stats: [
        { label: "Difficulty", value: "Medium" },
        { label: "Players", value: "1" },
        { label: "Time", value: "5-15 min" }
      ]
    },
    {
      id: 4,
      title: "2048",
      description: "Merge tiles to reach 2048 in this strategic puzzle",
      icon: <Grid3x3 className="w-10 h-10 text-white" />,
      route: "/game2048",
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      stats: [
        { label: "Difficulty", value: "Hard" },
        { label: "Players", value: "1" },
        { label: "Time", value: "10-20 min" }
      ]
    },
    {
      id: 5,
      title: "Calm Coloring",
      description: "Color simple shapes for a mindful break",
      icon: <Palette className="w-10 h-10 text-white" />,
      route: "/gameColoring",
      color: "bg-gradient-to-br from-pink-400 to-rose-500",
      stats: [
        { label: "Difficulty", value: "Easy" },
        { label: "Players", value: "1" },
        { label: "Time", value: "5-10 min" }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-24"> 
        <Header />
        
        <div className="max-w-7xl mx-auto mt-4 sm:mt-6">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Games</h1>
            <p className="text-sm sm:text-base text-gray-600">Select a game to start playing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {games.map((game) => (
              <div 
                key={game.id}
                onClick={() => navigate(game.route)}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`h-1.5 sm:h-2 ${game.color}`}></div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${game.color.split(' ')[0]} rounded-lg sm:rounded-xl flex items-center justify-center`}>
                      <div className="scale-75 sm:scale-100">{game.icon}</div>
                    </div>
                    <div className="px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700">
                      {game.stats[0].value}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{game.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{game.description}</p>
                  
                  <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      {game.stats.slice(1).map((stat, index) => (
                        <div key={index} className="flex items-center text-xs sm:text-sm text-gray-500">
                          {stat.label === "Time" ? <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" /> : null}
                          {stat.label === "Players" ? <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" /> : null}
                          {stat.value}
                        </div>
                      ))}
                    </div>
                    <button 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(game.route);
                      }}
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Coming Soon Section */}
          <div className="mt-8 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Coming Soon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2].map((item) => (
                <div 
                  key={item}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border-2 border-dashed border-gray-200 opacity-50"
                >
                  <div className="h-1.5 sm:h-2 bg-gray-200"></div>
                  <div className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="h-7 sm:h-8 bg-gray-200 rounded w-24 sm:w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
