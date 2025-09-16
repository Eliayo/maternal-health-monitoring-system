import React from "react";
import axios from "axios";

const ExportButtons = ({ customId }) => {
  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `/provider/mothers/${customId}/export/?format=${format}`,
        {
          responseType: "blob", // Important for binary files
        }
      );

      // Use backend content-type for blob
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      // Build filename
      const filename = `${customId}_health_record.${format}`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export record");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport("pdf")}
        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Export PDF
      </button>
      <button
        onClick={() => handleExport("xlsx")}
        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Export Excel
      </button>
      <button
        onClick={() => handleExport("csv")}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Export CSV
      </button>
    </div>
  );
};

export default ExportButtons;
