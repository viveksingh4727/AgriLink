import express from "express";
import { createMoodLog, getMoodHistory } from "../controllers/moodController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("farmer"), createMoodLog);
router.get("/history", protect, authorize("farmer"), getMoodHistory);

export default router;
