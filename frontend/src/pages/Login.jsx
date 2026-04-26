import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "", role: "farmer" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      showToast("Welcome back! 👋");
      navigate(user.role === "farmer" ? "/farmer" : "/buyer");
    } catch (error) {
      showToast(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-400 text-3xl shadow-glow mb-4">
            🌾
          </div>
          <h1 className="text-3xl font-bold text-surface-900">Welcome back</h1>
          <p className="mt-2 text-surface-500">Sign in to manage your crops and orders</p>
        </div>

        {/* Form Card */}
        <div className="card-shell">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div className="flex rounded-xl border border-surface-200 p-1">
              {["farmer", "buyer"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, role }))}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    form.role === role
                      ? "bg-brand text-white shadow-sm"
                      : "text-surface-500 hover:text-surface-700"
                  }`}
                >
                  {role === "farmer" ? "👨‍🌾 Farmer" : "🛒 Buyer"}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-surface-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-surface-700">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand hover:text-brand-700 transition-colors">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
