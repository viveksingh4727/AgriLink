import { useEffect, useMemo, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import api, { buildAssetUrl } from "../api/axios";
import OrderModal from "../components/OrderModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const trendMap = {
  vegetable: [22, 24, 27, 25, 29, 31],
  fruit: [50, 54, 57, 60, 64, 66],
  grain: [28, 29, 31, 30, 33, 35],
  pulse: [60, 63, 65, 68, 70, 72],
  spice: [90, 94, 99, 103, 108, 112],
};

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data);
        try {
          const { data: revData } = await api.get(`/reviews/listing/${id}`);
          setReviews(revData);
        } catch (_e) {}
      } catch (error) {
        showToast(error.response?.data?.message || "Unable to fetch listing", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const images = useMemo(() => {
    if (!listing) return [];
    return listing.images?.length
      ? listing.images.map((img) => buildAssetUrl(img))
      : ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80"];
  }, [listing]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const trendData = {
    labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    datasets: [{
      label: `${listing?.category || "Crop"} price trend`,
      data: trendMap[listing?.category] || trendMap.vegetable,
      borderColor: "#059669",
      backgroundColor: "rgba(5, 150, 105, 0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#059669",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: "Inter" },
        bodyFont: { family: "Inter" },
      },
    },
    scales: {
      y: { ticks: { font: { family: "Inter", size: 11 }, color: "#94a3b8" }, grid: { color: "rgba(0,0,0,0.04)" } },
      x: { ticks: { font: { family: "Inter", size: 11 }, color: "#94a3b8" }, grid: { display: false } },
    },
  };

  const handleOrderConfirm = async (quantity) => {
    setSubmittingOrder(true);
    try {
      await api.post("/orders", { listingId: listing._id, quantity });
      showToast("Order placed successfully! 🎉");
      setShowOrderModal(false);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to place order", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="spinner h-10 w-10" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="card-shell text-center py-12">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-surface-900">Listing not found</h2>
        <p className="mt-2 text-surface-500">This listing may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Image Gallery */}
        <div className="card-shell p-0 overflow-hidden">
          <div className="relative h-[400px] bg-surface-100">
            <img
              src={images[currentImage]}
              alt={listing.cropName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setCurrentImage(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    currentImage === i ? "border-brand shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card-shell space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand font-bold">{listing.category}</p>
              <h1 className="mt-1 text-2xl font-bold text-surface-900">{listing.cropName}</h1>
              <p className="mt-1 text-sm text-surface-500">
                📍 {listing.location?.district}, {listing.location?.state}
              </p>
            </div>
            <span className="badge-success">{listing.status}</span>
          </div>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? "text-amber-400" : "text-surface-300"}`}>★</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-surface-700">{avgRating}</p>
              <p className="text-sm text-surface-400">({reviews.length} reviews)</p>
            </div>
          )}

          {/* Price & Quantity */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-50 border border-brand-200 p-4">
              <p className="text-xs font-medium text-surface-500">Price</p>
              <p className="mt-1 text-2xl font-bold text-brand">₹{listing.price}<span className="text-sm font-medium text-surface-500">/kg</span></p>
            </div>
            <div className="rounded-xl bg-surface-50 border border-surface-200 p-4">
              <p className="text-xs font-medium text-surface-500">Available</p>
              <p className="mt-1 text-2xl font-bold text-surface-900">{listing.quantity} <span className="text-sm font-medium text-surface-500">kg</span></p>
            </div>
          </div>

          <div className="text-sm text-surface-600 leading-relaxed space-y-2">
            <p>{listing.description}</p>
            <p className="text-surface-500">📅 Harvest: {new Date(listing.harvestDate).toLocaleDateString("en-IN")}</p>
            <p className="text-surface-500">👨‍🌾 Farmer: {listing.farmerId?.name}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setShowContact(true)} className="btn-secondary">
              📞 Express Interest
            </button>
            {user?.role === "buyer" && (
              <button type="button" onClick={() => setShowOrderModal(true)} className="btn-primary">
                🛒 Place Order
              </button>
            )}
          </div>

          {showContact && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-surface-700 animate-slide-up">
              📞 {listing.farmerId?.name} — {listing.farmerId?.phone}
            </div>
          )}

          {!user && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-surface-700">
              🔑 Login as a buyer to place an order and access AI features.
            </div>
          )}
        </div>
      </section>

      {/* Price Trend */}
      <section className="card-shell">
        <h3 className="section-title text-lg mb-1">📈 Price Trend</h3>
        <p className="section-subtitle mb-4">Market trend for {listing.category} over the last 6 months.</p>
        <div className="h-[250px]">
          <Line data={trendData} options={chartOptions} />
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="card-shell">
          <h3 className="section-title text-lg mb-4">⭐ Reviews ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-surface-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100 text-sm font-bold text-surface-600">
                    {r.buyerId?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{r.buyerId?.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-xs ${s <= r.rating ? "text-amber-400" : "text-surface-300"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-surface-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-surface-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <OrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onConfirm={handleOrderConfirm}
        listing={listing}
        submitting={submittingOrder}
      />
    </div>
  );
};

export default ListingDetail;
