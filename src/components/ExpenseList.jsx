import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expenses, onDelete, onEdit, onUpdate }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses found!</h3>
        <p className="text-gray-500">Add your first expense to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ExpenseList;
