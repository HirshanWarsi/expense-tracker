import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import {
  MdDashboard,
  MdAnalytics,
  MdReceipt,
  MdLogout,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdTrendingDown,
  MdSwapHoriz,
  MdMenu,
  MdChevronRight,
} from "react-icons/md";
import {
  getAnalytics,
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
  getCategoryBreakdown,
  getMonthlyAnalytics,
} from "../../services/expenseService";
import AIInsights from "../../components/AIInsights";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Salary",
  "Other",
];
const TYPES = ["expense", "income"];

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#10b981",
  "#06b6d4",
];

const CATEGORY_ICONS = {
  Food: "🍜",
  Travel: "✈️",
  Shopping: "🛍️",
  Bills: "📄",
  Health: "💊",
  Entertainment: "🎬",
  Salary: "💰",
  Other: "📦",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: MdDashboard },
  { id: "analytics", label: "Analytics", icon: MdAnalytics },
  { id: "transactions", label: "Transactions", icon: MdReceipt },
];

const EMPTY_FORM = { title: "", amount: "", category: "Food", type: "expense" };

// ─── Utility ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function StatCard({ icon: Icon, label, value, gradient, index, change }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.025, y: -4 }}
      className="relative overflow-hidden rounded-2xl p-6 shadow-lg cursor-default"
      style={{ background: gradient }}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="text-white text-xl" />
          </div>
          {change !== undefined && (
            <span className="text-xs font-semibold text-white/80 bg-white/15 px-2.5 py-1 rounded-full">
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
        <p className="text-white/70 text-sm font-medium tracking-wide mb-1">
          {label}
        </p>
        <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}

function SidebarItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      }`}
    >
      <Icon className="text-lg flex-shrink-0" />
      <span>{item.label}</span>
      {active && <MdChevronRight className="ml-auto text-white/60" />}
    </motion.button>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 backdrop-blur border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white text-sm font-semibold">{payload[0]?.name}</p>
      <p className="text-violet-400 font-bold">{fmt(payload[0]?.value)}</p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 backdrop-blur border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {p.dataKey === "income" ? "Income: " : "Expense: "}
          {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { name: "User" };
    } catch {
      return { name: "User" };
    }
  });

  // Data
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, expensesRes, categoryRes, monthlyRes] =
        await Promise.all([
          getAnalytics(),
          getExpenses(),
          getCategoryBreakdown(),
          getMonthlyAnalytics(),
        ]);
      setAnalytics(analyticsRes?.data || analyticsRes);
      const expensesRaw =
        expensesRes?.data?.expenses ??
        expensesRes?.data ??
        expensesRes?.expenses ??
        expensesRes;
      setExpenses(Array.isArray(expensesRaw) ? expensesRaw : []);
      const catRaw = categoryRes?.data || categoryRes || [];
      setCategoryData(
        catRaw.map((c) => ({
          name: c.category || c.name,
          value: c.total || c.value || 0,
        })),
      );
      const monthRaw = monthlyRes?.data || monthlyRes || [];
      setMonthlyData(
        monthRaw.map((m) => ({
          month: m.month,
          income: m.income || 0,
          expense: m.expense || 0,
        })),
      );
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Auth ───────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ── Add Expense ────────────────────────────────────────────────────────────

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    setSubmitting(true);
    setError("");
    try {
      await addExpense({ ...form, amount: parseFloat(form.amount) });
      setForm(EMPTY_FORM);
      await fetchAll();
    } catch (err) {
      setError("Failed to add expense.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const startEdit = (expense) => {
    setEditId(expense._id || expense.id);
    setEditForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      type: expense.type,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleUpdate = async (id) => {
    setSubmitting(true);
    setError("");
    try {
      await updateExpense(id, {
        ...editForm,
        amount: parseFloat(editForm.amount),
      });
      setEditId(null);
      setEditForm({});
      await fetchAll();
    } catch (err) {
      setError("Failed to update expense.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    setDeleteId(id);
    setError("");
    try {
      await deleteExpense(id);
      await fetchAll();
    } catch (err) {
      setError("Failed to delete expense.");
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  // ── Derived analytics ──────────────────────────────────────────────────────

  const stats = [
    {
      icon: MdAccountBalanceWallet,
      label: "Total Balance",
      value: fmt(analytics?.totalBalance ?? analytics?.balance),
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: MdTrendingUp,
      label: "Total Income",
      value: fmt(analytics?.totalIncome ?? analytics?.income),
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      change: analytics?.incomeChange,
    },
    {
      icon: MdTrendingDown,
      label: "Total Expense",
      value: fmt(analytics?.totalExpense ?? analytics?.expense),
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      change: analytics?.expenseChange,
    },
    {
      icon: MdSwapHoriz,
      label: "Transactions",
      value:
        analytics?.totalTransactions ??
        analytics?.transactions ??
        expenses.length,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  // ── Sidebar ────────────────────────────────────────────────────────────────

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-6"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
          <MdAccountBalanceWallet className="text-white text-lg" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Smart</p>
          <p className="text-violet-400 font-bold text-sm leading-none">
            Finance
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeNav === item.id}
            onClick={(id) => {
              setActiveNav(id);
              if (mobile) setSidebarOpen(false);
            }}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.name || "User"}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <MdLogout className="text-lg flex-shrink-0" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/80 backdrop-blur border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <MdMenu className="text-2xl" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>{" "}
                  👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Here's what's happening with your finances today.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-2xl px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-sm">Live</span>
            </div>
          </motion.div>

          {/* ── Error Banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm"
              >
                <span>{error}</span>
                <button onClick={() => setError("")}>
                  <MdClose />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading your dashboard…</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── Analytics Cards ── */}
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <StatCard key={stat.label} {...stat} index={i} />
                  ))}
                </div>
              </section>

              {/* ── Charts ── */}
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                    className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-white font-semibold text-base">
                          Category Breakdown
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Spending by category
                        </p>
                      </div>
                      <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full">
                        This month
                      </span>
                    </div>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                              <span style={{ color: "#94a3b8", fontSize: 12 }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-60 flex items-center justify-center text-slate-600 text-sm">
                        No category data yet
                      </div>
                    )}
                  </motion.div>

                  {/* Line Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                    className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-white font-semibold text-base">
                          Monthly Overview
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Income vs expenses trend
                        </p>
                      </div>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                        6 months
                      </span>
                    </div>
                    {monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart
                          data={monthlyData}
                          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.04)"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#64748b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#64748b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<LineTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#f43f5e"
                            strokeWidth={2.5}
                            dot={{ fill: "#f43f5e", r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-60 flex items-center justify-center text-slate-600 text-sm">
                        No monthly data yet
                      </div>
                    )}
                  </motion.div>
                </div>
              </section>

              {/* ── AI Insights ── */}
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <AIInsights />
              </motion.section>

              {/* ── Add Expense ── */}
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56, duration: 0.5 }}
              >
                <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/20">
                      <MdAdd className="text-violet-400 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        Add Transaction
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Record a new income or expense
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAdd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="lg:col-span-1">
                        <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                          Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Grocery run"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          required
                          className="w-full bg-slate-800/60 border border-white/8 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={form.amount}
                          onChange={(e) =>
                            setForm({ ...form, amount: e.target.value })
                          }
                          required
                          min="0"
                          step="0.01"
                          className="w-full bg-slate-800/60 border border-white/8 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                          Category
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value })
                          }
                          className="w-full bg-slate-800/60 border border-white/8 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all appearance-none cursor-pointer"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {CATEGORY_ICONS[c]} {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                          Type
                        </label>
                        <div className="flex gap-2">
                          {TYPES.map((t) => (
                            <button
                              type="button"
                              key={t}
                              onClick={() => setForm({ ...form, type: t })}
                              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                                form.type === t
                                  ? t === "income"
                                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                                    : "bg-red-500/20 border border-red-500/40 text-red-400"
                                  : "bg-slate-800/60 border border-white/8 text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <MdAdd className="text-lg" />
                      )}
                      {submitting ? "Adding…" : "Add Transaction"}
                    </motion.button>
                  </form>
                </div>
              </motion.section>

              {/* ── Transaction History ── */}
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
                        <MdReceipt className="text-indigo-400 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Transaction History
                        </h3>
                        <p className="text-slate-500 text-xs">
                          {expenses.length} transaction
                          {expenses.length !== 1 ? "s" : ""} total
                        </p>
                      </div>
                    </div>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                      <MdReceipt className="text-5xl mb-3 opacity-30" />
                      <p className="text-sm">
                        No transactions yet. Add one above!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/5">
                            {[
                              "Title",
                              "Category",
                              "Type",
                              "Amount",
                              "Actions",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-4"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence initial={false}>
                            {expenses.map((exp, i) => {
                              const id = exp._id || exp.id;
                              const isEditing = editId === id;
                              const isDeleting = deleteId === id;

                              return (
                                <motion.tr
                                  key={id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{
                                    delay: i * 0.03,
                                    duration: 0.25,
                                  }}
                                  className="border-b border-white/4 hover:bg-white/2 transition-colors group"
                                >
                                  {isEditing ? (
                                    <>
                                      <td className="px-6 py-3">
                                        <input
                                          value={editForm.title}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              title: e.target.value,
                                            })
                                          }
                                          className="w-full bg-slate-800 border border-violet-500/40 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                                        />
                                      </td>
                                      <td className="px-6 py-3">
                                        <select
                                          value={editForm.category}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              category: e.target.value,
                                            })
                                          }
                                          className="w-full bg-slate-800 border border-violet-500/40 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                                        >
                                          {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                              {c}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="px-6 py-3">
                                        <select
                                          value={editForm.type}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              type: e.target.value,
                                            })
                                          }
                                          className="w-full bg-slate-800 border border-violet-500/40 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                                        >
                                          {TYPES.map((t) => (
                                            <option key={t} value={t}>
                                              {t}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="px-6 py-3">
                                        <input
                                          type="number"
                                          value={editForm.amount}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              amount: e.target.value,
                                            })
                                          }
                                          className="w-28 bg-slate-800 border border-violet-500/40 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                                        />
                                      </td>
                                      <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                          <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate(id)}
                                            disabled={submitting}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                                          >
                                            <MdSave className="text-sm" /> Save
                                          </motion.button>
                                          <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={cancelEdit}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 border border-white/10 text-slate-400 rounded-lg text-xs font-medium hover:text-slate-200 transition-colors"
                                          >
                                            <MdClose className="text-sm" />{" "}
                                            Cancel
                                          </motion.button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg">
                                            {CATEGORY_ICONS[exp.category] ||
                                              "📦"}
                                          </span>
                                          <span className="text-white text-sm font-medium">
                                            {exp.title}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="text-xs bg-slate-800 border border-white/8 text-slate-400 px-2.5 py-1 rounded-full">
                                          {exp.category}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span
                                          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                                            exp.type === "income"
                                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                              : "bg-red-500/15 text-red-400 border border-red-500/20"
                                          }`}
                                        >
                                          {exp.type}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span
                                          className={`text-sm font-bold ${exp.type === "income" ? "text-emerald-400" : "text-red-400"}`}
                                        >
                                          {exp.type === "income" ? "+" : "-"}
                                          {fmt(exp.amount)}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => startEdit(exp)}
                                            className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                                            title="Edit"
                                          >
                                            <MdEdit className="text-sm" />
                                          </motion.button>
                                          <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(id)}
                                            disabled={isDeleting}
                                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                            title="Delete"
                                          >
                                            {isDeleting ? (
                                              <span className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                                            ) : (
                                              <MdDelete className="text-sm" />
                                            )}
                                          </motion.button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-slate-700 text-xs">
              Smart Finance © {new Date().getFullYear()} · All data is
              end-to-end encrypted
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
