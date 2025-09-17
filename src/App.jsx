import { useState, useEffect } from "react";
import AddExpenseForm from "./components/AddExpenseForm";
import Balance from "./components/Balance";
import ExpenseList from "./components/ExpenseList";
import ExpenseChart from "./components/ExpenseChart";
import "./index.css";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("expenses"));
    if (stored) setExpenses(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense) => {
    setExpenses([...expenses, { ...expense, id: Date.now() }]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.text.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" || e.category === filter)
  );

  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <Balance expenses={expenses} />

      <div style={{ margin: "10px 0", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />

      {expenses.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Spending by Category</h3>
          <ExpenseChart expenses={expenses} />
        </div>
      )}

      <AddExpenseForm onAdd={addExpense} />
    </div>
  );
}

export default App;
