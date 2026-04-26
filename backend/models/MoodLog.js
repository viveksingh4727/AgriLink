import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["Very Good", "Good", "Neutral", "Stressed", "Very Stressed"],
      required: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MoodLog", moodLogSchema);
