import React, { useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register necessary Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const PatientStatChart = () => {
  const [sortBy, setSortBy] = useState("Monthly");

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "This Year",
        data: [15, 25, 18, 40, 35, 38, 30, 45, 60, 55, 40, 48],
        fill: false,
        borderColor: "#a78bfa", // Purple
        tension: 0.4,
        pointBackgroundColor: "#a78bfa",
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: "Previous Year",
        data: [12, 40, 22, 30, 45, 25, 20, 25, 30, 28, 32, 44],
        fill: false,
        borderColor: "#f472b6", // Pink
        tension: 0.4,
        pointBackgroundColor: "#f472b6",
        pointRadius: 5,
        pointHoverRadius: 7,
        borderDash: [6, 6],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Important for dynamic height
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#e5e7eb",
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
        },
        grid: {
          drawBorder: false,
          color: "#e5e7eb",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-sm shadow-sm w-full font-pop">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Patients Statistics
        </h2>
        <div className="flex items-center justify-center">
          <select
            className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>
      {/* Chart container for responsive height */}
      <div className="relative w-full h-[300px] sm:h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PatientStatChart;
