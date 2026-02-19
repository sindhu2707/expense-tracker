function ExpenseChart({ expenses, onCategoryClick }) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const data = expenses.reduce((acc, expense) => {
    const found = acc.find(item => item.name === expense.category);
    if (found) found.value += expense.amount;
    else acc.push({ name: expense.category, value: expense.amount });
    return acc;
  }, []).slice(0, 5); // Top 5 categories

  if (totalExpenses === 0 || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-white/10 rounded-2xl">
        <div className="text-center text-white/60">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-64 h-64">
        {data.map((entry, index) => {
          const percentage = (entry.value / totalExpenses) * 100;
          const radius = 80;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (percentage / 100) * circumference;

          return (
            <g key={entry.name} onClick={() => onCategoryClick(entry.name)} className="cursor-pointer group">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={`hsl(${index * 60}, 70%, 50%)`}
                strokeWidth="25"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transform -rotate-90 origin-center transition-all duration-1000 group-hover:opacity-80"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            </g>
          );
        })}
        <circle
          cx="100"
          cy="100"
          r="75"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="25"
        />
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {data.map((entry, index) => (
          <button
            key={entry.name}
            onClick={() => onCategoryClick(entry.name)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-sm"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
            />
            <span className="text-gray-300 font-semibold">{entry.name}</span>
            <span className="text-gray-500">${entry.value.toFixed(0)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExpenseChart;
