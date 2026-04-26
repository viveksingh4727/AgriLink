import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const scoreMap = {
  "Very Good": 5,
  Good: 4,
  Neutral: 3,
  Stressed: 2,
  "Very Stressed": 1,
};

const MoodChart = ({ moodLogs }) => {
  const bucket = {};

  Array.from({ length: 7 }).forEach((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    bucket[date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })] = 0;
  });

  moodLogs.forEach((log) => {
    const key = new Date(log.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    bucket[key] = scoreMap[log.mood] || 0;
  });

  const data = {
    labels: Object.keys(bucket),
    datasets: [
      {
        label: "Mood Level",
        data: Object.values(bucket),
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "#059669";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(5, 150, 105, 0.6)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 1)");
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { family: "Inter" },
        bodyFont: { family: "Inter" },
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          font: { family: "Inter", size: 11 },
          color: "#94a3b8",
        },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: {
        ticks: { font: { family: "Inter", size: 11 }, color: "#94a3b8" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="card-shell">
      <div className="mb-4">
        <h3 className="section-title text-lg">📊 Mood History</h3>
        <p className="section-subtitle">Last 7 days based on your daily check-ins.</p>
      </div>
      <div className="h-[220px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MoodChart;
