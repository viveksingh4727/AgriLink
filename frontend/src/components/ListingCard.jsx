import { Link } from "react-router-dom";
import { buildAssetUrl } from "../api/axios";

const getCategoryEmoji = (category) => {
  const map = { vegetable: "🥬", fruit: "🍎", grain: "🌾", pulse: "🫘", spice: "🌶️" };
  return map[category] || "🌱";
};

const statusColors = {
  active: "bg-brand-100 text-brand-700",
  sold: "bg-surface-200 text-surface-600",
  expired: "bg-amber-100 text-amber-700",
};

// Verified Unsplash photo IDs — each crop gets its own accurate image
const CROP_IMAGES = {
  // Vegetables
  tomato:           "https://images.unsplash.com/photo-1546470427-f5f28f9e89ee?auto=format&fit=crop&w=900&q=80",
  onion:            "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=900&q=80",
  potato:           "https://images.unsplash.com/photo-1508313880080-c4bef0730395?auto=format&fit=crop&w=900&q=80",
  brinjal:          "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
  eggplant:         "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
  spinach:          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80",
  cauliflower:      "https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?auto=format&fit=crop&w=900&q=80",
  cabbage:          "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=900&q=80",
  capsicum:         "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=900&q=80",
  carrot:           "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80",
  // Fruits
  pomegranate:      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=900&q=80",
  grapes:           "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=900&q=80",
  banana:           "https://images.unsplash.com/photo-1543218024-57a70143c369?auto=format&fit=crop&w=900&q=80",
  mango:            "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=900&q=80",
  guava:            "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=900&q=80",
  papaya:           "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=900&q=80",
  watermelon:       "https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=900&q=80",
  orange:           "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=900&q=80",
  // Grains
  wheat:            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80",
  rice:             "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
  mustard:          "https://images.unsplash.com/photo-1455853828816-0c301a011711?auto=format&fit=crop&w=900&q=80",
  cotton:           "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
  sunflower:        "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=900&q=80",
  maize:            "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=900&q=80",
  corn:             "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=900&q=80",
  // Pulses
  groundnut:        "https://images.unsplash.com/photo-1600555379765-f5e02a9c6d8a?auto=format&fit=crop&w=900&q=80",
  chickpea:         "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
  chana:            "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
  lentil:           "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
  dal:              "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
  moong:            "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
  // Spices
  "red chilli":     "https://images.unsplash.com/photo-1521986329282-0436c1f1e212?auto=format&fit=crop&w=900&q=80",
  chilli:           "https://images.unsplash.com/photo-1521986329282-0436c1f1e212?auto=format&fit=crop&w=900&q=80",
  turmeric:         "https://images.unsplash.com/photo-1601598837557-c8aa2c5e1b7c?auto=format&fit=crop&w=900&q=80",
  ginger:           "https://images.unsplash.com/photo-1603431773021-f4d4dc50dde4?auto=format&fit=crop&w=900&q=80",
  garlic:           "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80",
};

// Category fallbacks
const CATEGORY_IMAGES = {
  vegetable: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  fruit:     "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80",
  grain:     "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80",
  pulse:     "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
  spice:     "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=900&q=80",
};

const getCropImage = (listing) => {
  // 1. If DB has an uploaded image, use it
  if (listing.images?.[0] && !listing.images[0].startsWith("http")) {
    return buildAssetUrl(listing.images[0]);
  }
  // 2. Lookup by crop name (case-insensitive partial match)
  const name = (listing.cropName || "").toLowerCase();
  const matchedKey = Object.keys(CROP_IMAGES).find((key) => name.includes(key));
  if (matchedKey) return CROP_IMAGES[matchedKey];
  // 3. If DB has an http image URL, use it directly
  if (listing.images?.[0]?.startsWith("http")) return listing.images[0];
  // 4. Fall back to category image
  return CATEGORY_IMAGES[listing.category] || CATEGORY_IMAGES.vegetable;
};

const ListingCard = ({ listing }) => {
  const image = getCropImage(listing);

  return (
    <div className="group card-shell overflow-hidden p-0 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-surface-100">
        <img
          src={image}
          alt={listing.cropName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold shadow-sm">
            {getCategoryEmoji(listing.category)} {listing.category}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`badge ${statusColors[listing.status] || statusColors.active}`}>
            {listing.status}
          </span>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
            <p className="text-lg font-bold text-brand">₹{listing.price}<span className="text-xs font-medium text-surface-500">/kg</span></p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-surface-900 line-clamp-1">{listing.cropName}</h3>
        </div>

        <div className="space-y-1.5 text-sm text-surface-500">
          <div className="flex items-center gap-2">
            <span>👨‍🌾</span>
            <p className="font-medium text-surface-700">{listing.farmerId?.name || "Local Farmer"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <p>{listing.location?.district}, {listing.location?.state}</p>
          </div>
          <div className="flex items-center gap-2">
            <span>📦</span>
            <p><span className="font-semibold text-surface-700">{listing.quantity}</span> kg available</p>
          </div>
        </div>

        <Link
          to={`/listings/${listing._id}`}
          className="btn-primary w-full !rounded-lg !py-2.5 !text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ListingCard;
