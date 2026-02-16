function ExpenseItem({ expense, onDelete, onEdit }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.text}</h3>
        <p className="text-sm text-gray-500 mb-2">{expense.category}</p>
        <span className="text-2xl font-bold text-red-600">${expense.amount.toFixed(2)}</span>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => onEdit(expense)}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:ring-2 focus:ring-red-500 transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ExpenseItem;
