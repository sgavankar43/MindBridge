import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/Header";
import TileSlider from "@/components/TileSlider";

export default function GameTileSlider() {
  const handleEnd = (result) => {
    console.log("Tile Slider result:", result);
    alert(`Puzzle Solved!
Time: ${result.timeSeconds}s
Moves: ${result.moves}`);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />
      <div className="flex-1 ml-16 p-8 pt-24">
        <Header />
        <div className="h-full flex items-center justify-center p-6">
          <TileSlider size={4} onEnd={handleEnd} />
        </div>
      </div>
    </div>
  );
}
