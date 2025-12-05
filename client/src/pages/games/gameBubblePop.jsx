import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import BubblePop from "@/components/BubblePop";

export default function GameBubblePop() {
  const handleEnd = (result) => {
    console.log("Bubble Pop result:", result);
    alert(`Game Finished!
Score: ${result.score}
Popped: ${result.popped}
Missed: ${result.missed}
Duration: ${result.durationSeconds}s`);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />
      <div className="flex-1 ml-16 p-8 pt-24">
        <Header />
        <div className="h-full flex items-center justify-center p-6">
          <BubblePop duration={30} spawnInterval={800} onEnd={handleEnd} />
        </div>
      </div>
    </div>
  );
}
