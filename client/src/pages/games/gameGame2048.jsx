import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/Header";
import Game2048 from "@/components/Game2048";

export default function GameGame2048() {
  const handleGameOver = (result) => {
    console.log("2048 result:", result);
    alert(`Game Over!
Score: ${result.score}`);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />
      <div className="flex-1 ml-16 p-8 pt-24">
        <Header />
        <div className="h-full flex items-center justify-center p-6">
          <Game2048 onGameOver={handleGameOver} />
        </div>
      </div>
    </div>
  );
}
