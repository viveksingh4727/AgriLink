import express from "express";
import {
  confirmOrder,
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  markDelivered,
} from "../controllers/orderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), createOrder);
router.get("/buyer", protect, authorize("buyer"), getBuyerOrders);
router.get("/farmer", protect, authorize("farmer"), getFarmerOrders);
router.patch("/:id/confirm", protect, authorize("farmer"), confirmOrder);
router.patch("/:id/deliver", protect, authorize("farmer"), markDelivered);

export default router;
