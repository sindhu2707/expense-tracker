import { useState } from "react";

function AddExpenseForm({ onAdd }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount) return;
    onAdd({ text, amount: +amount, category });
    setText("");
    setAmount("");
    setCategory("Other");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Expense name"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Food">Food</option>
        <option value="Travel">Travel</option>
        <option value="Shopping">Shopping</option>
        <option value="Bills">Bills</option>
        <option value="Other">Other</option>
      </select>
      <button type="submit">➕ Add Expense</button>
    </form>
  );
}

export default AddExpenseForm;
