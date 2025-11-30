import React from "react";
import MemoryMatch from "./components/MemoryMatch";

export default function App() {
  const handleEnd = (result) => {
    console.log("Game result:", result);
    alert(`Game Finished!
Time: ${result.timeSeconds}s
Moves: ${result.moves}
Accuracy: ${result.accuracy}%`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <MemoryMatch size={6} onEnd={handleEnd} />
    </div>
  );
}
