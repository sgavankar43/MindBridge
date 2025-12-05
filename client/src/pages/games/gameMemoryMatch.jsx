import React from "react";
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import MemoryMatch from "@/components/MemoryMatch.jsx";




function GameMemoryMatch() {
  const handleEnd = (result) => {
    console.log("Game result:", result);
    alert(`Game Finished!
Time: ${result.timeSeconds}s
Moves: ${result.moves}
Accuracy: ${result.accuracy}%`);
  };

  return (

    <div className="flex min-h-screen bg-[#f5f0e8]">
          
          {/* Sidebar */}
          <Sidebar />
    
          {/* Main Content */}
          <div className="flex-1 ml-16 p-8 pt-24"> 
            <Header />

    <div className="h-full flex items-center justify-center p-6">
      <MemoryMatch size={6} onEnd={handleEnd} />
    </div>

    </div>
    </div>
  );
}

export default GameMemoryMatch;