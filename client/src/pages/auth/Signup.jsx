import { useState } from "react";
import { signupUser } from "../../services/authService";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdArrowForward,
  MdAccountBalanceWallet,
  MdCheckCircle,
} from "react-icons/md";

// ── Background orbs ────────────────────────────────────────────────────────────
function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-0 w-[200px] h-[200px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
        }}
      />
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

// ── Perk row shown on the left panel ──────────────────────────────────────────
function Perk({ text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="flex items-center gap-3"
    >
      <MdCheckCircle className="text-violet-400 text-lg flex-shrink-0" />
      <span className="text-slate-400 text-sm">{text}</span>
    </motion.div>
  );
}

// ── Focused input with icon ────────────────────────────────────────────────────
function InputField({
  icon: Icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  delay,
  autoComplete,
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
        autoComplete={autoComplete}
        className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
      />
    </motion.div>
  );
}

// ── Password strength meter ────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(password),
  ).length;
  const levels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  const level = levels[score - 1] || levels[0];
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-1.5"
    >
      <div className="flex gap-1">
        {levels.map((l, i) => (
          <div
            key={l.label}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? level.color : "bg-slate-700"}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Password strength:{" "}
        <span
          className={`font-medium ${score >= 3 ? "text-emerald-400" : score === 2 ? "text-amber-400" : "text-red-400"}`}
        >
          {level.label}
        </span>
      </p>
    </motion.div>
  );
}

// ── Main Signup component ──────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await signupUser(formData);
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
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
              Join 10,000+ users
            </p>
            <h2 className="text-5xl font-bold text-white leading-[1.15] mb-6">
              Start your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-400">
                financial journey.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Set up in under 60 seconds. No credit card required. Cancel
              anytime.
            </p>
          </motion.div>

          {/* Perks list */}
          <div className="flex flex-col gap-3 mt-10">
            <Perk text="Automated expense categorisation" delay={0.35} />
            <Perk text="Real-time income & spending analytics" delay={0.42} />
            <Perk text="Bank-level 256-bit AES encryption" delay={0.49} />
            <Perk text="Works across all your devices" delay={0.56} />
          </div>
        </div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="relative z-10 bg-slate-800/50 backdrop-blur border border-white/8 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            {["🧑‍💼", "👩‍🎓", "👨‍💻", "👩‍🍳"].map((e, i) => (
              <span
                key={i}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm border-2 border-slate-900 -ml-2 first:ml-0"
              >
                {e}
              </span>
            ))}
            <span className="text-slate-400 text-xs ml-1">+9,847 others</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            "Smart Finance helped me save ₹18,000 in my first month by showing
            where my money was actually going."
          </p>
          <p className="text-slate-500 text-xs mt-2">— Priya S., Bangalore</p>
        </motion.div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Mobile orbs */}
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Create account
            </h1>
            <p className="text-slate-500 text-sm">
              Get started with Smart Finance — it's free
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
                icon={MdPerson}
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                delay={0.18}
                autoComplete="name"
              />
              <InputField
                icon={MdEmail}
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                delay={0.24}
                autoComplete="email"
              />
              <InputField
                icon={MdLock}
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                delay={0.3}
                autoComplete="new-password"
              />

              {/* Password strength */}
              <PasswordStrength password={formData.password} />

              {/* Terms */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                className="text-xs text-slate-600 leading-relaxed"
              >
                By creating an account you agree to our{" "}
                <span className="text-slate-400 hover:text-violet-400 cursor-pointer transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-slate-400 hover:text-violet-400 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
                .
              </motion.p>

              {/* Submit */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create free account
                    <MdArrowForward className="text-lg" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Login link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-slate-500 text-sm mt-6"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.58 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            {["🔒 SSL Secured", "⚡ Free forever", "🇮🇳 Made in India"].map(
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

export default Signup;
