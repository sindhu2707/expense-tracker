import { useEffect, useState } from "react";
import { getCurrencySymbol } from "../utils/currency";

function SpendingHeatmap({ expenses, currency }) {
  // Generate last 12 weeks of days
  const weeks = [];
  const today = new Date();
  
  for (let week = 11; week >= 0; week--) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      days.push(date);
    }
    weeks.push(days);
  }

  // Calculate spending per day
  const spendingByDay = expenses.reduce((acc, e) => {
    const date = new Date(e.date || Date.now()).toDateString();
    acc[date] = (acc[date] || 0) + e.amount;
    return acc;
  }, {});

  // --- Date Helpers ---
const todayDate = new Date();
const startOfWeek = new Date(todayDate);
startOfWeek.setDate(todayDate.getDate() - todayDate.getDay());

const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

// --- Calculations ---
let weeklyTotal = 0;
let monthlyTotal = 0;
let highestDay = 0;
let totalAllDays = 0;

Object.entries(spendingByDay).forEach(([dateStr, amount]) => {
  const date = new Date(dateStr);

  totalAllDays += amount;

  if (date >= startOfWeek) {
    weeklyTotal += amount;
  }

  if (date >= startOfMonth) {
    monthlyTotal += amount;
  }

  if (amount > highestDay) {
    highestDay = amount;
  }
});

const avgDaily = totalAllDays / 84; // 12 weeks × 7 days

// --- Trend (This Week vs Last Week) ---
const startOfLastWeek = new Date(startOfWeek);
startOfLastWeek.setDate(startOfWeek.getDate() - 7);

let lastWeekTotal = 0;

Object.entries(spendingByDay).forEach(([dateStr, amount]) => {
  const date = new Date(dateStr);
  if (date >= startOfLastWeek && date < startOfWeek) {
    lastWeekTotal += amount;
  }
});

const trend =
  lastWeekTotal === 0
    ? 0
    : Math.round(((weeklyTotal - lastWeekTotal) / lastWeekTotal) * 100);


  const allAmounts = Object.values(spendingByDay);
  const maxSpending = Math.max(...allAmounts, 1);

  const getColor = (amount) => {
    if (amount === 0) return "bg-white/5";
    const intensity = amount / maxSpending;
    if (intensity > 0.75) return "bg-red-500";
    if (intensity > 0.5) return "bg-orange-500";
    if (intensity > 0.25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const useAnimatedNumber = (value, duration = 600) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = value / (duration / 16);
      const animate = () => {
        start += increment;
        if (start >= value) {
          setDisplay(value);
          return;
        }
        setDisplay(start);
        requestAnimationFrame(animate);
      };
      animate();
    }, [value, duration]);

    return display;
  };

const animatedWeek = useAnimatedNumber(weeklyTotal);
const animatedMonth = useAnimatedNumber(monthlyTotal);


  return (
    <div className="bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-3">
        Spending Activity
        <span
          className={`text-sm ${
            trend >= 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          {trend >= 0 ? "+" : ""}
          {trend}%
        </span>
      </h2>

      <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
        <div>
          <span className="text-gray-500">Week</span>{" "}
          <span className="text-gray-200 font-medium">
            {getCurrencySymbol(currency)}
            {weeklyTotal.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-gray-500">Month</span>{" "}
          <span className="text-gray-200 font-medium">
            {getCurrencySymbol(currency)}
            {monthlyTotal.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-gray-500">Avg</span>{" "}
          <span className="text-gray-200 font-medium">
            {getCurrencySymbol(currency)}
            {avgDaily.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-gray-500">High</span>{" "}
          <span className="text-gray-200 font-medium">
            {getCurrencySymbol(currency)}
            {highestDay.toFixed(2)}
          </span>
        </div>
      </div>

      
      <div className="flex gap-10">
        {/* LEFT: Calendar */}
        <div>
          {/* Day labels */}
          <div className="flex gap-1 mb-2 ml-8">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="w-6 text-[9px] text-gray-500 font-semibold">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((date, dayIdx) => {
                  const dateStr = date.toDateString();
                  const amount = spendingByDay[dateStr] || 0;
                  const isToday = dateStr === today.toDateString();

                  return (
                    <div
                      key={dayIdx}
                      className={`w-6 h-6 rounded-sm ${getColor(amount)} hover:ring-2 hover:ring-white/40 transition-all cursor-pointer relative group ${
                        isToday ? "ring-2 ring-indigo-400" : ""
                      }`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                        {date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        <br />
                        {getCurrencySymbol(currency)}
                        {amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Minimal Stats */}
        <div className="flex flex-col justify-center gap-6 min-w-[120px]">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              This Week
            </div>
            <div className="text-2xl font-semibold text-gray-100">
              {getCurrencySymbol(currency)}
              {animatedWeek.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              This Month
            </div>
            <div className="text-2xl font-semibold text-gray-100">
              {getCurrencySymbol(currency)}
              {animatedMonth.toFixed(2)}
            </div>
          </div>
        </div>
      </div>


      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-6 h-6 rounded-sm bg-white/5" />
        <div className="w-6 h-6 rounded-sm bg-green-500" />
        <div className="w-6 h-6 rounded-sm bg-yellow-500" />
        <div className="w-6 h-6 rounded-sm bg-orange-500" />
        <div className="w-6 h-6 rounded-sm bg-red-500" />
        <span>More</span>
      </div>
    </div>
  );
}

export default SpendingHeatmap;