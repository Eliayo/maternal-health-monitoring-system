import React from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

const appointments = [
  {
    name: "General Checkup",
    id: "MOM-0001",
    date: "22 Jan 2024",
    status: "completed",
    icon: "🩺",
  },
  {
    name: "Follow-up appointment",
    id: "MOM-0012",
    date: "12 Feb 2024",
    status: "completed",
    icon: "📋",
  },
  {
    name: "Heart Checkup",
    id: "MOM-0036",
    date: "20 Dec 2024",
    status: "rescheduled",
    icon: "💚",
  },
  {
    name: "Blood test results review",
    id: "MOM-0010",
    date: "09 Oct 2024",
    status: "cancelled",
    icon: "🧪",
  },
  {
    name: "Vaccination",
    id: "MOM-0011",
    date: "22 Nov 2024",
    status: "completed",
    icon: "💉",
  },
  {
    name: "Scan",
    id: "MOM-0013",
    date: "22 Nov 2024",
    status: "scheduled",
    icon: "🦷",
  },
];

const statusColors = {
  completed: "bg-purple-100 text-purple-600",
  rescheduled: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500",
  scheduled: "bg-yellow-100 text-yellow-600",
};

const LatestAppointments = () => {
  return (
    <div className="bg-white p-4 md:py-10 rounded-sm shadow-sm font-pop ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Latest Appointments</h2>
        <a href="/admin/appointments" className="text-sm text-blue-500">
          View All →
        </a>
      </div>

      {/* Responsive scrollable table */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-sm text-gray-300">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th>ID</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="flex items-center gap-2 py-3">
                  <span className="text-xl">{appt.icon}</span>
                  <span className="font-medium text-gray-700">{appt.name}</span>
                </td>
                <td className="text-black">{appt.id}</td>
                <td className="text-black">{appt.date}</td>
                <td>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-sm ${
                      statusColors[appt.status] || ""
                    }`}
                  >
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                </td>
                <td className="flex gap-2 justify-center py-2">
                  <button className="bg-purple-100 hover:bg-purple-200 p-1.5 rounded-full">
                    <CheckIcon className="w-4 h-4 text-purple-600" />
                  </button>
                  <button className="bg-pink-100 hover:bg-pink-200 p-1.5 rounded-full">
                    <XMarkIcon className="w-4 h-4 text-pink-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestAppointments;
