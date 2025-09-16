import { useEffect, useState } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { toast } from "react-toastify";
import { Loader2, Edit } from "lucide-react";
import HealthRecordForm from "../../components/Common/HealthRecordForm";
import PreviousPregnancyList from "../../components/Common/PreviousPregnancyList";
import ExaminationList from "../../components/Common/ExaminationList";
// import ExportButtons from "../../components/Common/ExportButtons";
import { useParams } from "react-router-dom";

const ProviderHealthRecord = () => {
  const { customId } = useParams();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch health record
  const fetchRecord = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/provider/mothers/${customId}/health/`);
      setRecord(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setRecord(null);
      } else {
        toast.error("Failed to load health record.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [customId]);

  // Outside click handler for sidebar
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarVisible &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".menu-btn")
      ) {
        setIsSidebarVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSidebarVisible]);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <Loader2 className="animate-spin w-7 h-7 text-gray-500" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="provider"
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Topbar
          onMenuClick={(width) =>
            width < 1024
              ? setIsSidebarVisible((prev) => !prev)
              : setIsSidebarCollapsed((prev) => !prev)
          }
          isCollapsed={isSidebarCollapsed}
        />
        <div className="min-h-screen bg-gray-100  sm:p-6 font-pop text-sm">
          <div className="space-y-6 p-4">
            {/* Show form if no record exists or editing */}
            {!record || showForm ? (
              <HealthRecordForm
                customId={customId}
                existingRecord={record}
                onSuccess={(updated) => {
                  setRecord(updated);
                  setShowForm(false);
                  toast.success(
                    record
                      ? "Health record updated successfully."
                      : "Health record created successfully."
                  );
                }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <>
                {/* Health Record Card */}
                <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                      Health Record – {record.mother_info?.full_name}
                    </h2>
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 w-full sm:w-auto cursor-pointer"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    {/* <ExportButtons customId={customId} /> */}
                  </div>

                  {/* Sections */}
                  <div className="space-y-6 text-sm">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-gray-700 font-semibold mb-3">
                        Basic Info
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          ["Blood Group", record.blood_group],
                          ["Genotype", record.genotype],
                          ["Height", record.height_cm],
                          ["Gravidity", record.gravidity],
                          ["Parity", record.parity],
                          ["LMP", record.lmp],
                          ["EDD", record.edd],
                        ].map(([label, value], idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                          >
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-gray-800 font-medium">
                              {value || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Medical History */}
                    <div>
                      <h3 className="text-gray-700 font-semibold mb-3">
                        Medical History
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          ["Allergies", record.allergies],
                          ["Chronic Conditions", record.chronic_conditions],
                          ["Medications", record.medications],
                          [
                            "Family Planning Method",
                            record.recent_family_planning_method,
                          ],
                          ["Previous Illness", record.previous_illness],
                          ["Previous Surgery", record.previous_surgery],
                          ["Family History", record.family_history],
                          ["Infertility Status", record.infertility_status],
                        ].map(([label, value], idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                          >
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-gray-800 font-medium">
                              {value || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Investigations */}
                    <div>
                      <h3 className="text-gray-700 font-semibold mb-3">
                        Investigations
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          ["Father’s Blood Group", record.blood_group_father],
                          [
                            "Rhesus Factor (Mother)",
                            record.rhesus_factor_mother,
                          ],
                          [
                            "Rhesus Factor (Father)",
                            record.rhesus_factor_father,
                          ],
                          ["Hepatitis B Status", record.hepatitis_b_status],
                          ["VDRL Status", record.vdrl_status],
                          ["RV Status", record.rv_status],
                          ["Haemoglobin (Booking)", record.haemoglobin_booking],
                          ["Haemoglobin (28w)", record.haemoglobin_28w],
                          ["Haemoglobin (36w)", record.haemoglobin_36w],
                        ].map(([label, value], idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                          >
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-gray-800 font-medium">
                              {value || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ultrasound & Screening */}
                    <div>
                      <h3 className="text-gray-700 font-semibold mb-3">
                        Ultrasound & Screening
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          ["Ultrasound (1st Date)", record.ultrasound1_date],
                          [
                            "Ultrasound (1st Result)",
                            record.ultrasound1_result,
                          ],
                          ["Ultrasound (2nd Date)", record.ultrasound2_date],
                          [
                            "Ultrasound (2nd Result)",
                            record.ultrasound2_result,
                          ],
                          ["Pap Smear (Date)", record.pap_smear_date],
                          ["Pap Smear (Comments)", record.pap_smear_comments],
                        ].map(([label, value], idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                          >
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-gray-800 font-medium">
                              {value || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous Pregnancies */}
                <PreviousPregnancyList customId={customId} />

                {/* Examination */}
                <ExaminationList customId={customId} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderHealthRecord;
