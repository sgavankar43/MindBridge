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
      <div className="flex-1 ml-16 p-8 pt-24"> 
        <Header />
        
        <div className="max-w-7xl mx-auto mt-6 ">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Games</h1>
            <p className="text-gray-600">Select a game to start playing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div 
                key={game.id}
                onClick={() => navigate(game.route)}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`h-2 ${game.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 ${game.color.split(' ')[0]} rounded-xl flex items-center justify-center mb-4`}>
                      {game.icon}
                    </div>
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                      {game.stats[0].value}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      {game.stats.slice(1).map((stat, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-500">
                          {stat.label === "Time" ? <Clock className="w-4 h-4 mr-1" /> : null}
                          {stat.label === "Players" ? <Users className="w-4 h-4 mr-1" /> : null}
                          {stat.value}
                        </div>
                      ))}
                    </div>
                    <button 
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((item) => (
                <div 
                  key={item}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-dashed border-gray-200 opacity-50"
                >
                  <div className="h-2 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
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
