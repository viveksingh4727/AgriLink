import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";

const statusSteps = ["pending", "confirmed", "delivered"];
const statusIcons = { pending: "⏳", confirmed: "✅", delivered: "📦" };

const MyOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/orders/buyer");
        setOrders(data);
      } catch (error) {
        showToast(error.response?.data?.message || "Unable to load orders", "error");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        orderId: reviewForm.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      showToast("Review submitted! ⭐");
      setReviewForm({ orderId: null, rating: 5, comment: "" });
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-100 via-white to-brand-50 px-8 py-10 border border-surface-200">
        <p className="text-sm uppercase tracking-[0.3em] text-brand font-bold">🛒 My Orders</p>
        <h1 className="mt-2 text-3xl font-bold text-surface-900">Track Purchased Crops</h1>
        <p className="mt-2 text-sm text-surface-600">Review quantity, spending, and delivery progress.</p>
      </section>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <span className="spinner h-10 w-10" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card-shell text-center py-12">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="text-xl font-bold text-surface-900">No orders yet</h3>
          <p className="mt-2 text-surface-500">Browse the marketplace to place your first order.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {orders.map((order) => {
            const currentStep = statusSteps.indexOf(order.status);
            return (
              <div key={order._id} className="card-shell">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg">
                        {statusIcons[order.status]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-surface-900">{order.listingId?.cropName}</h3>
                        <p className="text-sm text-surface-500">
                          👨‍🌾 {order.farmerId?.name} • {order.farmerId?.location?.district}, {order.farmerId?.location?.state}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 flex items-center gap-1">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex items-center gap-1 flex-1">
                          <div className={`h-2 flex-1 rounded-full transition-colors ${
                            i <= currentStep ? "bg-brand" : "bg-surface-200"
                          }`} />
                          {i < statusSteps.length - 1 && <div className="w-1" />}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] font-medium text-surface-400 uppercase tracking-wider">
                      {statusSteps.map((s) => <span key={s}>{s}</span>)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 lg:w-[320px]">
                    <div className="rounded-xl bg-surface-50 p-3 text-center">
                      <p className="text-xs text-surface-400">Quantity</p>
                      <p className="text-lg font-bold text-surface-900">{order.quantity} kg</p>
                    </div>
                    <div className="rounded-xl bg-brand-50 p-3 text-center">
                      <p className="text-xs text-surface-400">Total</p>
                      <p className="text-lg font-bold text-brand">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="rounded-xl bg-surface-50 p-3 text-center">
                      <p className="text-xs text-surface-400">Contact</p>
                      <p className="text-sm font-bold text-surface-900 truncate">{order.farmerId?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Review CTA */}
                {(order.status === "confirmed" || order.status === "delivered") && (
                  <div className="mt-4 border-t border-surface-200 pt-4">
                    {reviewForm.orderId === order._id ? (
                      <form onSubmit={handleReview} className="space-y-3 animate-slide-up">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-surface-700">Rating:</p>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewForm((c) => ({ ...c, rating: s }))}
                              className={`text-xl transition-transform hover:scale-125 ${s <= reviewForm.rating ? "text-amber-400" : "text-surface-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((c) => ({ ...c, comment: e.target.value }))}
                          placeholder="Share your experience (optional)"
                          rows="2"
                          className="input-field"
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={submittingReview} className="btn-primary !text-sm !py-2">
                            {submittingReview ? <span className="spinner" /> : "Submit Review"}
                          </button>
                          <button type="button" onClick={() => setReviewForm({ orderId: null, rating: 5, comment: "" })} className="btn-secondary !text-sm !py-2">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewForm({ orderId: order._id, rating: 5, comment: "" })}
                        className="btn-ghost !text-sm"
                      >
                        ⭐ Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
