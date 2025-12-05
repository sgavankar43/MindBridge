import React, { useEffect, useRef, useState } from "react";

/**
 * BubblePop – Fixed version (robust timer/raf management)
 *
 * Props:
 *  - duration (seconds) default 30
 *  - spawnInterval (ms) default 800
 *  - onEnd(result) called once with { score, popped, missed, durationSeconds }
 */

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function BubblePop({
  duration = 30,
  spawnInterval = 800,
  onEnd
}) {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState(0);
  const [missed, setMissed] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  // refs for timers / ids
  const nextIdRef = useRef(1);
  const spawnTimerRef = useRef(null);
  const rafIdRef = useRef(null);
  const runningRef = useRef(false);
  const lastTimestampRef = useRef(null);

  // spawn bubble
  const spawnBubble = () => {
    const id = nextIdRef.current++;
    const left = rand(5, 95);
    const size = rand(45, 90);
    const speed = rand(0.12, 0.30); // normalized units per second
    setBubbles((prev) => [...prev, { id, left, bottom: 0, size, speed }]);
  };

  // pop bubble
  const popBubble = (id) => {
    // remove bubble
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 10);
    setPopped((p) => p + 1);
  };

  // start the game
  const startGame = () => {
    // clear any leftover timers (safety)
    clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = null;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // reset state
    nextIdRef.current = 1;
    setBubbles([]);
    setScore(0);
    setPopped(0);
    setMissed(0);
    setTimeLeft(duration);
    setRunning(true);
    runningRef.current = true;
    lastTimestampRef.current = performance.now();

    // spawn interval
    spawnTimerRef.current = setInterval(() => spawnBubble(), spawnInterval);

    // RAF loop
    const tick = (now) => {
      if (!runningRef.current) return; // stop immediately if not running

      const dt = (now - lastTimestampRef.current) / 1000; // seconds
      lastTimestampRef.current = now;

      // update bubbles
      setBubbles((prev) => {
        const updated = prev
          .map((b) => ({ ...b, bottom: b.bottom + b.speed * dt }))
          .filter((b) => {
            if (b.bottom >= 1) {
              // bubble passed top -> counted as missed
              setMissed((m) => m + 1);
              return false;
            }
            return true;
          });
        return updated;
      });

      // update time left
      setTimeLeft((t) => {
        const nt = Math.max(0, t - dt);
        if (nt === 0) {
          // end game on next RAF tick (but ensure only one end)
          endGame();
        }
        return nt;
      });

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  };

  // end the game (safe)
  const endGame = () => {
    if (!runningRef.current && !running) return; // already stopped

    // Stop loops and timers
    runningRef.current = false;
    setRunning(false);

    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // clear bubbles visually
    setBubbles([]);

    // call onEnd once, after clearing timers (use setTimeout 0 to ensure state settled)
    const result = {
      score,
      popped,
      missed,
      durationSeconds: duration
    };

    // ensure onEnd executes asynchronously so UI can update
    setTimeout(() => {
      if (typeof onEnd === "function") {
        try {
          onEnd(result);
        } catch (e) {
          // swallow to avoid breaking UI
          console.error("onEnd callback error:", e);
        }
      } else {
        // nothing to do
      }
    }, 0);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 rounded-2xl shadow-xl bg-white border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-700">Bubble Pop</h3>
          <p className="text-sm text-slate-500">Relax & pop calming bubbles</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Time Left</p>
          <p className="font-mono text-lg">{Math.ceil(timeLeft)}s</p>
          <p className="text-xs text-slate-400">Score</p>
          <p className="font-bold text-indigo-600">{score}</p>
        </div>
      </div>

      <div className="relative w-full h-64 bg-gradient-to-b from-indigo-50 to-slate-100 rounded-xl overflow-hidden border">
        {bubbles.map((b) => {
          const bottomPct = Math.min(99, b.bottom * 100);
          return (
            <button
              key={b.id}
              onClick={() => popBubble(b.id)}
              aria-label="Pop bubble"
              className="absolute rounded-full shadow-md transition-transform active:scale-90"
              style={{
                left: `${b.left}%`,
                bottom: `${bottomPct}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                transform: "translateX(-50%)",
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.45)),
                  radial-gradient(circle at 70% 70%, rgba(255,255,255,0.18), rgba(0,0,0,0.04)),
                  linear-gradient(135deg, #a5f3fc, #60a5fa)
                `,
                border: "2px solid rgba(255,255,255,0.6)",
                boxShadow: "0 0 15px rgba(96,165,250,0.28)",
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">
          Popped: <span className="font-mono">{popped}</span> • Missed:{" "}
          <span className="font-mono">{missed}</span>
        </div>

        <div className="space-x-2">
          {!running ? (
            <button
              onClick={startGame}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
            >
              Start
            </button>
          ) : (
            <button
              onClick={endGame}
              className="px-4 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
            >
              End
            </button>
          )}
        </div>
      </div>
    </div>
  );
}