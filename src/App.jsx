<<<<<<< HEAD
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
=======
import React, { useState, Suspense } from "react";
import MemoryMatch from "./components/MemoryMatch";
import BubblePop from "./components/BubblePop";
import TileSlider from "./components/TileSlider";
import Game2048 from "./components/Game2048";
import Coloring from "./components/Coloring";

// 2048: we show a safe placeholder so app runs if you haven't added a Game2048 component.
// If you later add src/components/Game2048.jsx (or install a package and export default),
// replace Placeholder2048 with an import.
// Example: const Game2048 = React.lazy(() => import("./components/Game2048"));
const Placeholder2048 = ({ onGameOver }) => (
  <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow border text-center">
    <h3 className="text-lg font-semibold mb-2">2048 (Not Installed)</h3>
    <p className="text-sm text-slate-500 mb-4">
      2048 component not found. To add 2048 quickly you can:
    </p>
    <ol className="text-left text-sm list-decimal list-inside text-slate-600">
      <li>Install a lightweight npm package (or copy a small implementation):</li>
      <li>
        Example (pseudo): <code className="bg-slate-100 px-1 rounded">npm i react-2048</code>
      </li>
      <li>Create <code>src/components/Game2048.jsx</code> exporting the component.</li>
      <li>Then replace this placeholder with a lazy import: <code>const Game2048 = React.lazy(()=>import('./components/Game2048'))</code></li>
    </ol>
    <div className="mt-4">
      <button
        onClick={() => onGameOver && onGameOver({ score: 0 })}
        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded"
      >
        Mark Quick Demo Over
      </button>
    </div>
  </div>
);

export default function App() {
  const [active, setActive] = useState(null); // "memory" | "bubble" | "tile" | "2048" | "color" | null
  const [sessionKey, setSessionKey] = useState(0);
  const [history, setHistory] = useState([]);

  const startGame = (type) => {
    setActive(type);
    setSessionKey((k) => k + 1);
  };

  const stopGame = () => {
    setActive(null);
    setSessionKey((k) => k + 1);
  };

  // Normalized end handler: merges different game result shapes into a record
  const handleGameEnd = (result = {}, gameType) => {
    const record = {
      id: Date.now(),
      game: gameType,
      result,
      playedAt: new Date().toISOString(),
    };
    setHistory((h) => [record, ...h]);

    // Friendly notification (customize as you like)
    const summary =
      gameType === "memory"
        ? `Time: ${result.timeSeconds ?? 0}s • Moves: ${result.moves ?? 0} • Accuracy: ${result.accuracy ?? 0}%`
        : gameType === "bubble"
        ? `Score: ${result.score ?? 0} • Popped: ${result.popped ?? 0} • Missed: ${result.missed ?? 0}`
        : gameType === "tile"
        ? `Time: ${result.timeSeconds ?? 0}s • Moves: ${result.moves ?? 0}`
        : gameType === "2048"
        ? `Score: ${result.score ?? 0}`
        : gameType === "color"
        ? `Activity completed`
        : JSON.stringify(result);

    alert(`Finished ${labelFor(gameType)}!\n${summary}`);

    // Remount the game so user can start fresh if they want
    setSessionKey((k) => k + 1);
    // Optionally auto-close after finishing:
    // setActive(null);
  };

  const labelFor = (type) => {
    switch (type) {
      case "memory":
        return "Memory Match";
      case "bubble":
        return "Bubble Pop";
      case "tile":
        return "Tile Slider";
      case "2048":
        return "2048";
      case "color":
        return "Calm Coloring";
      default:
        return "Game";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">MindBridge — Micro Games</h1>
          <div className="text-sm text-slate-600">Choose a short calming activity</div>
        </header>

        {/* Chooser */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <GameCard
            title="Memory Match"
            subtitle="Card-flip matching — short focus boost"
            active={active === "memory"}
            onClick={() => startGame("memory")}
          />
          <GameCard
            title="Bubble Pop"
            subtitle="Relax & pop calming bubbles"
            active={active === "bubble"}
            onClick={() => startGame("bubble")}
          />
          <GameCard
            title="Tile Slider"
            subtitle="Slide tiles to order them (15-puzzle)"
            active={active === "tile"}
            onClick={() => startGame("tile")}
          />
          <GameCard
            title="2048"
            subtitle="Merge tiles — strategic micro-game"
            active={active === "2048"}
            onClick={() => startGame("2048")}
          />
          <GameCard
            title="Calm Coloring"
            subtitle="Color simple shapes for a mindful break"
            active={active === "color"}
            onClick={() => startGame("color")}
          />
        </div>

        {/* Active Game Area */}
        <div className="mb-6">
          {active ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">{labelFor(active)}</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setSessionKey((k) => k + 1)}
                    className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm"
                  >
                    Restart
                  </button>
                  <button
                    onClick={stopGame}
                    className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div key={`${active}-${sessionKey}`}>
                {active === "memory" && (
                  <MemoryMatch size={6} onEnd={(res) => handleGameEnd(res, "memory")} />
                )}

                {active === "bubble" && (
                  <BubblePop duration={30} spawnInterval={800} onEnd={(res) => handleGameEnd(res, "bubble")} />
                )}

                {active === "tile" && <TileSlider size={4} onEnd={(res) => handleGameEnd(res, "tile")} />}

                {active === "2048" && (<Game2048 onGameOver={(r) => handleGameEnd(r, "2048")} />)}

                {active === "color" && <Coloring />}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-xl shadow text-center text-slate-600">
              No activity running. Choose one above to start a quick break.
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Recent Game Sessions</h3>
          {history.length === 0 ? (
            <div className="text-slate-500">No sessions yet — play a micro-game to see results here.</div>
          ) : (
            <ul className="space-y-3">
              {history.map((s) => (
                <li key={s.id} className="p-3 bg-white rounded-lg border flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {labelFor(s.game)}
                      <span className="text-xs text-slate-400 ml-2">• {new Date(s.playedAt).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {summaryTextForRecord(s)}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">
                    <button
                      onClick={() => {
                        setActive(s.game);
                        setSessionKey((k) => k + 1);
                      }}
                      className="px-3 py-1 bg-indigo-50 rounded text-indigo-600 hover:bg-indigo-100"
                    >
                      Replay
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helper components & utils */

function GameCard({ title, subtitle, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left shadow-sm hover:shadow-md transition ${
        active ? "bg-indigo-50 border-indigo-300" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="text-indigo-600 font-bold">Play</div>
      </div>
    </button>
  );
}

function summaryTextForRecord(rec) {
  const { game, result } = rec;
  if (game === "memory") {
    return `Time ${result.timeSeconds ?? 0}s • Moves ${result.moves ?? 0} • Accuracy ${result.accuracy ?? 0}%`;
  }
  if (game === "bubble") {
    return `Score ${result.score ?? 0} • Popped ${result.popped ?? 0} • Missed ${result.missed ?? 0}`;
  }
  if (game === "tile") {
    return `Time ${result.timeSeconds ?? 0}s • Moves ${result.moves ?? 0}`;
  }
  if (game === "2048") {
    return `Score ${result.score ?? 0}`;
  }
  if (game === "color") {
    return `Calm coloring activity`;
  }
  return JSON.stringify(result);
}

/* Placeholder wrapper for 2048 to keep app stable until you add a real implementation */
function Placeholder2048Wrapper({ onGameOver }) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow border text-center">
      <h3 className="text-lg font-semibold mb-2">2048 — Placeholder</h3>
      <p className="text-sm text-slate-500 mb-4">
        You haven't added a 2048 component yet. To add it:
      </p>
      <ol className="list-decimal list-inside text-left text-sm text-slate-600">
        <li>Create <code>src/components/Game2048.jsx</code> exporting a React component (default export).</li>
        <li>Or install an npm package that provides a React 2048 component and wrap it.</li>
        <li>Once added, replace this placeholder with a lazy import for better UX.</li>
      </ol>

      <div className="mt-4 space-x-2">
        <button
          onClick={() => onGameOver && onGameOver({ score: 0 })}
          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded"
        >
          Quick Demo Complete
        </button>
        <button
          onClick={() => {
            // quick guidance copy to clipboard
            navigator.clipboard?.writeText(
              "Create a component in src/components/Game2048.jsx exporting the game component. Example: export default function Game2048(){ return (<div>...</div>)}"
            );
            alert("Clipboard: snippet to create Game2048.jsx copied.");
          }}
          className="px-3 py-1 bg-slate-200 rounded"
        >
          Copy Snippet
        </button>
      </div>
>>>>>>> f146d23 (Games)
    </div>
  );
}
