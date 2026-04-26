import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer",
    phone: "",
    district: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      showToast("Account created! Welcome to AgriLink 🎉");
      navigate(user.role === "farmer" ? "/farmer" : "/buyer");
    } catch (error) {
      showToast(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = step === 1 ? form.name && form.email && form.password : form.phone && form.district && form.state;

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8 animate-fade-in">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-400 text-3xl shadow-glow mb-4">
            🌱
          </div>
          <h1 className="text-3xl font-bold text-surface-900">Join AgriLink AI</h1>
          <p className="mt-2 text-surface-500">Start trading crops with AI-powered insights</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                step >= s ? "bg-brand text-white shadow-sm" : "bg-surface-200 text-surface-500"
              }`}>
                {s}
              </div>
              <span className={`text-sm font-medium ${step >= s ? "text-surface-700" : "text-surface-400"}`}>
                {s === 1 ? "Account" : "Location"}
              </span>
              {s < 2 && <div className={`h-0.5 w-8 rounded transition-colors duration-300 ${step > 1 ? "bg-brand" : "bg-surface-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card-shell">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
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
                  <label className="mb-2 block text-sm font-semibold text-surface-700">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="input-field" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-surface-700">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="input-field" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-surface-700">Password</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" className="input-field" />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceed}
                  className="btn-primary w-full"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-surface-700">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" className="input-field" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-surface-700">District</label>
                    <input name="district" value={form.district} onChange={handleChange} required placeholder="Nashik" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-surface-700">State</label>
                    <input name="state" value={form.state} onChange={handleChange} required placeholder="Maharashtra" className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading || !canProceed} className="btn-primary flex-1">
                    {loading ? <span className="spinner" /> : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-700 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
