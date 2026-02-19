import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AddExpenseForm from "./components/AddExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseChart from "./components/ExpenseChart";
import { ChartPie } from "lucide-react";
import BudgetPanel from "./components/BudgetPanel";
import toast, { Toaster } from "react-hot-toast";
import MonthlyChart from "./components/MonthlyChart";
import { getCurrencySymbol, CURRENCIES } from "./utils/currency";
import GoalForm from './components/GoalForm';
import BiggestExpense from "./components/BiggestExpense";
import BottomNav from "./components/BottomNav";
import SpendingHeatmap from "./components/SpendingHeatmap";
import { motion, AnimatePresence } from "framer-motion";
import * as api from './api'
import AuthPage from './components/AuthPage'
import ConfirmModal from './components/ConfirmModal'
import ProfileModal from "./components/ProfileModal";


function App() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // ADD THIS
  const [viewMode, setViewMode] = useState('month');
  const [showForm, setShowForm] = useState(false);
  const [income, setIncome] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currency, setCurrency] = useState("INR");
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rolloverEnabled, setRolloverEnabled] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const pickerRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, payload: null })

  const openConfirm = (type, payload = null) =>
    setConfirmModal({ isOpen: true, type, payload })

  const closeConfirm = () =>
    setConfirmModal({ isOpen: false, type: null, payload: null })


  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input, textarea or select
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      switch(e.key) {
        case "n":
        case "N":
          e.preventDefault();
          setShowForm(true);
          break;
        case "Escape":
          setShowForm(false);
          setEditingExpense(null);
          break;
        case "f":
        case "F":
          e.preventDefault();
          document.querySelector('input[placeholder*="Search"]')?.focus();
          break;
        case "ArrowLeft":
          if (viewMode === "month") {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
          }
          break;
        case "ArrowRight":
          if (viewMode === "month") {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
          }
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setShowGoalForm(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMonth, viewMode, showForm]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, budgetsData, goalsData] = await Promise.all([
          api.getExpenses(),
          api.getBudgets(),
          api.getGoals()
        ])

        setExpenses(expensesData)
        setGoals(goalsData)

        // Budgets come back as an array of rows, convert to the object shape your app uses
        if (budgetsData.length > 0) {
          const budgetObj = budgetsData.reduce((acc, b) => {
            acc[b.category] = b.amount
            return acc
          }, {})
          setBudgets(budgetObj)
        }
      } catch (err) {
        toast.error('Failed to load data from server')
        console.error(err)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    let result = expenses.filter(expense => {
      const expenseDate = new Date(expense.date || Date.now());
      if (viewMode === 'month') {
        return expenseDate.getFullYear() === currentMonth.getFullYear() &&
              expenseDate.getMonth() === currentMonth.getMonth();
      } else {
        return expenseDate.toDateString() === selectedDate.toDateString();
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.text?.toLowerCase().includes(q) ||
        e.merchant?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== "All") {
      result = result.filter(e => e.category === filterCategory);
    }

    if (filterPayment !== "All") {
      result = result.filter(e => e.paymentMethod === filterPayment);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.date) - new Date(a.date);
        case "date-asc":  return new Date(a.date) - new Date(b.date);
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc":  return a.amount - b.amount;
        case "name-asc":  return a.text.localeCompare(b.text);
        case "name-desc": return b.text.localeCompare(a.text);
        default: return 0;
      }
    });

    setFilteredExpenses(result);
  }, [currentMonth, selectedDate, viewMode, expenses, searchQuery, filterCategory, filterPayment, sortBy]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const effectiveBudgets = useMemo(() => {
    if (!rolloverEnabled) return budgets;

    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

    return categories.reduce((acc, category) => {
      const base = budgets[category] || 0;
      if (base === 0) return { ...acc, [category]: 0 };

      const prevSpent = expenses
        .filter((e) => {
          const d = new Date(e.date || Date.now());
          return (
            e.category === category &&
            d.getMonth() === prevMonth.getMonth() &&
            d.getFullYear() === prevMonth.getFullYear()
          );
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const unspent = Math.max(base - prevSpent, 0);
      acc[category] = base + unspent;
      return acc;
    }, {});
  }, [budgets, expenses, rolloverEnabled]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const balance = (income ?? 0) - totalExpenses;

  // Spending velocity
  const today = new Date();
  const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysRemaining = isCurrentMonth ? daysInMonth - today.getDate() : 0;
  const monthBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const pctMonthPassed = daysPassed / daysInMonth;
  const pctBudgetUsed = monthBudget > 0 ? totalExpenses / monthBudget : 0;
  const velocityDiff = pctBudgetUsed - pctMonthPassed;
  const projectedTotal = daysPassed > 0 ? (totalExpenses / daysPassed) * daysInMonth : 0;
  const dailyAvg = daysPassed > 0 ? totalExpenses / daysPassed : 0;

  const chartData = filteredExpenses.reduce((acc, expense) => {
    const found = acc.find(item => item.name === expense.category);
    if (found) found.value += expense.amount;
    else acc.push({ name: expense.category, value: expense.amount });
    return acc;
  }, []).slice(0, 5);

  const addExpense = async (expense) => {
    try {
      if (editingExpense?.id) {
        // Map your frontend field names to what the backend expects
        const updated = await api.updateExpense(editingExpense.id, {
          title: expense.text,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          note: expense.notes || ''
        })
        // Merge backend response back with full frontend fields
        setExpenses(prev => prev.map(e => 
          e.id === editingExpense.id ? { ...e, ...expense, id: updated.id } : e
        ))
        setEditingExpense(null)
        toast.success('Expense updated!')
      } else {
        const newExpense = await api.addExpense({
          title: expense.text,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          note: expense.notes || ''
        })
        // Keep all your frontend fields + the real id from the database
        setExpenses(prev => [{ ...expense, id: newExpense.id }, ...prev])
        toast.success(`${getCurrencySymbol(expense.currency)}${expense.amount} added to ${expense.category}`)
      }
    } catch (err) {
      toast.error('Failed to save expense')
      console.error(err)
    }
  }

  const deleteExpense = async (id) => {
    const expense = expenses.find(e => e.id === id)
    // Optimistic update — remove from UI immediately
    setExpenses(prev => prev.filter(e => e.id !== id))

    toast(
      (t) => (
        <span className="flex items-center gap-3">
          Deleted <strong>{expense.text}</strong>
          <button
            onClick={async () => {
              try {
                // Re-add to backend
                const restored = await api.addExpense({
                  title: expense.text,
                  amount: expense.amount,
                  category: expense.category,
                  date: expense.date,
                  note: expense.notes || ''
                })
                setExpenses(prev => [...prev, { ...expense, id: restored.id }])
                toast.dismiss(t.id)
              } catch {
                toast.error('Could not undo')
              }
            }}
            className="px-2 py-1 bg-white/20 rounded-lg text-sm font-bold hover:bg-white/30"
          >
            Undo
          </button>
        </span>
      ),
      { duration: 4000, icon: '🗑️' }
    )

    try {
      await api.deleteExpense(id)
    } catch (err) {
      // If backend delete fails, restore the expense
      setExpenses(prev => [...prev, expense])
      toast.error('Failed to delete expense')
    }
  }

  const handleDuplicate = async (expense) => {
    try {
      const newExpense = await api.addExpense({
        title: `${expense.text} (copy)`,
        amount: expense.amount,
        category: expense.category,
        date: new Date().toISOString().split('T')[0],
        note: expense.notes || ''
      })
      setExpenses(prev => [{ ...expense, id: newExpense.id, text: `${expense.text} (copy)`, date: newExpense.date }, ...prev])
      toast.success('Expense duplicated')
    } catch (err) {
      toast.error('Failed to duplicate expense')
    }
  }

  const handleBulkDelete = async () => {
    const count = selectedIds.length
    // Optimistic update
    setExpenses(prev => prev.filter(e => !selectedIds.includes(e.id)))
    setSelectedIds([])
    toast.success(`${count} expenses deleted`)

    try {
      await api.bulkDeleteExpenses(selectedIds)
    } catch (err) {
      toast.error('Bulk delete failed — please refresh')
      console.error(err)
    }
  }

  const handleSaveBudget = async (category, amount) => {
    try {
      // If you track months, use this; otherwise just pass a placeholder
      const month = new Date().toISOString().slice(0, 7) // e.g., "2026-02"
      await api.saveBudget({ category, amount, month })
      toast.success(`Budget for ${category} saved!`)
    } catch (err) {
      toast.error('Failed to save budget')
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setExpenses([])
    setBudgets({ Food: 500, Transport: 300, Shopping: 700, Bills: 800, Entertainment: 400, Health: 600, Other: 500 })
    setGoals([])
  }

  const commitAddGoal = async (goal) => {
    try {
      const saved = await api.addGoal({
        name: goal.name,
        target_amount: goal.target,
        saved_amount: goal.current || 0,
        deadline: goal.deadline || null
      })
      setGoals(prev => [...prev, { ...goal, id: saved.id }])
      toast.success(`Goal "${goal.name}" created! 🎯`)
      setShowGoalForm(false)
    } catch (err) {
      toast.error('Failed to save goal')
    }
  }

  const deleteGoal = async (id) => {
    try {
      await api.deleteGoal(id)
      setGoals(prev => prev.filter(g => g.id !== id))
      toast.success('Goal deleted')
    } catch (err) {
      toast.error('Failed to delete goal')
    }
  }

  const handleConfirm = async () => {
    const { type, payload } = confirmModal
    closeConfirm()
    if (type === 'deleteExpense') await deleteExpense(payload)
    if (type === 'logout') handleLogout()
    if (type === 'addGoal') await commitAddGoal(payload)
    if (type === 'deleteGoal') await deleteGoal(payload)
    if (type === 'bulkDelete') await handleBulkDelete()
    if (type === 'deleteAccount') {
      await api.deleteAccount()
      handleLogout()
    }
    if (type === 'changeCurrency') {
      const EXCHANGE_RATES = {
        INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095,
        JPY: 1.78, AUD: 0.018, CAD: 0.016, SGD: 0.016
      }
      const convert = (amt) => parseFloat((amt / EXCHANGE_RATES[currency] * EXCHANGE_RATES[payload]).toFixed(2))
      setExpenses(prev => prev.map(e => ({ ...e, amount: convert(e.amount) })))
      if (income !== null) setIncome(convert(income))
      setCurrency(payload)
      toast.success(`Currency changed to ${payload}`)
    }
  }


  const editExpense = (expense) => setEditingExpense(expense);

  const clearAll = () => {
    setExpenses([]);
    setEditingExpense(null);
  };

  const exportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast("No expenses to export", { icon: "📭" });
      return;
    }

    const headers = ["Date", "Description", "Merchant", "Category", "Amount", "Currency", "Payment Method", "Notes", "Tags", "Recurring"];
    const rows = filteredExpenses.map(e => [
      e.date || "",
      e.text || "",
      e.merchant || "",
      e.category || "",
      e.amount?.toFixed(2) || "",
      e.currency || "USD",
      e.paymentMethod || "",
      e.notes?.replace(/,/g, ";") || "",
      (e.tags || []).join(" "),
      e.isRecurring ? e.recurringType : "No",
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const monthLabel = viewMode === "month"
      ? currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      : selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    a.download = `expenses-${monthLabel.replace(/ /g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? "s" : ""}`);
  };

  {/*// Filter expenses for current month
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
  };*/}

  // Not logged in → show auth page
  if (!user) {
    return <AuthPage onAuth={(userData) => setUser(userData)} />
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "14px 18px",
          },
          success: {
            iconTheme: { primary: "#818cf8", secondary: "#1f2937" },
          },
        }}
      />
      
      <div className="max-w-6xl mx-auto mb-8">
        {/* Header with Month/Date Navigation */}
        <div className="flex items-center justify-between mb-6">

          {/* Left: App Icon + Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-100">Expense Tracker</h1>
          </div>

          <div className="flex items-center space-x-6">
            {/* Center: Date Picker */}
            <div className="relative flex items-center gap-4 
              h-16 px-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">

              {/* Calendar Icon */}
              <button
                onClick={() => setShowDatePicker(prev => !prev)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Display Selected Date */}
              <div className="text-xl font-bold text-gray-100">
                {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              {/* Animated Date Picker */}
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/30 shadow-lg z-50"
                    ref={pickerRef}
                  >
                    <input
                      type="date"
                      value={selectedDate.toLocaleDateString("en-CA")}
                      onChange={(e) => {
                        setSelectedDate(new Date(e.target.value));
                        //setShowDatePicker(false); // close picker on selection
                      }}
                      className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold w-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Add Expense Button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-4
                h-16 px-8 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 
                text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Expense</span>
            </button>

            {/* Profile Icon Button */}
            <button
              onClick={() => setShowProfile(true)}
              className="h-14 w-14 flex items-center justify-center 
                        bg-white/5 hover:bg-white/10 
                        border border-white/10 
                        rounded-2xl 
                        text-gray-400 hover:text-gray-100 
                        transition-all duration-200"
              title="Profile Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Logout Icon Button */}
            <button
              onClick={() => openConfirm('logout')}
              className="h-14 w-14 flex items-center justify-center 
                        bg-white/5 hover:bg-red-500/20 
                        border border-white/10 hover:border-red-500/40 
                        text-gray-400 hover:text-red-400 
                        rounded-2xl 
                        transition-all duration-200"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

          </div>

        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">

          {/* Income Card*/}
          <div className="lg:col-span-1 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">Income</p>
              {income !== null && !editingIncome && (
                <button
                  onClick={() => { setEditingIncome(true); setIncomeInput(income) }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-all"
                >
                  Edit
                </button>
              )}
            </div>
            {income === null || editingIncome ? (
              <div className="mt-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    placeholder="Enter income"
                    autoFocus
                    className="flex-1 bg-transparent border-b border-indigo-400 text-gray-100 text-2xl font-bold focus:outline-none placeholder-gray-600 w-full"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (incomeInput) {
                        setIncome(Number(incomeInput))
                        setEditingIncome(false)
                        toast.success('Income updated!')
                      }
                    }}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Save
                  </button>
                  {income !== null && (
                    <button
                      onClick={() => setEditingIncome(false)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-400 text-xs font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-4xl font-black text-gray-100 mt-2">
                {getCurrencySymbol(currency)}{income.toLocaleString()}
              </p>
            )}
          </div>

          {/* Expense Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-700/20 to-gray-800/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">Expenses</p>
            <p className="text-4xl font-black text-gray-100 mt-2">
              {income === null ? '—' : `${getCurrencySymbol(currency)}${totalExpenses.toLocaleString()}`}
            </p>
          </div>

          {/* Balance Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-600/20 to-gray-700/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">Balance</p>
            <p className={`text-4xl font-black mt-2 ${balance >= 0 ? 'text-gray-100' : 'text-gray-300'}`}>
              {income === null ? '—' : `${getCurrencySymbol(currency)}${Math.abs(balance).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Spending Velocity Warning */}
        {isCurrentMonth && monthBudget > 0 && totalExpenses > 0 && (
          <div className={`rounded-3xl p-6 mb-8 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            velocityDiff > 0.2
              ? "bg-red-500/10 border-red-500/30"
              : velocityDiff > 0.05
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-green-500/10 border-green-500/30"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`text-3xl ${
                velocityDiff > 0.2 ? "animate-bounce" : ""
              }`}>
                {velocityDiff > 0.2 ? "🔴" : velocityDiff > 0.05 ? "🟡" : "🟢"}
              </div>
              <div>
                <p className={`font-bold text-lg ${
                  velocityDiff > 0.2 ? "text-red-400" : velocityDiff > 0.05 ? "text-yellow-400" : "text-green-400"
                }`}>
                  {velocityDiff > 0.2
                    ? "Overspending ahead"
                    : velocityDiff > 0.05
                    ? "Slightly over pace"
                    : "On track"}
                </p>
                <p className="text-gray-400 text-sm">
                  {Math.round(pctMonthPassed * 100)}% of month passed · {Math.round(pctBudgetUsed * 100)}% of budget used · ${dailyAvg.toFixed(0)}/day avg
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="text-gray-300 text-sm font-semibold">
                Projected month total: <span className={`font-black ${projectedTotal > monthBudget ? "text-red-400" : "text-green-400"}`}>{getCurrencySymbol(currency)}{projectedTotal.toFixed(0)}</span>
              </p>
              <p className="text-gray-500 text-xs">
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left · {getCurrencySymbol(currency)}{(monthBudget - totalExpenses).toFixed(0)} remaining budget
              </p>
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">
            Spending Breakdown
            <span className="ml-auto px-3 py-1 bg-white/20 text-gray-100 text-xs rounded-full float-right">
              {getCurrencySymbol(currency)}{totalExpenses.toFixed(0)} total
            </span>
          </h2>
          {expenses.length > 0 ? (
            <div className="flex items-center justify-center space-x-12">
              <div className="flex-1 max-w-md">
                <ExpenseChart expenses={filteredExpenses} onCategoryClick={(category) => setFilterCategory(category)} />
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
                      <span className="font-mono block">{getCurrencySymbol(currency)}{cat.value.toFixed(0)}</span>
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
              <div className="text-6xl mb-4"><ChartPie className="w-12 h-12" /></div>
              <p className="text-xl">Add expenses to see breakdown</p>
            </div>
          )}
        </div>

        {/* Monthly Comparison Chart */}
        <MonthlyChart expenses={expenses} />

        <SpendingHeatmap expenses={expenses} currency={currency} />

        {/* Budget Panel */}
        <BudgetPanel
          budgets={effectiveBudgets}   //* changed from budgets 
          setBudgets={setBudgets}
          expenses={expenses}
          currency={currency}
          rolloverEnabled={rolloverEnabled}
          setRolloverEnabled={setRolloverEnabled}
          onSave={handleSaveBudget}
        />

        <BiggestExpense expenses={filteredExpenses} currency={currency} />

        {/* GOAL TRACKING */}
        <div className="lg:col-span-1 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Goals
          </h2>
          
          {/* FIXED: "No goals yet" state */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-100 mb-2">No goals yet</p>
              <p className="text-gray-400">Set savings targets and watch them grow!</p>
            </div>
          ) : (
            goals.map((goal, index) => (
              <div key={goal.id} className={`mb-6 last:mb-0 ${goal.completed ? 'opacity-75' : ''}`}>
                {/* Progress Ring */}
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" style={{animationDelay: `${index * 0.1}s`}}>
                    <circle className="w-20 h-20 r-28 fill-none stroke-white/20 stroke-4" cx="40" cy="40" />
                    <circle 
                      className={`w-20 h-20 r-28 fill-none stroke-indigo-400 stroke-4 transition-all duration-1000 ${
                        goal.current >= goal.target ? 'stroke-emerald-400' : ''
                      }`}
                      cx="40" cy="40"
                      strokeDasharray="176"
                      strokeDashoffset={176 * (1 - Math.min(1, goal.current / goal.target))}
                    />
                  </svg>
                  <div className="absolute inset-0 w-20 h-20 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-gray-100">
                      {Math.min(100, Math.round((goal.current / goal.target) * 100))}%
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-100 mb-1 text-center">{goal.name}</h3>
                <div className="text-sm space-y-1 mb-3 text-center">
                  <div className="flex justify-between text-gray-300">
                    <span>Target</span>
                    <span className="font-mono">
                      ₹{(goal?.target ?? 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Current</span>
                    <span
                      className={`font-mono font-bold ${
                        goal?.current >= goal?.target
                          ? "text-emerald-400"
                          : "text-gray-100"
                      }`}
                    >
                      ₹{(goal?.current ?? 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openConfirm('deleteGoal', goal.id)}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                >
                  Delete Goal
                </button>

              </div>
            ))
          )}
          
          <button
            onClick={() => setShowGoalForm(true)}
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-3 px-4 rounded-2xl font-bold transition-all duration-200"
          >
            + Add Goal
          </button>
        </div>



        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, merchant, notes..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >✕</button>
            )}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option className="bg-gray-900" value="All">All Categories</option>
            <option className="bg-gray-900" value="Food">🍔 Food</option>
            <option className="bg-gray-900" value="Transport">🚗 Transport</option>
            <option className="bg-gray-900" value="Shopping">🛒 Shopping</option>
            <option className="bg-gray-900" value="Bills">🧾 Bills</option>
            <option className="bg-gray-900" value="Entertainment">🎬 Entertainment</option>
            <option className="bg-gray-900" value="Health">🏥 Health</option>
            <option className="bg-gray-900" value="Other">📋 Other</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option className="bg-gray-900" value="All">All Payment Methods</option>
            <option className="bg-gray-900" value="Cash">Cash</option>
            <option className="bg-gray-900" value="Credit Card">Credit Card</option>
            <option className="bg-gray-900" value="Debit Card">Debit Card</option>
            <option className="bg-gray-900" value="Bank Transfer">Bank Transfer</option>
            <option className="bg-gray-900" value="UPI">UPI</option>
          </select>

          {(searchQuery || filterCategory !== "All" || filterPayment !== "All") && (
            <button
              onClick={() => { setSearchQuery(""); setFilterCategory("All"); setFilterPayment("All"); }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-gray-100 hover:bg-white/10 transition-all text-sm"
            >
              Clear all
            </button>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option className="bg-gray-900" value="date-desc">Date ↓ Newest</option>
            <option className="bg-gray-900" value="date-asc">Date ↑ Oldest</option>
            <option className="bg-gray-900" value="amount-desc">Amount ↓ Highest</option>
            <option className="bg-gray-900" value="amount-asc">Amount ↑ Lowest</option>
            <option className="bg-gray-900" value="name-asc">Name A → Z</option>
            <option className="bg-gray-900" value="name-desc">Name Z → A</option>
          </select>
          
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-300 hover:bg-indigo-500/30 transition-all text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Form & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/*<div className="lg:col-span-1 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center">
            {showForm ? (
              <AddExpenseForm 
                onAdd={addExpense} 
                editingExpense={editingExpense} 
                onClose={() => setShowForm(false)} 
                budgets={budgets}
                currency={currency}
                setCurrency={setCurrency}
              />
            ) : null}
          </div>*/}
          <div className="lg:col-span-3 bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <ExpenseList
              expenses={filteredExpenses}
              onDelete={(id) => openConfirm('deleteExpense', id)}
              onEdit={editExpense}
              onDuplicate={handleDuplicate}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onBulkDelete={() => openConfirm('bulkDelete', selectedIds)}
            />

          </div>
        </div>

        {/* ADD GOALFORM */}
        {showGoalForm && (
          <GoalForm
            onAdd={(goal) => {
              setShowGoalForm(false)
              openConfirm('addGoal', goal)
            }}
            onClose={() => setShowGoalForm(false)}
            currency={currency}
          />
        )}
      </div>

      {/* ShowForm Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm" 
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto text-gray-100">
            {/* Header with Cancel X */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-2xl font-bold text-gray-100">Add Expense</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-100"
                title="Cancel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <AddExpenseForm 
              onAdd={addExpense} 
              editingExpense={editingExpense} 
              onClose={() => setShowForm(false)} 
              budgets={budgets} 
              currency={currency} 
              setCurrency={setCurrency} 
            />
            
            {/* Footer Cancel Button */}
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-gray-200 hover:text-white font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          currency={currency}
          onCurrencyChange={(newCode) => {
            openConfirm('changeCurrency', newCode)
            setShowProfile(false)
          }}
          onClose={() => setShowProfile(false)}
          onUpdateUser={(updated) => {
            setUser(updated)
            localStorage.setItem('user', JSON.stringify(updated))
          }}
          onDeleteAccount={() => openConfirm('deleteAccount')}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.type === 'deleteExpense' ? 'Delete Expense?' :
          confirmModal.type === 'deleteGoal' ? 'Delete Goal?' :
          confirmModal.type === 'logout' ? 'Log Out?' :
          confirmModal.type === 'bulkDelete' ? `Delete ${selectedIds.length} Expenses?` :
          confirmModal.type === 'deleteAccount' ? 'Delete Account?' :
          confirmModal.type === 'changeCurrency' ? `Switch to ${confirmModal.payload}?` :
          'Add Goal?'
        }
        message={
          confirmModal.type === 'deleteExpense'
            ? 'This expense will be permanently removed. This action cannot be undone.'
            : confirmModal.type === 'deleteGoal'
            ? 'This goal will be permanently removed. This action cannot be undone.'
            : confirmModal.type === 'logout'
            ? 'Are you sure you want to log out? Any unsaved changes will be lost.'
            : confirmModal.type === 'bulkDelete'
            ? `You're about to permanently delete ${selectedIds.length} expense${selectedIds.length !== 1 ? 's' : ''}. This cannot be undone.`
            : `Are you sure you want to add "${confirmModal.payload?.name}" as a new goal?`
            ? 'This will permanently delete your account and all your data. This cannot be undone.'
            : confirmModal.type === 'deleteAccount'
            ? `All your values will be converted to ${confirmModal.payload}. This updates displayed amounts only.`
            : confirmModal.type === 'changeCurrency'
        }
        confirmText="Yes"
        isDanger={
          confirmModal.type === 'deleteExpense' ||
          confirmModal.type === 'deleteGoal' ||
          confirmModal.type === 'logout' ||
          confirmModal.type === 'bulkDelete' ||
          confirmModal.type === 'deleteAccount' 
        }
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />


    </div>
  );
}

export default App;