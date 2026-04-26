import Listing from "../models/Listing.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

export const getMarketplaceStats = async (_req, res) => {
  try {
    const [totalListings, totalFarmers, totalBuyers, totalOrders, aggregation] = await Promise.all([
      Listing.countDocuments({ status: "active" }),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "buyer" }),
      Order.countDocuments({}),
      Listing.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
            uniqueStates: { $addToSet: "$location.state" },
            uniqueCategories: { $addToSet: "$category" },
            avgPrice: { $avg: "$price" },
          },
        },
      ]),
    ]);

    const agg = aggregation[0] || {
      totalQuantity: 0,
      uniqueStates: [],
      uniqueCategories: [],
      avgPrice: 0,
    };

    return res.json({
      totalListings,
      totalFarmers,
      totalBuyers,
      totalOrders,
      totalQuantityKg: agg.totalQuantity,
      totalStates: agg.uniqueStates.length,
      totalCategories: agg.uniqueCategories.length,
      avgPrice: Math.round(agg.avgPrice || 0),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch stats" });
  }
};
