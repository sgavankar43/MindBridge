import React, { useState } from "react";

/**
 * Calm Coloring (very simple)
 * - Presents an SVG shape with regions (rect/circle/path)
 * - User picks a color and clicks region to fill
 */
export default function Coloring({ presetColors = ["#fbcfe8","#bfdbfe","#bbf7d0","#fde68a"] }) {
  const [colors, setColors] = useState({});
  const fillRegion = (id, color) => setColors((s) => ({ ...s, [id]: color }));
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-2">Calm Coloring</h3>
      <div className="flex gap-3 mb-3">
        {presetColors.map((c) => (
          <button key={c} style={{ background: c }} className="w-8 h-8 rounded" onClick={() => { /* store selected color in state */ }} />
        ))}
      </div>

      <svg viewBox="0 0 200 120" className="w-full rounded">
        <rect x="10" y="10" width="80" height="100" fill={colors["r1"]||"#fff"} stroke="#ddd" onClick={()=>fillRegion("r1", presetColors[0])} />
        <circle cx="150" cy="40" r="30" fill={colors["c1"]||"#fff"} stroke="#ddd" onClick={()=>fillRegion("c1", presetColors[1])} />
        <path d="M120 80 q20 -30 40 0" fill={colors["p1"]||"#fff"} stroke="#ddd" onClick={()=>fillRegion("p1", presetColors[2])} />
      </svg>
    </div>
  );
}
