import { getCurrencySymbol } from "../utils/currency";

function BiggestExpense({ expenses, currency }) {
  if (!expenses.length) return null;

  const biggest = expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0]);

  return (
    <div className="bg-white/3 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Biggest Expense</p>
        <p className="text-xl font-black text-gray-100">{biggest.text}</p>
        <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded-full">{biggest.category}</span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-3xl font-black text-red-400">🔥</p>
        <p className="text-2xl font-black text-red-400">{getCurrencySymbol(currency)}{biggest.amount.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default BiggestExpense;