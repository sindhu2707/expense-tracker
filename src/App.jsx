import { useState, useEffect } from "react";
import AddExpenseForm from "./components/AddExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseChart from "./components/ExpenseChart";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [income, setIncome] = useState(2500);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // ADD THIS
  const [viewMode, setViewMode] = useState('month');
  



  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    setFilteredExpenses(filterExpenses());
  }, [currentMonth, selectedDate, viewMode, expenses]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = income - totalExpenses;


  const chartData = filteredExpenses.reduce((acc, expense) => {

    const found = acc.find(item => item.name === expense.category);
    if (found) found.value += expense.amount;
    else acc.push({ name: expense.category, value: expense.amount });
    return acc;
  }, []).slice(0, 5);

  const addExpense = (expense) => {
    if (editingExpense) {
      setExpenses(expenses.map((e) => e.id === editingExpense.id ? { ...e, ...expense } : e));
      setEditingExpense(null);
    } else {
      setExpenses([...expenses, { id: Date.now(), ...expense }]);
    }
  };

  const deleteExpense = (id) => setExpenses(expenses.filter((e) => e.id !== id));
  const editExpense = (expense) => setEditingExpense(expense);
  const clearAll = () => {
    setExpenses([]);
    setEditingExpense(null);
  };

  // Filter expenses for current month
  const filterExpenses = () => {
    if (viewMode === 'month') {
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date || Date.now());
        return expenseDate.getFullYear() === currentMonth.getFullYear() &&
              expenseDate.getMonth() === currentMonth.getMonth();
      });
    } else {
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date || Date.now());
        return expenseDate.toDateString() === selectedDate.toDateString();
      });
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto mb-8">
        {/* Header with Month/Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Expense Tracker</h1>
            </div>
          </div>
          
          {/* Chevron + Date Navigation */}
          <div className="flex items-center space-x-2">
            {/* Month Left Chevron */}
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-3 bg-white/3 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-200"
              title="Previous Month"
            >
              <svg className="w-5 h-5 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Month Display / Date Picker Toggle */}
            <div className="flex items-center space-x-4 bg-white/3 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode(viewMode === 'month' ? 'date' : 'month')}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                {viewMode === 'month' ? (
                  <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>

              <div className="text-center min-w-[160px]">
                {viewMode === 'month' ? (
                  <>
                    <div className="text-2xl font-black text-gray-100">
                      {currentMonth.toLocaleDateString('en-GB', { month: 'long' })}
                    </div>
                    <div className="text-lg text-gray-400 font-semibold">
                      {currentMonth.getFullYear()}
                    </div>
                  </>
                ) : (
                  <div className="text-xl font-bold text-gray-100">
                    {selectedDate.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Month Right Chevron */}
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-3 bg-white/3 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-200"
              title="Next Month"
            >
              <svg className="w-5 h-5 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Date Picker - Only show in date mode */}
            {viewMode === 'date' && (
              <div className="ml-4">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl border border-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
                />
              </div>
            )}
          </div>
        </div>



        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">Income</p>
            <p className="text-4xl font-black text-gray-100 mt-2">$2,500</p>
          </div>
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-700/20 to-gray-800/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">Expenses</p>
            <p className="text-4xl font-black text-gray-100 mt-2">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-600/20 to-gray-700/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">Balance</p>
            <p className={`text-4xl font-black mt-2 ${balance >= 0 ? 'text-gray-100' : ' text-gray-300'}`}>
              ${Math.abs(balance).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">
            Spending Breakdown
            <span className="ml-auto px-3 py-1 bg-white/20 text-gray-100 text-xs rounded-full float-right">
              ${totalExpenses.toFixed(0)} total
            </span>
          </h2>
          {expenses.length > 0 ? (
            <div className="flex items-center justify-center space-x-12">
              <div className="flex-1 max-w-md">
                <ExpenseChart expenses={expenses} />
              </div>
              <div className="w-48 space-y-3 text-sm min-w-[180px]">
                {chartData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-gray-100 py-1">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{backgroundColor: `hsl(${i * 60}, 70%, 50%)`}}
                      />
                      <span>{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono block">${cat.value.toFixed(0)}</span>
                      <span className="text-gray-400 text-xs">
                        ({((cat.value/totalExpenses)*100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-100/70 flex flex-col items-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl">Add expenses to see breakdown</p>
            </div>
          )}
        </div>

        {/* Form & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <AddExpenseForm onAdd={addExpense} editingExpense={editingExpense} />
          </div>
          <div className="lg:col-span-2 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-100">Recent Expenses</h3>
              {expenses.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-6 py-2 bg-red-500/30 hover:bg-red-500/50 text-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} onEdit={editExpense} />

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
