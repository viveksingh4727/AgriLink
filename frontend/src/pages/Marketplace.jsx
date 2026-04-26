import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";
import MarketplaceStats from "../components/MarketplaceStats";
import { useToast } from "../components/Toast";
import { seedMarketplaceData } from "../data/seedData";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PRICE_MAX = 500;

// ─── Inline stat card (outside hero so colours are visible) ──────────────────
const StatCard = ({ icon, label, value, prefix = "", suffix = "", loading }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-white border border-surface-200 shadow-sm px-5 py-4 flex-1 min-w-[140px]">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{label}</p>
      {loading ? (
        <div className="mt-1 h-6 w-16 animate-pulse rounded bg-surface-200" />
      ) : (
        <p className="text-xl font-bold text-surface-900">
          {prefix}{Number(value).toLocaleString("en-IN")}{suffix}
        </p>
      )}
    </div>
  </div>
);

const Marketplace = () => {
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingSeedData, setUsingSeedData] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Separate slider UI state from the filter state so we can debounce it
  const [priceSlider, setPriceSlider] = useState(PRICE_MAX);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    state: "",
    maxPrice: PRICE_MAX,
    sort: "newest",
  });

  // Only trigger API calls on debounced maxPrice
  const debouncedMaxPrice = useDebounce(priceSlider, 400);

  // Cancel in-flight requests when a new one starts
  const abortRef = useRef(null);

  const loadListings = useCallback(async (activeFilters) => {
    // Cancel any pending request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilters.search)   params.append("search",   activeFilters.search);
      if (activeFilters.category) params.append("category", activeFilters.category);
      if (activeFilters.state)    params.append("state",    activeFilters.state);
      // Always send maxPrice so backend filters correctly
      params.append("maxPrice", activeFilters.maxPrice);
      if (activeFilters.sort)     params.append("sort",     activeFilters.sort);

      const { data } = await api.get(`/listings?${params.toString()}`, {
        signal: abortRef.current.signal,
      });
      setListings(data);
      setUsingSeedData(false);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return; // ignore aborted
      console.warn("Backend unavailable, using sample data");
      // Client-side price filter on seed data
      const filtered = seedMarketplaceData.filter(
        (l) => l.price <= activeFilters.maxPrice
      );
      setListings(filtered);
      setUsingSeedData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get("/stats");
      setStats(data);
    } catch (_e) {
      console.warn("Stats API unavailable");
    } finally {
      setStatsLoading(false);
    }
  };

  // Rebuild effective filters whenever any filter changes (with debounced price)
  const effectiveFilters = useMemo(
    () => ({ ...filters, maxPrice: debouncedMaxPrice }),
    [filters, debouncedMaxPrice]
  );

  useEffect(() => {
    loadListings(effectiveFilters);
  }, [effectiveFilters, loadListings]);

  // Stats loaded once on mount — independent of filter changes
  useEffect(() => {
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const states = useMemo(
    () => Array.from(new Set(listings.map((l) => l.location?.state).filter(Boolean))),
    [listings]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((c) => ({ ...c, [name]: value }));
  };

  const handleSlider = (e) => {
    setPriceSlider(Number(e.target.value));
  };

  const handleReset = () => {
    setPriceSlider(PRICE_MAX);
    setFilters({ search: "", category: "", state: "", maxPrice: PRICE_MAX, sort: "newest" });
  };

  // Slider fill percentage for the visual track
  const sliderFill = Math.round(((priceSlider - 10) / (PRICE_MAX - 10)) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand to-brand-400 px-8 py-12 text-white shadow-glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200 font-bold">🌾 Fresh From Farm</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Marketplace</h1>
          <p className="mt-4 text-lg text-brand-100 max-w-2xl leading-relaxed">
            Discover fresh, premium crops directly from trusted farmers. Filter by type, location, and price to find exactly what you need.
          </p>
          {usingSeedData && (
            <div className="mt-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 inline-block">
              <p className="text-sm font-medium">📌 Displaying sample crops. Connect the backend to see live listings.</p>
            </div>
          )}
        </div>

      </section>

      {/* ── Stats Bar (outside hero for readability) ── */}
      <div className="flex flex-wrap gap-3">
        <StatCard icon="🌾" label="Crop Types"    value={stats?.totalCategories ?? 0}  loading={statsLoading} />
        <StatCard icon="👨‍🌾" label="Active Farmers" value={stats?.totalFarmers     ?? 0}  loading={statsLoading} />
        <StatCard icon="🗺️" label="States"        value={stats?.totalStates      ?? 0}  loading={statsLoading} />
        <StatCard icon="📦" label="Total Stock"   value={stats?.totalQuantityKg  ?? 0}  suffix=" kg" loading={statsLoading} />
        <StatCard icon="💰" label="Avg Price"     value={stats?.avgPrice         ?? 0}  prefix="₹" suffix="/kg" loading={statsLoading} />
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* ── Filters Sidebar ─────────────────────────────────────────────── */}
        <aside className="card-shell h-fit space-y-5 sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-surface-900">🔍 Filters</h3>
            <button onClick={handleReset} className="btn-ghost !text-xs !px-2 !py-1">↺ Reset</button>
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-surface-700">Search Crops</label>
            <input
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Tomato, Wheat..."
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-surface-700">Category</label>
            <select name="category" value={filters.category} onChange={handleChange} className="select-field">
              <option value="">All Categories</option>
              <option value="vegetable">🥬 Vegetables</option>
              <option value="fruit">🍎 Fruits</option>
              <option value="grain">🌾 Grains</option>
              <option value="pulse">🫘 Pulses</option>
              <option value="spice">🌶️ Spices</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-surface-700">Location (State)</label>
            <input
              name="state"
              value={filters.state}
              onChange={handleChange}
              placeholder="e.g. Maharashtra"
              className="input-field"
            />
          </div>

          {/* Price Slider */}
          <div className="rounded-xl bg-surface-50 border border-surface-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-surface-700">💰 Max Price / kg</label>
              <span className="rounded-lg bg-brand text-white text-xs font-bold px-2.5 py-1">
                ₹{priceSlider}{priceSlider === PRICE_MAX ? "+" : ""}
              </span>
            </div>

            {/* Custom styled slider */}
            <div className="relative">
              <input
                id="price-slider"
                type="range"
                min="10"
                max={PRICE_MAX}
                step="5"
                value={priceSlider}
                onChange={handleSlider}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand"
                style={{
                  background: `linear-gradient(to right, #22c55e ${sliderFill}%, #e2e8f0 ${sliderFill}%)`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs font-medium text-surface-400">
              <span>₹10</span>
              <span>₹100</span>
              <span>₹200</span>
              <span>₹500+</span>
            </div>

            {/* Price range quick-select buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: "< ₹50",  val: 50 },
                { label: "< ₹100", val: 100 },
                { label: "< ₹200", val: 200 },
                { label: "< ₹300", val: 300 },
                { label: "< ₹400", val: 400 },
                { label: "All",    val: PRICE_MAX },
              ].map(({ label, val }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPriceSlider(val)}
                  className={`rounded-lg border py-1 text-xs font-semibold transition-colors ${
                    priceSlider === val
                      ? "bg-brand text-white border-brand"
                      : "border-surface-200 text-surface-600 hover:border-brand hover:text-brand"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-surface-700">Sort</label>
            <select name="sort" value={filters.sort} onChange={handleChange} className="select-field">
              <option value="newest">🆕 Newest First</option>
              <option value="price-low-high">📉 Price: Low to High</option>
              <option value="price-high-low">📈 Price: High to Low</option>
            </select>
          </div>

          {/* Active filter summary */}
          {(filters.search || filters.category || filters.state || priceSlider < PRICE_MAX) && (
            <div className="rounded-lg bg-brand-50 border border-brand-200 px-3 py-2 text-xs text-brand-700 font-medium">
              ✅ Filters active — showing crops ≤ ₹{priceSlider}/kg
              {filters.category && ` · ${filters.category}`}
              {filters.state && ` · ${filters.state}`}
            </div>
          )}
        </aside>

        {/* ── Listings Grid ────────────────────────────────────────────────── */}
        <section>
          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="text-center">
                <span className="spinner h-12 w-12 inline-block mb-4" />
                <p className="text-surface-500 font-medium">Loading fresh crops...</p>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="card-shell text-center py-16 border-2 border-dashed border-surface-300">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-surface-900">No crops found</h3>
              <p className="mt-2 text-surface-500">
                No listings under <strong>₹{priceSlider}/kg</strong>
                {filters.category && ` in ${filters.category}`}
                {filters.state && ` from ${filters.state}`}.
                Try adjusting your filters.
              </p>
              <button onClick={handleReset} className="btn-primary mt-6">Clear All Filters</button>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex items-center justify-between rounded-xl bg-brand-50 border border-brand-200 p-3">
                <p className="text-sm text-surface-600 font-medium">
                  Showing <span className="text-lg font-bold text-brand">{listings.length}</span> listings
                  {priceSlider < PRICE_MAX && (
                    <span className="ml-2 text-xs text-surface-400">· under ₹{priceSlider}/kg</span>
                  )}
                </p>
                <span className="text-xl">✨</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 stagger-children">
                {listings.map((listing, i) => (
                  <ListingCard key={listing._id || i} listing={listing} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Marketplace;
