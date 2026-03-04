import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expenses, onDelete, onEdit, onDuplicate, selectedIds, setSelectedIds, onBulkDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">No results found</h3>
        <p className="text-gray-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  const allSelected = expenses.every((e) => selectedIds.includes(e.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !expenses.map((e) => e.id).includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...expenses.map((e) => e.id)])]);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <div className="lg:col-span-1 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
      {/* Bulk action bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-indigo-500"
            />
            Select all
          </label>
          {selectedIds.length > 0 && (
            <button
              onClick={onBulkDelete}
              className="px-4 py-1.5 text-xs font-bold text-red-400 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-all"
            >
              🗑 Delete {selectedIds.length} selected
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, index) => (
          <div
            key={expense.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ExpenseItem
              expense={expense}
              onDelete={onDelete}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              selected={selectedIds.includes(expense.id)}
              onToggleSelect={toggleOne}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpenseList;