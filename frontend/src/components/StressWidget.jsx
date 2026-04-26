import { useState } from "react";
import api from "../api/axios";
import { useToast } from "./Toast";

const moodOptions = [
  { value: "Very Good", emoji: "😄", color: "border-brand bg-brand-50 text-brand-700" },
  { value: "Good", emoji: "🙂", color: "border-blue-300 bg-blue-50 text-blue-700" },
  { value: "Neutral", emoji: "😐", color: "border-amber-300 bg-amber-50 text-amber-700" },
  { value: "Stressed", emoji: "😟", color: "border-orange-300 bg-orange-50 text-orange-700" },
  { value: "Very Stressed", emoji: "😰", color: "border-rose-300 bg-rose-50 text-rose-700" },
];

const StressWidget = ({ onMoodLogged }) => {
  const { showToast } = useToast();
  const [mood, setMood] = useState("Neutral");
  const [note, setNote] = useState("");
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const [{ data: aiData }, { data: moodData }] = await Promise.all([
        api.post("/ai/stress-support", { mood, note }),
        api.post("/mood", { mood, note }),
      ]);

      setResponse(aiData.response);
      showToast("Mood check-in saved");
      setNote("");
      onMoodLogged?.(moodData);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to submit mood", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-shell">
      <div className="mb-5">
        <h3 className="section-title text-lg">💚 How are you feeling?</h3>
        <p className="section-subtitle">A quick daily check-in for your wellbeing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 ${
                mood === option.value
                  ? `${option.color} scale-105 shadow-sm`
                  : "border-surface-200 bg-white text-surface-500 hover:bg-surface-50"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{option.value}</span>
            </button>
          ))}
        </div>

        <textarea
          rows="3"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything on your mind? (optional)"
          className="input-field !rounded-xl"
        />

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <span className="spinner" /> : "Submit Check-In"}
        </button>
      </form>

      {response && (
        <div className="mt-5 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-brand-100/50 p-4 text-sm leading-relaxed text-surface-700 animate-slide-up">
          <p className="font-semibold text-brand-700 mb-1">💚 AI Support</p>
          {response}
        </div>
      )}
    </div>
  );
};

export default StressWidget;
