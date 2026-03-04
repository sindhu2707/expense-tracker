import { useState } from 'react';
import { getCurrencySymbol } from '../utils/currency';

export default function GoalForm({ onAdd, onClose, currency }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !target || parseFloat(target) <= 0) {
      return;
    }
    
    onAdd({
      id: Date.now(),
      name: name.trim(),
      target: parseFloat(target),
      current: 0, // Always starts at 0
      deadline: deadline || null,
      completed: false
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-100">New Goal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-match info */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-indigo-300 font-semibold text-sm">Auto-match settings</span>
            </div>
            <div className="flex gap-2 text-xs text-indigo-200">
              <span className="px-2 py-1 bg-indigo-500/20 rounded-full">Category Match</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">Tag Match</span>
            </div>
            <p className="text-xs text-indigo-300 mt-1">
              Expenses with matching category/tag names will automatically contribute
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vacation Fund, New Laptop..."
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-gray-100 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none transition-all duration-200"
              required
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Target Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">
                ₹
              </span>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="50000"
                className="w-full pl-12 p-4 bg-white/10 border border-white/20 rounded-2xl text-gray-100 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none transition-all duration-200"
                required
                min="1"
                step="0.01"
                max="999999"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Deadline (Optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-gray-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim() || !target || parseFloat(target) <= 0}
            >
              Create Goal
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-gray-100 rounded-2xl border border-white/20 hover:border-white/30 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
