import MoodLog from "../models/MoodLog.js";

export const createMoodLog = async (req, res) => {
  try {
    const { mood, note } = req.body;

    const moodLog = await MoodLog.create({
      farmerId: req.user._id,
      mood,
      note: note || "",
    });

    return res.status(201).json(moodLog);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to save mood" });
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const moods = await MoodLog.find({
      farmerId: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: 1 });

    return res.json(moods);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch mood history" });
  }
};
