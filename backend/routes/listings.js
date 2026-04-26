import express from "express";
import {
  createListing,
  deleteListing,
  getFarmerListings,
  getListingById,
  getMarketplaceListings,
  updateListing,
} from "../controllers/listingController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getMarketplaceListings);
router.get("/mine", protect, authorize("farmer"), getFarmerListings);
router.get("/:id", getListingById);
router.post("/", protect, authorize("farmer"), upload.array("images", 3), createListing);
router.put("/:id", protect, authorize("farmer"), upload.array("images", 3), updateListing);
router.delete("/:id", protect, authorize("farmer"), deleteListing);

export default router;
