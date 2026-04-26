import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import MoodChart from "../components/MoodChart";
import StressWidget from "../components/StressWidget";
import AnimatedCounter from "../components/AnimatedCounter";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const defaultForm = {
  cropName: "",
  category: "vegetable",
  quantity: "",
  price: "",
  harvestDate: "",
  description: "",
  district: "",
  state: "",
  images: [],
};

const deriveSeason = (dateString) => {
  const month = new Date(dateString).getMonth() + 1;
  if ([3, 4, 5, 6].includes(month)) return "Summer";
  if ([7, 8, 9, 10].includes(month)) return "Monsoon";
  return "Winter";
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listingForm, setListingForm] = useState(defaultForm);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [priceSuggestion, setPriceSuggestion] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [savingListing, setSavingListing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const loadDashboard = async () => {
    setLoadingPage(true);
    try {
      const [{ data: myListings }, { data: myOrders }, { data: moods }] = await Promise.all([
        api.get("/listings/mine"),
        api.get("/orders/farmer"),
        api.get("/mood/history"),
      ]);
      setListings(myListings);
      setOrders(myOrders);
      setMoodLogs(moods);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load dashboard", "error");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const metrics = useMemo(() => [
    { label: "Active Listings", value: listings.filter((l) => l.status === "active").length, icon: "📦", bg: "bg-brand-50", iconBg: "bg-brand-100" },
    { label: "Pending Orders", value: orders.filter((o) => o.status === "pending").length, icon: "⏳", bg: "bg-amber-50", iconBg: "bg-amber-100" },
    { label: "Confirmed Orders", value: orders.filter((o) => o.status === "confirmed").length, icon: "✅", bg: "bg-blue-50", iconBg: "bg-blue-100" },
    { label: "Total Revenue", value: orders.filter((o) => o.status !== "pending").reduce((s, o) => s + (o.totalPrice || 0), 0), icon: "💰", bg: "bg-purple-50", iconBg: "bg-purple-100", prefix: "₹" },
  ], [listings, orders]);

  const listedCrops = useMemo(
    () => Array.from(new Set(listings.map((l) => l.cropName).filter(Boolean))).slice(0, 12).sort(),
    [listings]
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setListingForm((c) => ({ ...c, images: Array.from(files).slice(0, 3) }));
      return;
    }
    setListingForm((c) => ({ ...c, [name]: value }));
  };

  const handleSuggestPrice = async () => {
    if (!listingForm.cropName || !listingForm.harvestDate || !listingForm.state) {
      showToast("Fill crop name, harvest date, and state first", "error");
      return;
    }
    setSuggesting(true);
    try {
      const { data } = await api.post("/ai/price-suggestion", {
        cropName: listingForm.cropName,
        season: deriveSeason(listingForm.harvestDate),
        location: `${listingForm.district}, ${listingForm.state}`,
        currentMonth: new Date().toLocaleString("en-IN", { month: "long" }),
      });
      setPriceSuggestion(data.suggestion);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to fetch price suggestion", "error");
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSavingListing(true);
    try {
      const formData = new FormData();
      Object.entries(listingForm).forEach(([key, val]) => {
        if (key === "images") val.forEach((f) => formData.append("images", f));
        else formData.append(key, val);
      });

      const { data } = await api.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setListings((c) => [data, ...c]);
      setListingForm({ ...defaultForm, district: user.location?.district || "", state: user.location?.state || "" });
      setPriceSuggestion("");
      showToast("Listing created successfully 🎉");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to create listing", "error");
    } finally {
      setSavingListing(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/confirm`);
      setOrders((c) => c.map((o) => (o._id === orderId ? data : o)));
      showToast("Order confirmed ✅");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to confirm order", "error");
    }
  };

  const handleDeliverOrder = async (orderId) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/deliver`);
      setOrders((c) => c.map((o) => (o._id === orderId ? data : o)));
      showToast("Order marked as delivered 📦");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to mark as delivered", "error");
    }
  };

  const handleMoodLogged = (moodData) => setMoodLogs((c) => [...c, moodData]);

  useEffect(() => {
    if (user) setListingForm((c) => ({ ...c, district: user.location?.district || "", state: user.location?.state || "" }));
  }, [user]);

  if (loadingPage) {
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 px-8 py-10 text-white shadow-glow">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200 font-bold">👨‍🌾 Farmer Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="mt-2 text-brand-100 max-w-2xl text-sm leading-relaxed">
            Create crop listings, track buyer orders, and use AI tools for price guidance and wellbeing.
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

      {/* Crop Badges */}
      {listedCrops.length > 0 && (
        <section className="card-shell">
          <h3 className="section-title text-lg mb-3">🌾 Your Crops</h3>
          <div className="flex flex-wrap gap-2">
            {listedCrops.map((crop) => (
              <span key={crop} className="badge-success">{crop}</span>
            ))}
          </div>
        </section>
      )}

      {/* Create Listing + Stress Widget */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleCreateListing} className="card-shell space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="section-title text-lg">📝 Create Listing</h3>
              <p className="section-subtitle">Add fresh inventory with AI price guidance.</p>
            </div>
            <button type="button" onClick={handleSuggestPrice} disabled={suggesting} className="btn-ghost !text-sm">
              {suggesting ? <span className="spinner" /> : "🤖 Suggest Price"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="cropName" value={listingForm.cropName} onChange={handleChange} placeholder="Crop name" required className="input-field" />
            <select name="category" value={listingForm.category} onChange={handleChange} className="select-field">
              <option value="vegetable">🥬 Vegetable</option>
              <option value="fruit">🍎 Fruit</option>
              <option value="grain">🌾 Grain</option>
              <option value="pulse">🫘 Pulse</option>
              <option value="spice">🌶️ Spice</option>
            </select>
            <input name="quantity" type="number" min="1" value={listingForm.quantity} onChange={handleChange} placeholder="Quantity (kg)" required className="input-field" />
            <div>
              <input name="price" type="number" min="1" value={listingForm.price} onChange={handleChange} placeholder="Price (₹/kg)" required className="input-field" />
              {priceSuggestion && (
                <div className="mt-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-surface-700 animate-slide-up">
                  🤖 {priceSuggestion}
                </div>
              )}
            </div>
            <input name="harvestDate" type="date" value={listingForm.harvestDate} onChange={handleChange} required className="input-field" />
            <input name="district" value={listingForm.district} onChange={handleChange} placeholder="District" required className="input-field" />
            <input name="state" value={listingForm.state} onChange={handleChange} placeholder="State" required className="input-field" />
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="input-field !py-2 file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
            />
          </div>

          <textarea name="description" rows="3" value={listingForm.description} onChange={handleChange} placeholder="Describe quality, packaging, and harvest notes" required className="input-field" />

          <button type="submit" disabled={savingListing} className="btn-primary">
            {savingListing ? <span className="spinner" /> : "Publish Listing →"}
          </button>
        </form>

        <StressWidget onMoodLogged={handleMoodLogged} />
      </section>

      {/* Mood Chart + Orders */}
      <section className="grid gap-6 lg:grid-cols-2">
        <MoodChart moodLogs={moodLogs} />

        <div className="card-shell">
          <div className="mb-4">
            <h3 className="section-title text-lg">📋 Recent Orders</h3>
            <p className="section-subtitle">Confirm or deliver buyer orders.</p>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && <p className="text-sm text-surface-400 py-4 text-center">No orders received yet.</p>}
            {orders.slice(0, 6).map((order) => (
              <div key={order._id} className="rounded-xl border border-surface-200 p-4 hover:border-surface-300 transition-colors">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-surface-900">{order.listingId?.cropName}</p>
                    <p className="text-sm text-surface-500">
                      {order.buyerId?.name} • {order.quantity} kg • ₹{order.totalPrice?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      order.status === "pending" ? "badge-warning" :
                      order.status === "confirmed" ? "badge-info" :
                      "badge-success"
                    }`}>
                      {order.status}
                    </span>
                    {order.status === "pending" && (
                      <button type="button" onClick={() => handleConfirmOrder(order._id)} className="btn-primary !py-1.5 !px-3 !text-xs">
                        Confirm
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button type="button" onClick={() => handleDeliverOrder(order._id)} className="btn-primary !py-1.5 !px-3 !text-xs !bg-surface-800 hover:!bg-surface-700">
                        Deliver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboard;
