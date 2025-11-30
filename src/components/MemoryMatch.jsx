import React, { useEffect, useState, useRef } from "react";

/**
 * MemoryMatch Game
 * A clean, calming mini-game perfect for testing.
 */

const DEFAULT_ICONS = [
  "🍃","🌸","☁️","⭐","🕊️","🌞","🍂","🌊","🌱",
  "🪴","✨","🌙"
];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMatch({ size = 6, onEnd, icons = DEFAULT_ICONS }) {
  const totalUnique = Math.min(size, icons.length);
  const initialIcons = icons.slice(0, totalUnique);
  const paired = shuffleArray([...initialIcons, ...initialIcons]);

  const [cards, setCards] = useState(
    paired.map((face, idx) => ({
      id: idx,
      face,
      flipped: false,
      matched: false
    }))
  );

  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);

  const timerRef = useRef(null);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // start timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeSeconds((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function resetGame() {
    const newPaired = shuffleArray([...initialIcons, ...initialIcons]);
    setCards(newPaired.map((face, idx) => ({
      id: idx, face, flipped: false, matched: false
    })));

    setFirst(null);
    setSecond(null);
    setLocked(false);
    setMoves(0);
    setMatchesFound(0);
    setTimeSeconds(0);
    setRunning(false);
    clearInterval(timerRef.current);
  }

  const onFlip = (card) => {
    if (locked) return;
    if (!running) setRunning(true);
    if (card.flipped || card.matched) return;

    const newCards = cards.map(c => 
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    if (!first) {
      setFirst(card);
      return;
    }

    if (first && !second) {
      setSecond(card);
      setLocked(true);
      setMoves(m => m + 1);

      setTimeout(() => {
        const firstCard = newCards.find(c => c.id === first.id);
        const secondCard = newCards.find(c => c.id === card.id);

        if (firstCard.face === secondCard.face) {
          const updated = newCards.map(c =>
            c.face === firstCard.face ? { ...c, matched: true } : c
          );
          setCards(updated);
          setMatchesFound(m => m + 1);
        } else {
          const reverted = newCards.map(c =>
            c.id === firstCard.id || c.id === secondCard.id
              ? { ...c, flipped: false }
              : c
          );
          setCards(reverted);
        }

        setFirst(null);
        setSecond(null);
        setLocked(false);
      }, 700);
    }
  };

  // end game
  useEffect(() => {
    if (matchesFound === totalUnique && totalUnique > 0) {
      setRunning(false);
      clearInterval(timerRef.current);

      const accuracy = Math.round((totalUnique / moves) * 100) || 100;

      if (onEnd) {
        onEnd({ timeSeconds, moves, accuracy });
      }
    }
  }, [matchesFound]);

  const gridCols =
    totalUnique <= 4 ? "grid-cols-4" :
    totalUnique <= 6 ? "grid-cols-6" :
    "grid-cols-8";

  return (
    <div className="max-w-md mx-auto p-5 bg-white rounded-2xl shadow-xl border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Memory Match</h2>
        
        <div className="text-right">
          <p className="text-xs text-slate-400">Time</p>
          <p className="font-mono text-lg">{timeSeconds}s</p>
        </div>
      </div>

      <div className={`grid gap-2 ${gridCols}`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onFlip(card)}
            className={`aspect-square rounded-md flex items-center justify-center text-2xl 
            transition-transform transform
            ${card.flipped || card.matched ? "bg-indigo-100 scale-100" : "bg-slate-200 hover:scale-105"}`}
          >
            {card.flipped || card.matched ? card.face : "?"}
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <div>Moves: {moves}</div>
        <button
          onClick={resetGame}
          className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
