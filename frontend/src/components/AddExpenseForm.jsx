import { useState } from "react";
import { createWorker } from "tesseract.js";
import { getCurrencySymbol, CURRENCIES } from "../utils/currency";

const commonMerchants = [
  "Amazon",
  "Walmart",
  "Uber",
  "Starbucks",
  "Netflix",
];

function AddExpenseForm({ onAdd, editingExpense, onClose, budgets, currency, setCurrency }) {
  const [text, setText] = useState(editingExpense?.text || "");
  const [amount, setAmount] = useState(editingExpense?.amount || "");
  const [category, setCategory] = useState(editingExpense?.category || "Other");
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(editingExpense?.paymentMethod || "Cash");
  const [notes, setNotes] = useState(editingExpense?.notes || "");
  const [error, setError] = useState("");
  const [tags, setTags] = useState(editingExpense?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [merchant, setMerchant] = useState(editingExpense?.merchant || "");
  const [receipt, setReceipt] = useState(null);
  const [isRecurring, setIsRecurring] = useState(editingExpense?.isRecurring || false);
  const [recurringType, setRecurringType] = useState("Monthly");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [reminderDays, setReminderDays] = useState(1);
  const [isSplit, setIsSplit] = useState(false);
  const [splitType, setSplitType] = useState("equal");
  const [participants, setParticipants] = useState([
    { name: "You", share: 0, paid: true },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");

  const selectedBudget = budgets[category] || 0;
  const remainingBudget = selectedBudget - (amount || 0);
  const isOverspending = remainingBudget < 0;

  // Smart Merchant → Category Suggestions (AI-ready structure)
  const merchantCategoryMap = {
    swiggy: "Food",
    zomato: "Food",
    uber: "Transport",
    ola: "Transport",
    amazon: "Shopping",
    flipkart: "Shopping",
    netflix: "Entertainment",
    spotify: "Entertainment",
    pharmacy: "Health",
    hospital: "Health",
  };







  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !date) {
      setError("Please fill all required fields");
      return;
    }

    if (+amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setError("");

    onAdd({
      text,
      amount: +amount,
      currency,
      category,
      paymentMethod,
      notes,
      tags,
      date,
      merchant,
      receipt,
      isRecurring,
      recurringType,
      recurringEndDate,
      reminderDays,
      isSplit,
      splitType,
      participants,
    });

    if (onClose) onClose();

    setText("");
    setAmount("");
    setCurrency("USD");
    setCategory("Other");
    setPaymentMethod("Cash");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);

  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMerchantChange = (value) => {
    // Smart category auto-detection
    setMerchant(value);
    const lowerValue = value.toLowerCase();
    for (const key in merchantCategoryMap) {
      if (lowerValue.includes(key)) {
        setCategory(merchantCategoryMap[key]);
        break;
      }
    }
  };

  const handleOCR = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setIsScanning(true);
    setScanResult("");

    try {
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setScanResult(text);

      // Extract amount — looks for patterns like $12.99, 12.99, Rs 500
      const amountMatch = text.match(/(?:total|amount|sum|rs\.?|inr|usd|\$|€|₹)[\s:]*([0-9]+(?:[.,][0-9]{1,2})?)/i)
        || text.match(/([0-9]+\.[0-9]{2})/);
      if (amountMatch) setAmount(amountMatch[1].replace(",", "."));

      // Extract date — looks for DD/MM/YYYY, MM-DD-YYYY, Month DD YYYY
      const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (dateMatch) {
        const parts = dateMatch[1].split(/[\/\-]/);
        if (parts[2]?.length === 2) parts[2] = "20" + parts[2];
        const parsed = new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
        if (!isNaN(parsed)) setDate(parsed.toISOString().split("T")[0]);
      }

      // Extract merchant — use first non-empty line as merchant name
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines[0] && !merchant) setMerchant(lines[0]);

      // Auto-detect category from scanned text
      const lowerText = text.toLowerCase();
      for (const key in merchantCategoryMap) {
        if (lowerText.includes(key)) {
          setCategory(merchantCategoryMap[key]);
          break;
        }
      }

    } catch (err) {
      setScanResult("Could not read receipt. Please fill in manually.");
    } finally {
      setIsScanning(false);
    }
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

        {/* Merchant */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Merchant
          </label>
          <input
            list="merchant-suggestions"
            value={merchant}
            onChange={(e) => handleMerchantChange(e.target.value)}

            className="w-full p-4 bg-white/3 border border-white/20 rounded-2xl text-gray-100"
            placeholder="Enter merchant name..."
          />
          {merchant && Object.keys(merchantCategoryMap).some(k => merchant.toLowerCase().includes(k)) && (
            <p className="text-xs text-indigo-400 mt-1">
              💡 Suggested Category: {Object.entries(merchantCategoryMap).find(([k]) => merchant.toLowerCase().includes(k))?.[1]}
            </p>
          )}

          <datalist id="merchant-suggestions">
            {commonMerchants.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
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
            <option className="bg-gray-900 text-gray-100" value="Health">🏥 Health</option>
            <option className="bg-gray-900 text-gray-100" value="Bills">🧾 Bills</option>
            <option className="bg-gray-900 text-gray-100" value="Other">📋 Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>

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
            Amount
          </label>
          <div className="relative">
            
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-white/3 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-blue-400 text-gray-100 placeholder-gray-400 font-semibold text-lg transition-all duration-300 group-hover:border-white/50"
              placeholder="Enter Amount"
              step="0.01"
              min="0"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-3 w-full p-3 bg-white/5 border border-white/20 rounded-xl text-gray-100"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} className="bg-gray-900 text-gray-100" value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>

        {/* Split Expense */}
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSplit}
              onChange={() => setIsSplit(!isSplit)}
            />
            <label className="text-gray-300 font-semibold">
              Split Expense
            </label>
          </div>

          {isSplit && (
            <div className="space-y-3 bg-white/3 p-4 rounded-2xl border border-white/10">
              
              {/* Split Type */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Split Method
                </label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-gray-100"
                >
                  <option className="bg-gray-900 text-gray-100" value="equal">
                    Equal Share
                  </option>
                  <option className="bg-gray-900 text-gray-100" value="percentage">
                    Percentage
                  </option>
                  <option className="bg-gray-900 text-gray-100" value="custom">
                    Custom Amount
                  </option>
                </select>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Participants</label>

                {participants.map((p, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...participants];
                        updated[index].name = e.target.value;
                        setParticipants(updated);
                      }}
                      className="flex-1 p-2 bg-white/5 border border-white/20 rounded-lg text-gray-100"
                    />

                    <input
                      type="number"
                      placeholder={
                        splitType === "percentage"
                          ? "%"
                          : splitType === "custom"
                          ? "₹"
                          : "Auto"
                      }
                      value={p.share}
                      onChange={(e) => {
                        const updated = [...participants];
                        updated[index].share = e.target.value;
                        setParticipants(updated);
                      }}
                      disabled={splitType === "equal"}
                      className="w-24 p-2 bg-white/5 border border-white/20 rounded-lg text-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = participants.filter((_, i) => i !== index);
                        setParticipants(updated);
                      }}
                      className="px-3 bg-red-500/20 text-red-400 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setParticipants([
                      ...participants,
                      { name: "", share: 0, paid: false },
                    ])
                  }
                  className="w-full py-2 bg-indigo-500/20 text-indigo-300 rounded-xl"
                >
                  + Add Participant
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Payment Method */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-4 bg-white/3 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-gray-500/30 focus:border-gray-400 text-gray-100 font-semibold text-lg appearance-none bg-no-repeat bg-right transition-all duration-300 group-hover:border-white/50 cursor-pointer"
          >
            <option className="bg-gray-900 text-gray-100" value="Cash">Cash</option>
            <option className="bg-gray-900 text-gray-100" value="Credit Card">Credit Card</option>
            <option className="bg-gray-900 text-gray-100" value="Debit Card">Debit Card</option>
            <option className="bg-gray-900 text-gray-100" value="Bank Transfer">Bank Transfer</option>
            <option className="bg-gray-900 text-gray-100" value="UPI">UPI</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
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

        {/* Recurring */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
            />
            <label className="text-gray-300 font-semibold">
              Recurring Expense
            </label>
          </div>

          {isRecurring && (
            <div className="space-y-3 bg-white/3 p-4 rounded-2xl border border-white/10">
              
              {/* Frequency */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Frequency
                </label>
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-gray-100"
                >
                  <option className="bg-gray-900 text-gray-100" value="Daily">Daily</option>
                  <option className="bg-gray-900 text-gray-100" value="Weekly">Weekly</option>
                  <option className="bg-gray-900 text-gray-100" value="Monthly">Monthly</option>
                  <option className="bg-gray-900 text-gray-100" value="Yearly">Yearly</option>
                  <option className="bg-gray-900 text-gray-100" value="Custom">Custom</option>
                </select>
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-gray-100"
                />
              </div>

              {/* Reminder */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Reminder (Days before due)
                </label>
                <input
                  type="number"
                  min="0"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-gray-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Budget Impact Preview */}
        {category && (
          <div className="mt-2 p-3 rounded-xl border border-white/10 bg-white/3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Category Budget:</span>
              <span className="text-gray-200 font-semibold">
                {getCurrencySymbol(currency)}
              </span>
            </div>

            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">After this expense:</span>
              <span
                className={`font-semibold ${
                  isOverspending ? "text-red-400" : "text-green-400"
                }`}
              >
                {getCurrencySymbol(currency)}
              </span>
            </div>

            {isOverspending && (
              <p className="text-red-400 text-xs mt-2">
                ⚠️ Warning: This expense exceeds your category budget!
              </p>
            )}
          </div>
        )}


        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Upload Receipt
            <span className="ml-2 text-xs text-indigo-400 font-normal">— auto-fills fields</span>
          </label>

          <label className="flex flex-col items-center justify-center w-full p-6 bg-white/3 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-indigo-400/50 hover:bg-white/5 transition-all duration-200">
            {isScanning ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400">
                <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-semibold">Scanning receipt...</span>
              </div>
            ) : receipt ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-400 font-semibold">Receipt scanned</span>
                <span className="text-xs text-gray-500">Click to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold">Upload receipt image</span>
                <span className="text-xs text-gray-500">JPG, PNG — fields auto-fill via OCR</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setReceipt(reader.result);
                reader.readAsDataURL(file);
                handleOCR(file);
              }}
            />
          </label>

          {scanResult && !isScanning && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                View raw scan text
              </summary>
              <pre className="mt-2 text-xs text-gray-500 bg-white/3 p-3 rounded-xl overflow-auto max-h-32 whitespace-pre-wrap">
                {scanResult}
              </pre>
            </details>
          )}
        </div>


        {/* Notes */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="w-full p-4 bg-white/3 border border-white/20 rounded-2xl text-gray-100"
            placeholder="Additional details..."
          />
        </div>

        {/* Tags */}
        <div className="relative group">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Tags
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 p-1 bg-white/5 border border-white/20 rounded-xl text-gray-100"
              placeholder="Add tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 bg-gray-600 rounded-xl text-white"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-red-400"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Error Display*/}
        {error && (
          <p className="text-red-400 text-sm font-semibold text-center">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-700 to-gray-500 hover:from-gray-600 hover:to-gray-400 hover:via-gray-700 hover:to-gray-700 text-gray-100 py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 group/button"
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
