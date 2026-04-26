import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";
import AnimatedCounter from "../components/AnimatedCounter";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [{ data: myOrders }, { data: marketListings }] = await Promise.all([
          api.get("/orders/buyer"),
          api.get("/listings?sort=newest"),
        ]);
        setOrders(myOrders);
        setListings(marketListings);
      } catch (error) {
        showToast(error.response?.data?.message || "Unable to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const metrics = useMemo(() => [
    { label: "Pending Orders", value: orders.filter((o) => o.status === "pending").length, icon: "⏳", bg: "bg-amber-50", iconBg: "bg-amber-100" },
    { label: "Confirmed", value: orders.filter((o) => o.status === "confirmed").length, icon: "✅", bg: "bg-blue-50", iconBg: "bg-blue-100" },
    { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, icon: "📦", bg: "bg-brand-50", iconBg: "bg-brand-100" },
    { label: "Total Spent", value: orders.reduce((s, o) => s + (o.totalPrice || 0), 0), icon: "💰", bg: "bg-purple-50", iconBg: "bg-purple-100", prefix: "₹" },
  ], [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="spinner h-10 w-10" />
          <p className="text-sm text-surface-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-dark px-8 py-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-surface-400 font-bold">🛒 Buyer Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Hello, {user?.name}</h1>
          <p className="mt-2 text-surface-300 max-w-2xl text-sm leading-relaxed">
            Track orders, manage spending, and discover fresh crop supply across states.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-4 stagger-children">
        {metrics.map((m) => (
          <div key={m.label} className={`stat-card ${m.bg}`}>
            <div className={`stat-icon ${m.iconBg}`}>{m.icon}</div>
            <div>
              <p className="text-xs font-medium text-surface-500">{m.label}</p>
              <p className="text-2xl font-bold text-surface-900">
                <AnimatedCounter target={m.value} prefix={m.prefix || ""} />
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Orders + Listings */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Recent Orders */}
        <div className="card-shell">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="section-title text-lg">📋 Recent Orders</h3>
              <p className="section-subtitle">Latest order activity.</p>
            </div>
            <Link to="/my-orders" className="btn-ghost !text-xs">View all →</Link>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && <p className="text-sm text-surface-400 py-4 text-center">No orders placed yet.</p>}
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="rounded-xl border border-surface-200 p-4 hover:border-surface-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-surface-900">{order.listingId?.cropName}</p>
                    <p className="mt-1 text-sm text-surface-500">
                      {order.farmerId?.name} • {order.quantity} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                    <span className={`badge mt-1 ${
                      order.status === "pending" ? "badge-warning" :
                      order.status === "confirmed" ? "badge-info" :
                      "badge-success"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fresh Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title text-lg">🌿 Fresh Picks</h3>
              <p className="section-subtitle">Recently added crops from active farmers.</p>
            </div>
            <Link to="/marketplace" className="btn-ghost !text-xs">Browse all →</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {listings.slice(0, 4).map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyerDashboard;
