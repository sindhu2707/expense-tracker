function Balance({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return <h2>💰 Balance: ₹{total}</h2>;
}

export default Balance;
