import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-gray-100 font-black text-lg">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function MonthlyChart({ expenses }) {
  const now = new Date();

  const data = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();

    const total = expenses
      .filter((e) => {
        const d = new Date(e.date || Date.now());
        return d.getFullYear() === year && d.getMonth() === date.getMonth();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return { month, total };
  });

  const hasData = data.some((d) => d.total > 0);

  return (
    <div className="bg-white/3 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        Last 6 Months
        <span className="ml-auto px-3 py-1 bg-white/20 text-gray-100 text-xs rounded-full float-right">
          Avg ₹{hasData ? Math.round(data.reduce((s, d) => s + d.total, 0) / data.filter(d => d.total > 0).length).toLocaleString() : 0}/mo
        </span>
      </h2>

      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barSize={36}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar
              dataKey="total"
              radius={[8, 8, 0, 0]}
              fill="url(#barGradient)"
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[260px] flex flex-col items-center justify-center text-gray-500">
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Add expenses across months to see trends</p>
        </div>
      )}
    </div>
  );
}

export default MonthlyChart;