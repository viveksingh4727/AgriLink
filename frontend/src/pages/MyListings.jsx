import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";

const emptyForm = {
  cropName: "", category: "vegetable", quantity: "", price: "",
  harvestDate: "", description: "", district: "", state: "", status: "active", images: [],
};

const statusStyles = {
  active: "badge-success",
  sold: "badge-neutral",
  expired: "badge-warning",
};

const MyListings = () => {
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/listings/mine");
      setListings(data);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load listings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, []);

  const startEdit = (l) => {
    setEditingId(l._id);
    setForm({
      cropName: l.cropName, category: l.category, quantity: l.quantity, price: l.price,
      harvestDate: l.harvestDate?.slice(0, 10), description: l.description,
      district: l.location?.district || "", state: l.location?.state || "",
      status: l.status, images: [],
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") { setForm((c) => ({ ...c, images: Array.from(files).slice(0, 3) })); return; }
    setForm((c) => ({ ...c, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "images") v.forEach((f) => formData.append("images", f));
        else formData.append(k, v);
      });
      const { data } = await api.put(`/listings/${editingId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setListings((c) => c.map((l) => (l._id === editingId ? data : l)));
      setEditingId(null);
      setForm(emptyForm);
      showToast("Listing updated ✅");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update listing", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/listings/${id}`);
      setListings((c) => c.filter((l) => l._id !== id));
      showToast("Listing deleted");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete listing", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-brand-50 to-brand-100 px-8 py-10 border border-brand-200">
        <p className="text-sm uppercase tracking-[0.3em] text-brand font-bold">📦 My Listings</p>
        <h1 className="mt-2 text-3xl font-bold text-surface-900">Manage Crop Inventory</h1>
        <p className="mt-2 text-sm text-surface-600">Review, update, or remove your listed crops.</p>
      </section>

      {/* Edit Form */}
      {editingId && (
        <form onSubmit={handleUpdate} className="card-shell space-y-4 border-2 border-brand-200 animate-scale-in">
          <h3 className="section-title text-lg">✏️ Edit Listing</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="cropName" value={form.cropName} onChange={handleChange} placeholder="Crop name" required className="input-field" />
            <select name="category" value={form.category} onChange={handleChange} className="select-field">
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain</option>
              <option value="pulse">Pulse</option>
              <option value="spice">Spice</option>
            </select>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="input-field" placeholder="Quantity" />
            <input name="price" type="number" value={form.price} onChange={handleChange} className="input-field" placeholder="Price" />
            <input name="harvestDate" type="date" value={form.harvestDate} onChange={handleChange} className="input-field" />
            <select name="status" value={form.status} onChange={handleChange} className="select-field">
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
            </select>
            <input name="district" value={form.district} onChange={handleChange} className="input-field" placeholder="District" />
            <input name="state" value={form.state} onChange={handleChange} className="input-field" placeholder="State" />
          </div>
          <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="input-field" placeholder="Description" />
          <input name="images" type="file" multiple accept="image/*" onChange={handleChange} className="input-field !py-2" />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <span className="spinner" /> : "Save Changes"}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <span className="spinner h-10 w-10" />
        </div>
      ) : listings.length === 0 ? (
        <div className="card-shell text-center py-12">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-surface-900">No listings yet</h3>
          <p className="mt-2 text-surface-500">Go to your dashboard to create your first crop listing.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
          {listings.map((l) => (
            <div key={l._id} className="card-shell space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-surface-900">{l.cropName}</h3>
                  <p className="text-xs text-surface-500">{l.category} • {l.location?.district}, {l.location?.state}</p>
                </div>
                <span className={`badge ${statusStyles[l.status] || statusStyles.active}`}>{l.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-surface-50 p-2.5">
                  <p className="text-xs text-surface-400">Quantity</p>
                  <p className="font-bold text-surface-800">{l.quantity} kg</p>
                </div>
                <div className="rounded-lg bg-brand-50 p-2.5">
                  <p className="text-xs text-surface-400">Price</p>
                  <p className="font-bold text-brand">₹{l.price}/kg</p>
                </div>
              </div>

              <p className="text-sm text-surface-500 line-clamp-2">{l.description}</p>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => startEdit(l)} className="btn-ghost !text-xs flex-1">
                  ✏️ Edit
                </button>
                <button type="button" onClick={() => handleDelete(l._id)} className="btn-ghost !text-xs !text-rose-600 hover:!bg-rose-50 flex-1">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
