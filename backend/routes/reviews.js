import express from "express";
import { createReview, getFarmerReviews, getListingReviews } from "../controllers/reviewController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), createReview);
router.get("/farmer/:farmerId", getFarmerReviews);
router.get("/listing/:listingId", getListingReviews);

export default router;
