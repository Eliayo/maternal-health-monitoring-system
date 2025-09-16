import React from "react";

const patients = [
  {
    id: "SPK-9ABC",
    name: "Jhon Doe",
    gender: "Male",
    contact: "123-456-7890",
    lastAppointment: "2024-10-20",
    nextAppointment: "2024-03-15",
    medicalHistory: "Hypertension",
  },
  {
    id: "SPK-3SFW",
    name: "Jane Smith",
    gender: "Female",
    contact: "987-654-3210",
    lastAppointment: "2024-09-15",
    nextAppointment: "2024-02-28",
    medicalHistory: "Diabetes",
  },
  {
    id: "SPK-6SKF",
    name: "Robert Jhonson",
    gender: "Male",
    contact: "456-789-0123",
    lastAppointment: "2024-11-05",
    nextAppointment: "2024-04-10",
    medicalHistory: "Asthma",
  },
  {
    id: "SPK-3ESD",
    name: "Emiley Davis",
    gender: "Female",
    contact: "789-012-3456",
    lastAppointment: "2024-08-12",
    nextAppointment: "2024-01-20",
    medicalHistory: "Allergies",
  },
  {
    id: "SPK-3KSE",
    name: "William Martinez",
    gender: "Male",
    contact: "234-567-8901",
    lastAppointment: "2024-12-08",
    nextAppointment: "2024-05-05",
    medicalHistory: "General",
  },
  {
    id: "SPK-4DFS",
    name: "Sarah Wilson",
    gender: "Female",
    contact: "567-890-1234",
    lastAppointment: "2024-07-25",
    nextAppointment: "2024-03-01",
    medicalHistory: "High Cholesterol",
  },
];

const getBadgeColor = (condition) => {
  const map = {
    Hypertension: "bg-indigo-100 text-indigo-600",
    Diabetes: "bg-pink-100 text-pink-500",
    Asthma: "bg-green-100 text-green-600",
    Allergies: "bg-orange-100 text-orange-600",
    General: "bg-blue-100 text-blue-600",
    "High Cholesterol": "bg-yellow-100 text-yellow-600",
  };
  return map[condition] || "bg-gray-100 text-gray-700";
};

export default function PatientTable() {
  return (
    <div>
      <div className="py-4 font-pop">
        <div className="flex justify-between items-center ">
          <h2 className="text-xl font-semibold mb-4">Patients List</h2>
          <h2 className="text-sm cursor-pointer text-blue-500 mb-4">
            View All →
          </h2>
        </div>

        <div className="overflow-x-auto bg-white rounded-sm shadow-sm">
          <table className="min-w-[900px] w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Contact Number</th>
                <th className="px-4 py-3">Last Appointment</th>
                <th className="px-4 py-3">Medical History</th>
                <th className="px-4 py-3">Next Appointment</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="accent-purple-600" />
                  </td>
                  <td className="px-4 py-3">{patient.id}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="text-xl"></span>
                    <span>{patient.name}</span>
                  </td>
                  <td className="px-4 py-3">{patient.gender}</td>
                  <td className="px-4 py-3">{patient.contact}</td>
                  <td className="px-4 py-3">{patient.lastAppointment}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-sm font-medium ${getBadgeColor(
                        patient.medicalHistory
                      )}`}
                    >
                      {patient.medicalHistory}
                    </span>
                  </td>
                  <td className="px-4 py-3">{patient.nextAppointment}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200">
                      👁️
                    </button>
                    <button className="p-1.5 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200">
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
