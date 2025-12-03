import React, { useEffect, useState } from "react";

/**
 * TileSlider (15 puzzle)
 * Props:
 *  - size = grid size (default 4 -> 4x4)
 *  - onEnd(result) called with { moves, timeSeconds }
 *
 * Behavior:
 *  - Shuffles to a solvable board on start
 *  - Arrow/Click to move tiles adjacent to empty
 */

function makeSolved(n) {
  const arr = [];
  for (let i = 1; i < n * n; i++) arr.push(i);
  arr.push(null); // empty slot
  return arr;
}

function indexToRC(i, n) {
  return { r: Math.floor(i / n), c: i % n };
}
function rcToIndex(r, c, n) {
  return r * n + c;
}

function shuffleSolvable(arr, n) {
  // Fisher-Yates then check parity; repeat until solvable
  const a = arr.slice();
  const rand = () => Math.floor(Math.random() * a.length);
  let tries = 0;
  while (true) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // check solvable
    const invArr = a.filter((v) => v !== null);
    let inv = 0;
    for (let i = 0; i < invArr.length; i++) {
      for (let j = i + 1; j < invArr.length; j++) {
        if (invArr[i] > invArr[j]) inv++;
      }
    }
    // For even grid (n even), solvability depends on blank row from bottom
    const blankIndex = a.indexOf(null);
    const { r } = indexToRC(blankIndex, n);
    const blankRowFromBottom = n - r;
    const solvable =
      n % 2 === 1
        ? inv % 2 === 0
        : (blankRowFromBottom % 2 === 0) === (inv % 2 === 1);
    if (solvable) return a;
    if (++tries > 1000) return a; // fallback
  }
}

export default function TileSlider({ size = 4, onEnd }) {
  const [board, setBoard] = useState(makeSolved(size));
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    // cleanup timer
    return () => clearInterval(timerId);
  }, [timerId]);

  const start = () => {
    const shuffled = shuffleSolvable(makeSolved(size), size);
    setBoard(shuffled);
    setMoves(0);
    setTimeSeconds(0);
    setRunning(true);
    clearInterval(timerId);
    const tid = setInterval(() => setTimeSeconds((t) => t + 1), 1000);
    setTimerId(tid);
  };

  const reset = () => {
    clearInterval(timerId);
    setBoard(makeSolved(size));
    setMoves(0);
    setTimeSeconds(0);
    setRunning(false);
  };

  const isSolved = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[arr.length - 1] === null;
  };

  useEffect(() => {
    if (running && isSolved(board)) {
      clearInterval(timerId);
      setRunning(false);
      if (onEnd) onEnd({ moves, timeSeconds });
    }
  }, [board, running, moves, timeSeconds, timerId, onEnd]);

  const handleClick = (index) => {
    const n = size;
    const { r, c } = indexToRC(index, n);
    const neighbors = [
      { r: r - 1, c },
      { r: r + 1, c },
      { r, c: c - 1 },
      { r, c: c + 1 },
    ];
    const emptyNeighbor = neighbors
      .filter((p) => p.r >= 0 && p.r < n && p.c >= 0 && p.c < n)
      .map((p) => rcToIndex(p.r, p.c, n))
      .find((idx) => board[idx] === null);
    if (emptyNeighbor !== undefined) {
      const newBoard = board.slice();
      newBoard[emptyNeighbor] = newBoard[index];
      newBoard[index] = null;
      setBoard(newBoard);
      setMoves((m) => m + 1);
    }
  };

  const gridCols = `grid-cols-${size}`;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Tile Slider ({size}×{size})</h3>
          <p className="text-sm text-slate-500">Slide tiles to order them — calming puzzle</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Time</div>
          <div className="font-mono">{timeSeconds}s</div>
          <div className="text-xs text-slate-400">Moves</div>
          <div className="font-bold">{moves}</div>
        </div>
      </div>

      <div className={`grid ${gridCols} gap-2`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.map((val, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`aspect-square rounded-md flex items-center justify-center text-xl font-medium
              ${val === null ? "bg-slate-100" : "bg-indigo-50 text-slate-800"}`}
            aria-label={val === null ? "empty" : `tile ${val}`}
          >
            {val === null ? "" : val}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">Moves: {moves}</div>
        <div className="space-x-2">
          <button onClick={start} className="px-3 py-1 bg-indigo-600 text-white rounded">Shuffle</button>
          <button onClick={reset} className="px-3 py-1 bg-slate-200 rounded">Reset</button>
        </div>
      </div>
    </div>
  );
}
