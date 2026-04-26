import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";

export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId)
      .populate("listingId", "cropName")
      .populate("farmerId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only review your own orders" });
    }

    if (order.status !== "confirmed" && order.status !== "delivered") {
      return res.status(400).json({ message: "You can only review confirmed or delivered orders" });
    }

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }

    const review = await Review.create({
      buyerId: req.user._id,
      farmerId: order.farmerId._id,
      listingId: order.listingId._id,
      orderId: order._id,
      rating: Number(rating),
      comment: comment || "",
    });

    await Notification.create({
      userId: order.farmerId._id,
      message: `${req.user.name} left a ${rating}-star review on ${order.listingId.cropName}.`,
    });

    const populated = await Review.findById(review._id)
      .populate("buyerId", "name")
      .populate("listingId", "cropName");

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }
    return res.status(500).json({ message: error.message || "Unable to create review" });
  }
};

export const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmerId: req.params.farmerId })
      .populate("buyerId", "name")
      .populate("listingId", "cropName")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch reviews" });
  }
};

export const getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .populate("buyerId", "name")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch reviews" });
  }
};
