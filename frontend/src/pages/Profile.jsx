import { useEffect, useState } from "react";
import api from "../api/axios";
import AnimatedCounter from "../components/AnimatedCounter";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Profile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({ orders: 0, listings: 0, reviews: 0, totalValue: 0 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        if (user.role === "farmer") {
          const [{ data: listings }, { data: orders }, { data: revs }] = await Promise.all([
            api.get("/listings/mine"),
            api.get("/orders/farmer"),
            api.get(`/reviews/farmer/${user._id}`).catch(() => ({ data: [] })),
          ]);
          setStats({
            listings: listings.length,
            orders: orders.length,
            reviews: revs.length,
            totalValue: orders.filter((o) => o.status !== "pending").reduce((s, o) => s + (o.totalPrice || 0), 0),
          });
          setReviews(revs);
        } else {
          const [{ data: orders }] = await Promise.all([
            api.get("/orders/buyer"),
          ]);
          setStats({
            listings: 0,
            orders: orders.length,
            reviews: 0,
            totalValue: orders.reduce((s, o) => s + (o.totalPrice || 0), 0),
          });
        }
      } catch (_e) {
        showToast("Unable to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="spinner h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-900 via-surface-800 to-brand-800 px-8 py-10 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-400 text-3xl font-bold text-white shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="mt-1 text-surface-300">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge bg-white/20 text-white backdrop-blur-sm">
                {user?.role === "farmer" ? "👨‍🌾 Farmer" : "🛒 Buyer"}
              </span>
              <span className="text-sm text-surface-400">
                📍 {user?.location?.district}, {user?.location?.state}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-4 stagger-children">
        {user?.role === "farmer" && (
          <div className="stat-card bg-brand-50">
            <div className="stat-icon bg-brand-100">📦</div>
            <div>
              <p className="text-xs font-medium text-surface-500">Listings</p>
              <p className="text-2xl font-bold text-surface-900">
                <AnimatedCounter target={stats.listings} />
              </p>
            </div>
          </div>
        )}
        <div className="stat-card bg-blue-50">
          <div className="stat-icon bg-blue-100">📋</div>
          <div>
            <p className="text-xs font-medium text-surface-500">Orders</p>
            <p className="text-2xl font-bold text-surface-900">
              <AnimatedCounter target={stats.orders} />
            </p>
          </div>
        </div>
        <div className="stat-card bg-purple-50">
          <div className="stat-icon bg-purple-100">💰</div>
          <div>
            <p className="text-xs font-medium text-surface-500">{user?.role === "farmer" ? "Revenue" : "Spent"}</p>
            <p className="text-2xl font-bold text-surface-900">
              <AnimatedCounter target={stats.totalValue} prefix="₹" />
            </p>
          </div>
        </div>
        {user?.role === "farmer" && (
          <div className="stat-card bg-amber-50">
            <div className="stat-icon bg-amber-100">⭐</div>
            <div>
              <p className="text-xs font-medium text-surface-500">Reviews</p>
              <p className="text-2xl font-bold text-surface-900">
                <AnimatedCounter target={stats.reviews} />
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Profile Details */}
      <section className="card-shell">
        <h3 className="section-title text-lg mb-4">👤 Profile Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Full Name", value: user?.name, icon: "👤" },
            { label: "Email", value: user?.email, icon: "📧" },
            { label: "Phone", value: user?.phone, icon: "📱" },
            { label: "Role", value: user?.role === "farmer" ? "Farmer" : "Buyer", icon: user?.role === "farmer" ? "👨‍🌾" : "🛒" },
            { label: "District", value: user?.location?.district, icon: "🏘️" },
            { label: "State", value: user?.location?.state, icon: "🗺️" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl bg-surface-50 p-4">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-xs font-medium text-surface-400">{item.label}</p>
                <p className="font-semibold text-surface-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Received (Farmer Only) */}
      {user?.role === "farmer" && reviews.length > 0 && (
        <section className="card-shell">
          <h3 className="section-title text-lg mb-4">⭐ Reviews Received ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-surface-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100 text-sm font-bold text-surface-600">
                      {r.buyerId?.name?.charAt(0) || "?"}
                    </div>
                    <p className="text-sm font-semibold text-surface-800">{r.buyerId?.name}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= r.rating ? "text-amber-400" : "text-surface-300"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-surface-500">{r.listingId?.cropName}</p>
                {r.comment && <p className="mt-2 text-sm text-surface-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
