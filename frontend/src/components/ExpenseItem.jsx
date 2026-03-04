import { useState } from "react";
import { getCurrencySymbol } from "../utils/currency";

function ExpenseItem({ expense, onDelete, onEdit, onDuplicate, selected, onToggleSelect }) {
  const [deleting, setDeleting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleDelete = () => {
    onDelete(expense.id);
  };


  return (
    <div
      className={`bg-white/5 border transition-all duration-300 rounded-2xl p-6 ${
        selected ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/10"
      } ${deleting ? "opacity-0 scale-95 -translate-x-4" : "opacity-100 scale-100"}`}
    >
      <div className="flex justify-between items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(expense.id)}
          className="mt-1 w-4 h-4 rounded accent-indigo-500 shrink-0 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-100">{expense.text}</h3>
            {expense.isRecurring && (
              <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">↻ {expense.recurringType}</span>
            )}
            {expense.isSplit && (
              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">Split</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded-full">{expense.category}</span>
            {expense.paymentMethod && (
              <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded-full">{expense.paymentMethod}</span>
            )}
            {expense.merchant && (
              <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded-full">{expense.merchant}</span>
            )}
            {expense.date && (
              <span className="text-xs text-gray-500">
                {new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          {expense.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {expense.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 ml-4">
          <span className="text-2xl font-black text-red-400">
            {getCurrencySymbol(expense.currency)}
            {expense.amount.toFixed(2)}
          </span>
          <div className="flex gap-2">
            {expense.receipt && (
              <button
                onClick={() => setShowReceipt(!showReceipt)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  showReceipt
                    ? "text-green-300 bg-green-500/30"
                    : "text-green-400 bg-green-500/20 hover:bg-green-500/30"
                }`}
                title="View receipt"
              >
                🧾 Receipt
              </button>
            )}
            <button
              onClick={() => onEdit(expense)}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/20 rounded-xl hover:bg-indigo-500/30 transition-all"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => onDuplicate(expense)}
              className="px-3 py-1.5 text-xs font-semibold text-yellow-400 bg-yellow-500/20 rounded-xl hover:bg-yellow-500/30 transition-all"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Thumbnail */}
      {showReceipt && expense.receipt && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <img
            src={expense.receipt}
            alt="Receipt"
            className="w-full max-h-64 object-contain rounded-xl border border-white/10 bg-white/3 cursor-pointer"
            onClick={() => window.open(expense.receipt, "_blank")}
            title="Click to open full size"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">Click image to open full size</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseItem;