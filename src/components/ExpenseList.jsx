import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) return <p>No expenses found!</p>;
  return (
    <ul>
      {expenses.map((e) => (
        <ExpenseItem key={e.id} expense={e} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default ExpenseList;
