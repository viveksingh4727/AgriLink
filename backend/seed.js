import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Listing from "./models/Listing.js";
import MoodLog from "./models/MoodLog.js";
import Notification from "./models/Notification.js";
import Order from "./models/Order.js";
import User from "./models/User.js";

dotenv.config();

// ─── Farmers ────────────────────────────────────────────────────────────────
const farmerData = [
  {
    name: "Rajesh Kumar",
    email: "rajesh@farmmail.com",
    password: "password123",
    role: "farmer",
    phone: "9876543210",
    location: { district: "Nashik", state: "Maharashtra" },
  },
  {
    name: "Meena Devi",
    email: "meena@farmmail.com",
    password: "password123",
    role: "farmer",
    phone: "9812345678",
    location: { district: "Ludhiana", state: "Punjab" },
  },
  {
    name: "Suresh Patel",
    email: "suresh@farmmail.com",
    password: "password123",
    role: "farmer",
    phone: "9845001234",
    location: { district: "Anand", state: "Gujarat" },
  },
  {
    name: "Kavitha Reddy",
    email: "kavitha@farmmail.com",
    password: "password123",
    role: "farmer",
    phone: "9901223344",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
  },
];

const buyerData = [
  {
    name: "Arjun Foods Pvt Ltd",
    email: "buyer@marketmail.com",
    password: "password123",
    role: "buyer",
    phone: "9898989898",
    location: { district: "Bengaluru Urban", state: "Karnataka" },
  },
  {
    name: "FreshMart Wholesale",
    email: "freshmart@buyer.com",
    password: "password123",
    role: "buyer",
    phone: "9090909090",
    location: { district: "Pune", state: "Maharashtra" },
  },
];

// ─── Listings (each with a unique, exact Unsplash photo) ────────────────────
const listingTemplates = [
  // ── Rajesh Kumar (Nashik, Maharashtra) ────────────────────────────────────
  {
    cropName: "Tomato",
    category: "vegetable",
    quantity: 1200,
    price: 28,
    harvestDate: new Date("2025-09-10"),
    description:
      "Bright red, firm tomatoes sorted for wholesale buyers. Ideal for processing, restaurants, and retail. Grown with drip irrigation.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: [
      "https://images.unsplash.com/photo-1546470427-f5f28f9e89ee?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Onion",
    category: "vegetable",
    quantity: 2000,
    price: 24,
    harvestDate: new Date("2025-08-28"),
    description:
      "Storage-grade onions with uniform size and deep red skin. Well cured and ready for long-haul transport.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: [
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Pomegranate",
    category: "fruit",
    quantity: 750,
    price: 95,
    harvestDate: new Date("2025-09-20"),
    description:
      "Export-quality Bhagwa pomegranates with deep ruby arils. Selected from premium orchards with zero pesticide in final stage.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Grapes",
    category: "fruit",
    quantity: 600,
    price: 72,
    harvestDate: new Date("2025-08-15"),
    description:
      "Thomson Seedless grapes — crisp, sweet, table-grade. Packed in ventilated crates. Popular for retail chains.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: [
      "https://images.unsplash.com/photo-1543520958-a34a7f37w2o?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },

  // ── Meena Devi (Ludhiana, Punjab) ────────────────────────────────────────
  {
    cropName: "Wheat",
    category: "grain",
    quantity: 3500,
    price: 32,
    harvestDate: new Date("2025-07-30"),
    description:
      "Cleaned HD-2967 wheat ready for bulk procurement. Low moisture, free of foreign material. Suitable for flour mills.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Mustard",
    category: "grain",
    quantity: 900,
    price: 68,
    harvestDate: new Date("2025-08-10"),
    description:
      "Premium yellow mustard seeds with strong oil yield (above 40%). Double-cleaned and bagged in 50 kg PP sacks.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: [
      "https://images.unsplash.com/photo-1612187029698-d83f04df1571?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Guava",
    category: "fruit",
    quantity: 600,
    price: 45,
    harvestDate: new Date("2025-09-05"),
    description:
      "Farm-fresh Allahabad Safeda guavas packed in crates. Soft, sweet flesh with high Vitamin C content.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: [
      "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Rice (Basmati)",
    category: "grain",
    quantity: 2200,
    price: 58,
    harvestDate: new Date("2025-10-01"),
    description:
      "Long-grain Pusa Basmati 1121. Aged 6 months for aroma enhancement. Ready for export or domestic market.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },

  // ── Suresh Patel (Anand, Gujarat) ─────────────────────────────────────────
  {
    cropName: "Cotton",
    category: "grain",
    quantity: 4000,
    price: 62,
    harvestDate: new Date("2025-11-15"),
    description:
      "Gujarat Bt Cotton bolls, fully open and machine-picked. High staple length suitable for quality textiles.",
    location: { district: "Anand", state: "Gujarat" },
    images: [
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Banana",
    category: "fruit",
    quantity: 1800,
    price: 35,
    harvestDate: new Date("2025-08-25"),
    description:
      "G9 Cavendish bananas, medium ripeness, packed in 20 kg corrugated boxes. Consistent finger size and color.",
    location: { district: "Anand", state: "Gujarat" },
    images: [
      "https://images.unsplash.com/photo-1543218024-57a70143c369?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Potato",
    category: "vegetable",
    quantity: 5000,
    price: 18,
    harvestDate: new Date("2025-08-05"),
    description:
      "Kufri Jyoti potatoes, washed and graded A/B. Ideal for chips, fries, and vegetable processing industry.",
    location: { district: "Anand", state: "Gujarat" },
    images: [
      "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Groundnut",
    category: "pulse",
    quantity: 1300,
    price: 85,
    harvestDate: new Date("2025-10-20"),
    description:
      "Bold-type shelled groundnuts. Aflatoxin tested and certified. Excellent for oil extraction and cold-pressed peanut butter.",
    location: { district: "Anand", state: "Gujarat" },
    images: [
      "https://images.unsplash.com/photo-1567892737950-30d27f553a4e?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },

  // ── Kavitha Reddy (Kurnool, Andhra Pradesh) ───────────────────────────────
  {
    cropName: "Red Chilli",
    category: "spice",
    quantity: 800,
    price: 140,
    harvestDate: new Date("2025-09-30"),
    description:
      "Teja S17 dry red chillies — high pungency (90,000 SHU), deep red colour. Popular in spice blending and export.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: [
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Turmeric",
    category: "spice",
    quantity: 550,
    price: 120,
    harvestDate: new Date("2025-10-10"),
    description:
      "Salem finger turmeric with 4%+ curcumin content. Sun-dried and polished. Vacuum-packed bags available.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Sunflower Seeds",
    category: "grain",
    quantity: 1100,
    price: 55,
    harvestDate: new Date("2025-09-25"),
    description:
      "Hybrid KBSH-44 sunflower seeds with 40%+ oil content. Dried to 8% moisture. Bulk bags of 100 kg available.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: [
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Brinjal (Eggplant)",
    category: "vegetable",
    quantity: 700,
    price: 30,
    harvestDate: new Date("2025-08-20"),
    description:
      "Glossy purple brinjals of uniform size, freshly harvested. Good shelf life; ideal for restaurant supply.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: [
      "https://images.unsplash.com/photo-1659279556640-a90783b506a9?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Chickpea (Chana)",
    category: "pulse",
    quantity: 2000,
    price: 75,
    harvestDate: new Date("2025-09-15"),
    description:
      "Desi bold chana (gram), machine-cleaned, moisture <12%. Excellent for dal, besan production, and exports.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: [
      "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
  {
    cropName: "Mango (Alphonso)",
    category: "fruit",
    quantity: 400,
    price: 180,
    harvestDate: new Date("2025-08-12"),
    description:
      "GI-tagged Alphonso mangoes from Devgad. Rich saffron colour, fibreless pulp, divine aroma. Gift boxes available.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: [
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=900&q=80",
    ],
    status: "active",
  },
];

// ─── Mood Data ───────────────────────────────────────────────────────────────
const moods = ["Very Good", "Good", "Neutral", "Stressed", "Good", "Very Good", "Neutral"];

// ─── Run Seed ────────────────────────────────────────────────────────────────
const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Seeding database…");

    // ── Clear existing data ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Order.deleteMany({}),
      MoodLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // ── Hash passwords before insert (insertMany skips pre-save hooks) ──
    const hashedPassword = await bcrypt.hash("password123", 10);
    const hashUsers = (users) =>
      users.map((u) => ({ ...u, password: hashedPassword }));

    // ── Insert users ───────────────────────────────────────────────────────
    const farmers = await User.insertMany(hashUsers(farmerData));
    await User.insertMany(hashUsers(buyerData));

    console.log(`✓ Inserted ${farmers.length} farmers and ${buyerData.length} buyers`);

    // ── Assign listings to farmers round-robin ─────────────────────────────
    const listings = listingTemplates.map((listing, index) => ({
      ...listing,
      farmerId: farmers[index % farmers.length]._id,
    }));

    await Listing.insertMany(listings);
    console.log(`✓ Inserted ${listings.length} crop listings`);

    // ── Mood logs for all farmers over last 7 days ─────────────────────────
    const moodLogs = [];
    farmers.forEach((farmer) => {
      moods.forEach((mood, index) => {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - index);
        createdAt.setHours(9 + index, 0, 0, 0);
        moodLogs.push({
          farmerId: farmer._id,
          mood,
          note: mood.includes("Stressed")
            ? "Weather uncertainty and transport delays."
            : "Fieldwork was manageable.",
          createdAt,
          updatedAt: createdAt,
        });
      });
    });

    await MoodLog.insertMany(moodLogs);
    console.log(`✓ Inserted ${moodLogs.length} mood log entries`);

    console.log("\n🌾 Seed completed successfully!");
    console.log("\nTest accounts:");
    console.log("  Farmer  → rajesh@farmmail.com   / password123");
    console.log("  Farmer  → meena@farmmail.com    / password123");
    console.log("  Farmer  → suresh@farmmail.com   / password123");
    console.log("  Farmer  → kavitha@farmmail.com  / password123");
    console.log("  Buyer   → buyer@marketmail.com  / password123");
    console.log("  Buyer   → freshmart@buyer.com   / password123");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

runSeed();
