import express from "express";
import { chatAssistant, getStressSupport, suggestPrice } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Price suggestion & stress support — farmers only (require auth)
router.post("/price-suggestion", protect, suggestPrice);
router.post("/stress-support", protect, getStressSupport);

// General chat — open to everyone (guests can ask questions too)
router.post("/chat", chatAssistant);

export default router;
