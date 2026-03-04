import { getCurrencySymbol } from "../utils/currency";

function BudgetPanel({ budgets, setBudgets, expenses, currency, rolloverEnabled, setRolloverEnabled }) {
  const categories = [
    { name: "Food", emoji: "🍔" },
    { name: "Transport", emoji: "🚗" },
    { name: "Shopping", emoji: "🛒" },
    { name: "Bills", emoji: "🧾" },
    { name: "Entertainment", emoji: "🎬" },
    { name: "Health", emoji: "🏥" },
    { name: "Other", emoji: "📋" },
  ];

  const spent = (category) =>
    expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);

  const handleBudgetChange = (category, value) => {
    setBudgets((prev) => ({ ...prev, [category]: Number(value) || 0 }));
  };

  const handleSaveBudget = async (category, amount) => {
    try {
      const month = currentMonth.toISOString().slice(0, 7) // "2026-02"
      await api.saveBudget({ category, amount, month })
    } catch (err) {
      toast.error('Failed to save budget')
    }
  }

  return (
    <div className="bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Category Budgets</h2>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
          <div
            onClick={() => setRolloverEnabled(!rolloverEnabled)}
            className={`w-10 h-5 rounded-full transition-all duration-300 relative cursor-pointer ${
              rolloverEnabled ? "bg-indigo-500" : "bg-white/20"
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
              rolloverEnabled ? "left-5" : "left-0.5"
            }`} />
          </div>
          Rollover unspent
        </label>
      </div>
      
      <div className="space-y-5">
        {categories.map(({ name, emoji }) => {
          const budget = budgets[name] || 0;
          const spentAmt = spent(name);
          const pct = budget > 0 ? Math.min((spentAmt / budget) * 100, 100) : 0;
          const over = spentAmt > budget && budget > 0;
          const barColor = pct >= 90 ? "bg-red-500" : pct >= 65 ? "bg-yellow-400" : "bg-indigo-400";

          return (
            <div key={name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm font-semibold">
                  {emoji} {name}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className={over ? "text-red-400 font-bold" : "text-gray-400"}>
                    {getCurrencySymbol(currency)}{spentAmt.toFixed(0)}
                  </span>
                  <span className="text-gray-600">/</span>
                  <input
                    type="number"
                    value={budget === 0 ? "" : budget}
                    onChange={(e) => handleBudgetChange(name, e.target.value)}
                    placeholder="set"
                    className="w-20 text-right bg-transparent border-b border-white/20 focus:border-indigo-400 outline-none text-gray-300 font-semibold placeholder-gray-600"
                  />
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {over ? (
                <p className="text-red-400 text-xs mt-1 animate-pulse">
                  🚨 Over by {getCurrencySymbol(currency)}{(spentAmt - budget).toFixed(0)}
                </p>
              ) : pct >= 100 ? (
                <p className="text-red-400 text-xs mt-1">
                  🚨 Budget maxed out
                </p>
              ) : pct >= 75 ? (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠️ {Math.round(100 - pct)}% remaining — running low
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BudgetPanel;