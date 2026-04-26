import { useEffect, useMemo, useState } from "react";

const OrderModal = ({ open, onClose, onConfirm, listing, submitting }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open]);

  const total = useMemo(() => Number(quantity || 0) * Number(listing?.price || 0), [quantity, listing]);

  if (!open || !listing) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-surface-900/50 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Place Order</h2>
            <p className="mt-1 text-sm text-surface-500">{listing.cropName} from {listing.farmerId?.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors text-lg">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-surface-700">Quantity (kg)</label>
            <input
              type="number"
              min="1"
              max={listing.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-field"
            />
            <p className="mt-2 text-xs text-surface-400">Available: <span className="font-semibold text-surface-600">{listing.quantity} kg</span></p>
          </div>

          {/* Price Summary */}
          <div className="rounded-xl bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500">Unit Price</p>
                <p className="text-sm font-semibold text-surface-700">₹{listing.price}/kg</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-surface-500">Total Price</p>
                <p className="text-2xl font-bold text-brand">₹{total.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(Number(quantity))}
            disabled={submitting || Number(quantity) < 1}
            className="btn-primary min-w-[140px]"
          >
            {submitting ? <span className="spinner" /> : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
