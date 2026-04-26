import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { listingId, quantity } = req.body;
    const numericQuantity = Number(quantity);

    const listing = await Listing.findById(listingId).populate("farmerId", "name");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (numericQuantity <= 0 || numericQuantity > listing.quantity) {
      return res.status(400).json({ message: "Invalid order quantity" });
    }

    const order = await Order.create({
      buyerId: req.user._id,
      listingId: listing._id,
      farmerId: listing.farmerId._id,
      quantity: numericQuantity,
      totalPrice: numericQuantity * listing.price,
      status: "pending",
    });

    await Notification.create({
      userId: listing.farmerId._id,
      message: `${req.user.name} placed an order for ${numericQuantity} kg of ${listing.cropName}.`,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("buyerId", "name")
      .populate("farmerId", "name phone")
      .populate("listingId", "cropName price");

    return res.status(201).json(populatedOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to place order" });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate("listingId", "cropName images price")
      .populate("farmerId", "name phone location")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch orders" });
  }
};

export const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.user._id })
      .populate("listingId", "cropName images price")
      .populate("buyerId", "name phone location")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch farmer orders" });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmerId: req.user._id })
      .populate("buyerId", "name")
      .populate("listingId", "cropName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "confirmed";
    await order.save();

    await Notification.create({
      userId: order.buyerId._id,
      message: `Your order for ${order.listingId.cropName} has been confirmed by the farmer.`,
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to confirm order" });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmerId: req.user._id })
      .populate("buyerId", "name")
      .populate("listingId", "cropName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed orders can be marked as delivered" });
    }

    order.status = "delivered";
    await order.save();

    await Notification.create({
      userId: order.buyerId._id,
      message: `Your order for ${order.listingId.cropName} has been delivered!`,
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to mark as delivered" });
  }
};
