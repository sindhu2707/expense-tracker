function Balance({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg text-center max-w-sm mx-auto">
      <h2 className="text-3xl font-bold mb-2">Total Spent</h2>
      <p className="text-4xl font-black">${total.toFixed(2)}</p>
    </div>
  );
}

export default Balance;
