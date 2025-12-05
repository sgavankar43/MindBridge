export function CaloriesCard() {
  return (
    <div className="bg-white rounded-3xl p-5 w-110">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-medium text-gray-500">CALORIES</h3>
        <div className="text-right">
          <span className="text-xs text-gray-400">Daily Goal</span>
          <p className="text-xs font-medium">2000 Kcal</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative flex justify-center my-4">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#f0f0f0" strokeWidth="12" />
          {/* Fat - Gray */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="12"
            strokeDasharray="283"
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />
          {/* Carbs - Red */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#e74c3c"
            strokeWidth="12"
            strokeDasharray="283"
            strokeDashoffset="127"
            transform="rotate(-90 60 60)"
          />
          {/* Protein - Yellow */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#f1c40f"
            strokeWidth="12"
            strokeDasharray="283"
            strokeDashoffset="198"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">20%</span>
          <span className="text-2xl font-bold text-[#2d2d2d]">1.560</span>
          <span className="text-xs text-gray-400">/Kcal</span>
        </div>
        {/* Percentage Labels */}
        <span className="absolute top-2 right-0 text-xs text-gray-400">35%</span>
        <span className="absolute bottom-8 right-0 text-xs text-gray-400">45%</span>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-center mt-2">
        <div>
          <p className="text-xs font-medium">118 /gram</p>
          <div className="flex items-center gap-1 justify-center">
            <span className="w-2 h-2 bg-[#f1c40f] rounded-full" />
            <span className="text-xs text-gray-400">Protein</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium">220 /gram</p>
          <div className="flex items-center gap-1 justify-center">
            <span className="w-2 h-2 bg-[#e74c3c] rounded-full" />
            <span className="text-xs text-gray-400">Carbs</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium">90 /gram</p>
          <div className="flex items-center gap-1 justify-center">
            <span className="w-2 h-2 bg-[#4a4a4a] rounded-full" />
            <span className="text-xs text-gray-400">Fat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
