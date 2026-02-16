import { useState } from "react";

function AddExpenseForm({ onAdd, editingExpense }) {
  const [text, setText] = useState(editingExpense?.text || "");
  const [amount, setAmount] = useState(editingExpense?.amount || "");
  const [category, setCategory] = useState(editingExpense?.category || "Other");
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !date) {
      alert("Please fill all fields!");
      return;
    }
    onAdd({ 
      text, 
      amount: +amount, 
      category, 
      date
    });
    setText(""); 
    setAmount(""); 
    setCategory("Other");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white/3 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-gray-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-100">Add Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
            Description
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-4 bg-white/3 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-blue-400 text-gray-100 placeholder-gray-400 font-semibold text-lg transition-all duration-300 group-hover:border-white/50"
            placeholder="Grocery shopping..."
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>

        {/* Amount */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
            Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/3 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-gray-400/30 focus:border-gray-100 text-gray-100 placeholder-gray-400 font-bold text-xl transition-all duration-300 group-hover:border-white/50"
              placeholder="45.99"
              step="0.01"
              min="0"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>

        {/* Date */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-white/3 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-blue-400 text-gray-100 placeholder-gray-400 font-semibold text-lg transition-all duration-300 group-hover:border-white/50"
            required
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>

        {/* Category */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-4 bg-white/3 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-gray-500/30 focus:border-gray-400 text-gray-100 font-semibold text-lg appearance-none bg-no-repeat bg-right transition-all duration-300 group-hover:border-white/50 cursor-pointer"
          >
            <option className="bg-gray-900 text-gray-100" value="Food">🍔 Food</option>
            <option className="bg-gray-900 text-gray-100" value="Transport">🚗 Transport</option>
            <option className="bg-gray-900 text-gray-100" value="Entertainment">🎬 Entertainment</option>
            <option className="bg-gray-900 text-gray-100" value="Shopping">🛒 Shopping</option>
            <option className="bg-gray-900 text-gray-100" value="Other">🏥 Health</option>
            <option className="bg-gray-900 text-gray-100" value="Other">📋 Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r bg-gradient-to-r from-gray-700 to-gray-500 hover:from-gray-600 hover:to-gray-400 hover:via-gray-700 hover:to-gray-700 text-gray-100 py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 group/button"
        >
          <span>Add Expense</span>
          <svg className="w-6 h-6 group-hover/button:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </form>

      {/* Quick Stats Preview */}
      {text && amount && (
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-200 text-sm mb-1">Preview:</p>
          <p className="text-2xl font-black bg-gradient-to-r from-gray-400 to-blue-400 bg-clip-text text-transparent">
            ${(+amount).toFixed(2)} • {category}
          </p>
        </div>
      )}
    </div>
  );
}

export default AddExpenseForm;
