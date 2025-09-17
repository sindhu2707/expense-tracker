import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

function ExpenseChart({ expenses }) {
  const data = expenses.reduce((acc, e) => {
    const found = acc.find((item) => item.name === e.category);
    if (found) found.value += e.amount;
    else acc.push({ name: e.category, value: e.amount });
    return acc;
  }, []);

  return (
    <PieChart width={400} height={300}>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export default ExpenseChart;
