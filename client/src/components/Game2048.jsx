import React, { useEffect, useState, useCallback } from "react";

/**
 * Game2048.jsx
 *
 * Props:
 *  - size = 4  (grid size)
 *  - onGameOver({ score }) optional callback
 *
 * Usage:
 *  <Game2048 onGameOver={(r)=>handleGameEnd(r,"2048")} />
 */

const GRID_SIZE = 4;
const START_TILES = 2;
const TILE_PROBABILITY_4 = 0.1; // 10% chance for a '4' tile

// Utility helpers
const makeEmptyGrid = (n = GRID_SIZE) => Array.from({ length: n }, () => Array(n).fill(0));
const cloneGrid = (g) => g.map((row) => row.slice());
const getEmptyCells = (g) => {
  const empties = [];
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[r].length; c++)
      if (g[r][c] === 0) empties.push([r, c]);
  return empties;
};
const addRandomTile = (g) => {
  const empties = getEmptyCells(g);
  if (empties.length === 0) return g;
  const idx = Math.floor(Math.random() * empties.length);
  const [r, c] = empties[idx];
  g[r][c] = Math.random() < TILE_PROBABILITY_4 ? 4 : 2;
  return g;
};

// rotate grid clockwise (useful to implement moves by rotating)
const rotateClockwise = (g) => {
  const n = g.length;
  const out = makeEmptyGrid(n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = g[r][c];
    }
  }
  return out;
};

// slide and merge a single row left; returns { newRow, gainedScore, moved }
const slideAndMergeRow = (row) => {
  const arr = row.filter((v) => v !== 0);
  let moved = false;
  let gained = 0;
  // merge
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] = arr[i] * 2;
      gained += arr[i];
      arr.splice(i + 1, 1);
      moved = true;
    }
  }
  // pad zeros
  while (arr.length < row.length) arr.push(0);
  // detect moved (position change)
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== arr[i]) moved = true;
  }
  return { newRow: arr, gainedScore: gained, moved };
};

// check if any move possible
const canMakeMove = (g) => {
  const n = g.length;
  // if any empty cell
  if (getEmptyCells(g).length > 0) return true;
  // check adjacent equals horizontally and vertically
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (c + 1 < n && g[r][c] === g[r][c + 1]) return true;
      if (r + 1 < n && g[r][c] === g[r + 1][c]) return true;
    }
  }
  return false;
};

export default function Game2048({ size = GRID_SIZE, onGameOver }) {
  const [grid, setGrid] = useState(() => {
    const g = makeEmptyGrid(size);
    // start tiles
    for (let i = 0; i < START_TILES; i++) addRandomTile(g);
    return g;
  });

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("gbest") || 0));
  const [gameOver, setGameOver] = useState(false);
  const [movedThisTurn, setMovedThisTurn] = useState(false);

  // helper to start a new game
  const newGame = useCallback(() => {
    const g = makeEmptyGrid(size);
    for (let i = 0; i < START_TILES; i++) addRandomTile(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setMovedThisTurn(false);
  }, [size]);

  // generic move-left, with rotate for other directions
  // dir: 0 = left, 1 = up, 2 = right, 3 = down (clockwise)
  const move = useCallback(
    (dir) => {
      if (gameOver) return;
      let g = cloneGrid(grid);
      // rotate grid clockwise 'dir' times so that we always move left
      for (let i = 0; i < dir; i++) g = rotateClockwise(g);

      let moved = false;
      let gained = 0;
      const n = g.length;
      let newG = makeEmptyGrid(n);
      for (let r = 0; r < n; r++) {
        const { newRow, gainedScore, moved: rowMoved } = slideAndMergeRow(g[r]);
        gained += gainedScore;
        if (rowMoved) moved = true;
        newG[r] = newRow;
      }

      // rotate back counter-clockwise (3 times clockwise) to original orientation
      for (let i = 0; i < (4 - dir) % 4; i++) newG = rotateClockwise(newG);

      if (moved) {
        // add a new tile
        addRandomTile(newG);
        setGrid(newG);
        setScore((s) => {
          const ns = s + gained;
          if (ns > best) {
            setBest(ns);
            localStorage.setItem("gbest", String(ns));
          }
          return ns;
        });
        setMovedThisTurn(true);
      } else {
        setMovedThisTurn(false);
      }
    },
    [grid, gameOver, best]
  );

  // convenience wrappers
  const moveLeft = useCallback(() => move(0), [move]);
  const moveUp = useCallback(() => move(1), [move]);
  const moveRight = useCallback(() => move(2), [move]);
  const moveDown = useCallback(() => move(3), [move]);

  // handle keyboard
  useEffect(() => {
    const handler = (e) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowUp":
          e.preventDefault();
          moveUp();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDown();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveLeft, moveUp, moveRight, moveDown, gameOver]);

  // check game over after each change
  useEffect(() => {
    if (!canMakeMove(grid)) {
      setGameOver(true);
      if (typeof onGameOver === "function") {
        try {
          onGameOver({ score });
        } catch (e) {
          console.error("onGameOver error:", e);
        }
      }
    }
  }, [grid, score, onGameOver]);

  // pretty tile color
  const tileStyle = (v) => {
    if (v === 0) return "bg-transparent";
    const colors = {
      2: "bg-[#eee4da] text-[#776e65]",
      4: "bg-[#ede0c8] text-[#776e65]",
      8: "bg-[#f2b179] text-white",
      16: "bg-[#f59563] text-white",
      32: "bg-[#f67c5f] text-white",
      64: "bg-[#f65e3b] text-white",
      128: "bg-[#edcf72] text-white",
      256: "bg-[#edcc61] text-white",
      512: "bg-[#edc850] text-white",
      1024: "bg-[#edc53f] text-white",
      2048: "bg-[#edc22e] text-white",
    };
    return colors[v] || "bg-indigo-600 text-white";
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-lg border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold">2048</h2>
          <p className="text-sm text-slate-500">Use arrow keys or buttons to merge tiles. Reach 2048!</p>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-400">Score</div>
          <div className="font-bold text-lg">{score}</div>
          <div className="text-xs text-slate-400">Best: {best}</div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[#bbada0] p-3 rounded-lg inline-block">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${size}, ${Math.max(56, Math.floor(320 / size))}px)`,
            gridAutoRows: `${Math.max(56, Math.floor(320 / size))}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center rounded-md ${tileStyle(cell)} text-xl font-semibold`}
              >
                {cell !== 0 ? cell : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="space-x-2">
          <button
            onClick={newGame}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            New Game
          </button>
          <button
            onClick={() => {
              // simple hint: show empty cells count by alert
              alert(`Empty cells: ${getEmptyCells(grid).length}`);
            }}
            className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
          >
            Hint
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* On-screen arrows for mobile */}
          <div className="grid grid-cols-3 gap-1 items-center">
            <div />
            <button
              onClick={moveUp}
              className="p-2 bg-slate-100 rounded hover:bg-slate-200"
              aria-label="Move up"
            >
              ↑
            </button>
            <div />
            <button
              onClick={moveLeft}
              className="p-2 bg-slate-100 rounded hover:bg-slate-200"
              aria-label="Move left"
            >
              ←
            </button>
            <button
              onClick={() => { }}
              className="p-2 bg-transparent"
              aria-hidden
            />
            <button
              onClick={moveRight}
              className="p-2 bg-slate-100 rounded hover:bg-slate-200"
              aria-label="Move right"
            >
              →
            </button>
            <div />
            <button
              onClick={moveDown}
              className="p-2 bg-slate-100 rounded hover:bg-slate-200"
              aria-label="Move down"
            >
              ↓
            </button>
            <div />
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="mt-4 p-3 bg-red-50 border rounded">
          <div className="font-semibold text-red-700">Game Over</div>
          <div className="text-sm text-slate-600">No more valid moves.</div>
        </div>
      )}
    </div>
  );
}