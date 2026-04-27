
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

// ─── Listings (FIXED IMAGES) ────────────────────────────────────────────────
const listingTemplates = [
  // ── Rajesh Kumar ─────────────────────────────────────────────────────────
  {
    cropName: "Tomato",
    category: "vegetable",
    quantity: 1200,
    price: 28,
    harvestDate: new Date("2025-09-10"),
    description: "Fresh red tomatoes for wholesale.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: ["https://images.unsplash.com/photo-1582284540020-8acbe03f4924"],
    status: "active",
  },
  {
    cropName: "Onion",
    category: "vegetable",
    quantity: 2000,
    price: 24,
    harvestDate: new Date("2025-08-28"),
    description: "Storage-grade onions.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: ["https://images.unsplash.com/photo-1587049633312-d628ae50a8ae"],
    status: "active",
  },
  {
    cropName: "Pomegranate",
    category: "fruit",
    quantity: 750,
    price: 95,
    harvestDate: new Date("2025-09-20"),
    description: "Premium pomegranates.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: ["https://plus.unsplash.com/premium_photo-1668076515507-c5bc223c99a4"],
    status: "active",
  },
  {
    cropName: "Grapes",
    category: "fruit",
    quantity: 600,
    price: 72,
    harvestDate: new Date("2025-08-15"),
    description: "Fresh grapes.",
    location: { district: "Nashik", state: "Maharashtra" },
    images: ["https://images.unsplash.com/photo-1537640538966-79f369143f8f"],
    status: "active",
  },

  // ── Meena Devi ───────────────────────────────────────────────────────────
  {
    cropName: "Wheat",
    category: "grain",
    quantity: 3500,
    price: 32,
    harvestDate: new Date("2025-07-30"),
    description: "High-quality wheat.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: ["https://plus.unsplash.com/premium_photo-1661963447711-27f892ffe292"],
    status: "active",
  },
  {
    cropName: "Mustard",
    category: "grain",
    quantity: 900,
    price: 68,
    harvestDate: new Date("2025-08-10"),
    description: "Yellow mustard seeds.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: ["https://plus.unsplash.com/premium_photo-1671130295236-e8afa3ac38c9"],
    status: "active",
  },
  {
    cropName: "Guava",
    category: "fruit",
    quantity: 600,
    price: 45,
    harvestDate: new Date("2025-09-05"),
    description: "Fresh guavas.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: ["https://images.unsplash.com/photo-1689996647099-a7a0b67fd2f6"],
    status: "active",
  },
  {
    cropName: "Rice (Basmati)",
    category: "grain",
    quantity: 2200,
    price: 58,
    harvestDate: new Date("2025-10-01"),
    description: "Premium basmati rice.",
    location: { district: "Ludhiana", state: "Punjab" },
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c"],
    status: "active",
  },

  // ── Suresh Patel ─────────────────────────────────────────────────────────
  {
    cropName: "Cotton",
    category: "grain",
    quantity: 4000,
    price: 62,
    harvestDate: new Date("2025-11-15"),
    description: "Bt cotton.",
    location: { district: "Anand", state: "Gujarat" },
    images: ["http://images.unsplash.com/photo-1616431101491-554c0932ea40"],
    status: "active",
  },
  {
    cropName: "Banana",
    category: "fruit",
    quantity: 1800,
    price: 35,
    harvestDate: new Date("2025-08-25"),
    description: "Cavendish bananas.",
    location: { district: "Anand", state: "Gujarat" },
    images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"],
    status: "active",
  },
  {
    cropName: "Potato",
    category: "vegetable",
    quantity: 5000,
    price: 18,
    harvestDate: new Date("2025-08-05"),
    description: "Fresh potatoes.",
    location: { district: "Anand", state: "Gujarat" },
    images: ["http://plus.unsplash.com/premium_photo-1664372599369-dd9f4ee07254"],
    status: "active",
  },
  {
    cropName: "Groundnut",
    category: "pulse",
    quantity: 1300,
    price: 85,
    harvestDate: new Date("2025-10-20"),
    description: "Quality groundnuts.",
    location: { district: "Anand", state: "Gujarat" },
    images: ["http://plus.unsplash.com/premium_photo-1667773157798-55785dd16b0a"],
    status: "active",
  },

  // ── Kavitha Reddy ────────────────────────────────────────────────────────
  {
    cropName: "Red Chilli",
    category: "spice",
    quantity: 800,
    price: 140,
    harvestDate: new Date("2025-09-30"),
    description: "Dry red chillies.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: ["https://images.unsplash.com/photo-1526346698789-22fd84314424"],
    status: "active",
  },
  {
    cropName: "Turmeric",
    category: "spice",
    quantity: 550,
    price: 120,
    harvestDate: new Date("2025-10-10"),
    description: "Fresh turmeric.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: ["https://images.unsplash.com/photo-1702041295331-840d4d9aa7c9"],
    status: "active",
  },
  {
    cropName: "Sunflower Seeds",
    category: "grain",
    quantity: 1100,
    price: 55,
    harvestDate: new Date("2025-09-25"),
    description: "Sunflower seeds.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: ["http://plus.unsplash.com/premium_photo-1726072386964-62fe47163be7"],
    status: "active",
  },
  {
    cropName: "Brinjal (Eggplant)",
    category: "vegetable",
    quantity: 700,
    price: 30,
    harvestDate: new Date("2025-08-20"),
    description: "Fresh brinjal.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80"],
    status: "active",
  },
  {
    cropName: "Chickpea (Chana)",
    category: "pulse",
    quantity: 2000,
    price: 75,
    harvestDate: new Date("2025-09-15"),
    description: "Chana.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: ["https://images.unsplash.com/photo-1515543904379-3d757afe72e4"],
    status: "active",
  },
  {
    cropName: "Mango (Alphonso)",
    category: "fruit",
    quantity: 400,
    price: 180,
    harvestDate: new Date("2025-08-12"),
    description: "Alphonso mango.",
    location: { district: "Kurnool", state: "Andhra Pradesh" },
    images: ["https://images.unsplash.com/photo-1591073113125-e46713c829ed"],
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

    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Order.deleteMany({}),
      MoodLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash("password123", 10);
    const hashUsers = (users) => users.map((u) => ({ ...u, password: hashedPassword }));

    const farmers = await User.insertMany(hashUsers(farmerData));
    await User.insertMany(hashUsers(buyerData));

    const listings = listingTemplates.map((listing, index) => ({
      ...listing,
      farmerId: farmers[index % farmers.length]._id,
    }));

    await Listing.insertMany(listings);

    const moodLogs = [];
    farmers.forEach((farmer) => {
      moods.forEach((mood, index) => {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - index);
        moodLogs.push({
          farmerId: farmer._id,
          mood,
          createdAt,
          updatedAt: createdAt,
        });
      });
    });

    await MoodLog.insertMany(moodLogs);

    console.log("🌾 Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

runSeed();

