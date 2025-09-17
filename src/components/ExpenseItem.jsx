function ExpenseItem({ expense, onDelete }) {
  return (
    <li>
      {expense.text} - ₹{expense.amount} ({expense.category})
      <button onClick={() => onDelete(expense.id)}>❌</button>
    </li>
  );
}

export default ExpenseItem;
