import { useState } from "react";
import { loginUser } from "../../services/authService";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdEmail,
  MdLock,
  MdArrowForward,
  MdAccountBalanceWallet,
} from "react-icons/md";

// ── Floating orb background ────────────────────────────────────────────────────
function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large violet orb top-left */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
        }}
      />
      {/* Indigo orb bottom-right */}
      <div
        className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
        }}
      />
      {/* Pink accent top-right */}
      <div
        className="absolute top-1/4 right-0 w-[200px] h-[200px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// ── Animated stat pill ─────────────────────────────────────────────────────────
function StatPill({ emoji, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-400 backdrop-blur-sm"
    >
      <span>{emoji}</span>
      <span>{text}</span>
    </motion.div>
  );
}

// ── Input field with icon ──────────────────────────────────────────────────────
function InputField({
  icon: Icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  delay,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-center gap-3 bg-slate-800/60 border rounded-xl px-4 py-3.5 transition-all duration-200 ${
        focused
          ? "border-violet-500/70 ring-2 ring-violet-500/15 bg-slate-800/80"
          : "border-white/8 hover:border-white/15"
      }`}
    >
      <Icon
        className={`text-lg flex-shrink-0 transition-colors duration-200 ${focused ? "text-violet-400" : "text-slate-500"}`}
      />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        autoComplete={type === "email" ? "email" : "current-password"}
        className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
      />
    </motion.div>
  );
}

// ── Main Login component ───────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(data.message);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 overflow-hidden">
        <Orbs />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <MdAccountBalanceWallet className="text-white text-xl" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none block">
              Smart
            </span>
            <span className="text-violet-400 font-bold text-lg leading-none block">
              Finance
            </span>
          </div>
        </motion.div>

        {/* Hero text */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Your financial OS
            </p>
            <h2 className="text-5xl font-bold text-white leading-[1.15] mb-6">
              Money clarity,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-400">
                finally.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Track every rupee. Understand your patterns. Make smarter
              decisions — all in one place.
            </p>
          </motion.div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            <StatPill emoji="📊" text="Real-time analytics" delay={0.35} />
            <StatPill emoji="🔒" text="Bank-grade security" delay={0.42} />
            <StatPill emoji="⚡" text="Instant sync" delay={0.49} />
          </div>
        </div>

        {/* Floating card decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10 bg-slate-800/50 backdrop-blur border border-white/8 rounded-2xl p-5 max-w-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-medium">
              Monthly savings
            </span>
            <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              +12.4%
            </span>
          </div>
          <p className="text-white text-2xl font-bold mb-4">₹24,830</p>
          <div className="flex gap-1">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-violet-600 to-indigo-400"
                style={{ height: `${h * 0.5}px`, opacity: 0.7 + i * 0.04 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Mobile background orbs */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-[350px] h-[350px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[280px] h-[280px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center gap-3 justify-center mb-10"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <MdAccountBalanceWallet className="text-white text-lg" />
            </div>
            <div>
              <span className="text-white font-bold leading-none block">
                Smart
              </span>
              <span className="text-violet-400 font-bold leading-none block">
                Finance
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm">
              Sign in to your Smart Finance account
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                icon={MdEmail}
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                delay={0.18}
              />
              <InputField
                icon={MdLock}
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                delay={0.24}
              />

              {/* Forgot password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end"
              >
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <MdArrowForward className="text-lg" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Sign up link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-center text-slate-500 text-sm mt-6"
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
            >
              Create one free
            </Link>
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            {["🔒 SSL Secured", "⚡ Instant access", "🇮🇳 Made in India"].map(
              (badge) => (
                <span key={badge} className="text-slate-600 text-xs">
                  {badge}
                </span>
              ),
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
