import express from "express";
import { getMarketplaceStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", getMarketplaceStats);

export default router;
