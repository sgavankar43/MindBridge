export function ProgressStatistics() {
  const dots = Array(35).fill(false)
  const activeDots = [
    0, 1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  ]

  return (
    <div className="bg-[#2d2d2d] rounded-3xl p-5 flex-1">
      <h3 className="text-xs font-medium text-gray-400 mb-3">PROGRESS STATISTICS</h3>

      <div className="text-center mb-4">
        <span className="text-5xl font-bold text-white">84%</span>
        <p className="text-xs text-gray-400 mt-1">
          Of the weekly
          <br />
          plan completed
        </p>
      </div>

      {/* Dot Matrix */}
      <div className="grid grid-cols-7 gap-1.5 mt-4">
        {dots.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full ${activeDots.includes(index) ? "bg-[#f1e14c]" : "bg-[#4a4a4a]"}`}
          />
        ))}
      </div>
    </div>
  )
}
