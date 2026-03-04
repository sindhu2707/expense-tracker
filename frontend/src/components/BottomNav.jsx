function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "expenses", label: "Expenses", icon: "📋" },
    { id: "budgets", label: "Budgets", icon: "🎯" },
    { id: "goals", label: "Goals", icon: "⭐" },
    { id: "charts", label: "Charts", icon: "📊" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-xl border-t border-white/10 flex md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 ${
            activeTab === tab.id
              ? "text-indigo-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
          {activeTab === tab.id && (
            <span className="absolute top-0 w-8 h-0.5 bg-indigo-400 rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;