import React, { useState, useEffect } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";

const PatientRecords = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState("info");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get("/mother/health-record/");
        setRecord(res.data);
      } catch (err) {
        setError("Unable to load health records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

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

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  //     </div>
  //   );
  // }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!record) {
    return <p className="text-center text-gray-600">No health record found.</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="mother"
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Topbar
          onMenuClick={(width) => {
            if (width < 1024) {
              setIsSidebarVisible((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Content */}
        <div className="p-4 max-w-4xl mx-auto space-y-4 font-pop">
          {/* Section: Basic Info */}
          <Section
            id="info"
            title="Basic Information"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <InfoRow label="Full Name" value={record.mother_info?.full_name} />
            <InfoRow label="Phone" value={record.mother_info?.phone_number} />
            <InfoRow label="Email" value={record.mother_info?.email} />
            <InfoRow label="Blood Group" value={record.blood_group} />
            <InfoRow label="Genotype" value={record.genotype} />
            <InfoRow label="Height (cm)" value={record.height_cm} />
            <InfoRow label="Gravidity" value={record.gravidity} />
            <InfoRow label="Parity" value={record.parity} />
            <InfoRow label="LMP" value={record.lmp} />
            <InfoRow label="EDD" value={record.edd} />
          </Section>

          {/* Section: Medical History */}
          <Section
            id="history"
            title="Medical History"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <InfoRow label="Allergies" value={record.allergies} />
            <InfoRow
              label="Chronic Conditions"
              value={record.chronic_conditions}
            />
            <InfoRow label="Medications" value={record.medications} />
            <InfoRow
              label="Family Planning"
              value={record.recent_family_planning_method}
            />
            <InfoRow label="Past Illnesses" value={record.previous_illness} />
            <InfoRow label="Surgeries" value={record.previous_surgery} />
            <InfoRow label="Family History" value={record.family_history} />
            <InfoRow
              label="Infertility Status"
              value={record.infertility_status}
            />
          </Section>

          {/* Section: Investigations */}
          <Section
            id="investigations"
            title="Investigations"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <InfoRow
              label="Blood Group (Father)"
              value={record.blood_group_father}
            />
            <InfoRow
              label="Rhesus Factor (Mother)"
              value={record.rhesus_factor_mother}
            />
            <InfoRow
              label="Rhesus Factor (Father)"
              value={record.rhesus_factor_father}
            />
            <InfoRow
              label="Hepatitis B Status"
              value={record.hepatitis_b_status}
            />
            <InfoRow label="VDRL Status" value={record.vdrl_status} />
            <InfoRow label="RV Status" value={record.rv_status} />
          </Section>

          {/* Section: Haemoglobin */}
          <Section
            id="haemoglobin"
            title="Haemoglobin Levels"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <InfoRow label="Booking" value={record.haemoglobin_booking} />
            <InfoRow label="28 Weeks" value={record.haemoglobin_28w} />
            <InfoRow label="36 Weeks" value={record.haemoglobin_36w} />
          </Section>

          {/* Section: Ultrasound & Pap Smear */}
          <Section
            id="ultrasounds"
            title="Ultrasounds & Pap Smear"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <InfoRow
              label="Ultrasound 1 Date"
              value={record.ultrasound1_date}
            />
            <InfoRow
              label="Ultrasound 1 Result"
              value={record.ultrasound1_result}
            />
            <InfoRow
              label="Ultrasound 2 Date"
              value={record.ultrasound2_date}
            />
            <InfoRow
              label="Ultrasound 2 Result"
              value={record.ultrasound2_result}
            />
            <InfoRow label="Pap Smear Date" value={record.pap_smear_date} />
            <InfoRow
              label="Pap Smear Comments"
              value={record.pap_smear_comments}
            />
          </Section>

          {/* Section: Previous Pregnancies */}
          <Section
            id="pregnancies"
            title="Previous Pregnancies"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            {record.previous_pregnancies?.length > 0 ? (
              record.previous_pregnancies.map((preg, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-3 shadow-sm space-y-1"
                >
                  <InfoRow label="Place of Birth" value={preg.place_of_birth} />
                  <InfoRow
                    label="Gestation at Delivery"
                    value={preg.gestation_at_delivery}
                  />
                  <InfoRow
                    label="Mode of Delivery"
                    value={preg.mode_of_delivery}
                  />
                  <InfoRow
                    label="Labour Duration"
                    value={preg.labour_duration}
                  />
                  <InfoRow label="Outcome" value={preg.outcome} />
                  <InfoRow label="Birth Weight" value={preg.birth_weight} />
                  <InfoRow label="Complications" value={preg.complications} />
                </div>
              ))
            ) : (
              <p className="text-gray-600">No previous pregnancies recorded.</p>
            )}
          </Section>

          {/* Section: Examinations */}
          <Section
            id="examinations"
            title="Examinations"
            openSection={openSection}
            toggleSection={toggleSection}
          >
            {record.examinations?.length > 0 ? (
              record.examinations.map((exam, i) => (
                <ExamCard key={i} exam={exam} />
              ))
            ) : (
              <p className="text-gray-600">No examinations found.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

/* Collapsible Exam Card */
const ExamCard = ({ exam }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm">
      {/* Summary row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-left"
      >
        <div>
          <p className="font-semibold text-sm">
            {exam.visit_date
              ? new Date(exam.visit_date).toLocaleDateString()
              : "Unknown Date"}
          </p>
          <p className="text-xs text-gray-500">
            BP: {exam.blood_pressure_systolic}/{exam.blood_pressure_diastolic}{" "}
            mmHg | Weight: {exam.weight_kg} kg | Risk:{" "}
            <span
              className={`${
                exam.risk_status === "High"
                  ? "text-red-600 font-semibold"
                  : "text-green-600 font-medium"
              }`}
            >
              {exam.risk_status || "N/A"}
            </span>
          </p>
        </div>
        <span className="text-lg">{open ? "−" : "+"}</span>
      </button>

      {/* Details */}
      {open && (
        <div className="px-4 pb-4 text-sm space-y-1">
          <InfoRow
            label="Gestational Age (weeks)"
            value={exam.gestational_age_weeks}
          />
          <InfoRow label="Temperature (°C)" value={exam.temperature_c} />
          <InfoRow label="Pulse Rate" value={exam.pulse_rate} />
          <InfoRow label="Respiratory Rate" value={exam.respiratory_rate} />
          <InfoRow label="Fundal Height (cm)" value={exam.fundal_height_cm} />
          <InfoRow label="Fetal Heart Rate" value={exam.fetal_heart_rate} />
          <InfoRow label="Urine Protein" value={exam.urine_protein} />
          <InfoRow label="Urine Glucose" value={exam.urine_glucose} />
          <InfoRow label="Oedema" value={exam.oedema} />
          <InfoRow label="Presentation" value={exam.presentation} />
          <InfoRow label="Lie" value={exam.lie} />
          <InfoRow label="Problem List" value={exam.problem_list} />
          <InfoRow label="Delivery Plan" value={exam.delivery_plan} />
          <InfoRow
            label="Admission Instructions"
            value={exam.admission_instructions}
          />
          <InfoRow label="Notes" value={exam.notes} />
          <InfoRow label="Next Appointment" value={exam.next_appointment} />
          <InfoRow label="Provider" value={exam.provider_name} />
        </div>
      )}
    </div>
  );
};

/* Reusable Collapsible Section */
const Section = ({ id, title, children, openSection, toggleSection }) => (
  <div className="bg-white shadow rounded-lg">
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex justify-between items-center p-4 text-left"
    >
      <span className="font-semibold">{title}</span>
      <span>{openSection === id ? "−" : "+"}</span>
    </button>
    {openSection === id && (
      <div className="px-4 pb-4 text-sm space-y-2">{children}</div>
    )}
  </div>
);

/* Reusable Info Row */
const InfoRow = ({ label, value }) => (
  <p>
    <span className="font-medium">{label}:</span>{" "}
    {value !== null && value !== "" ? value : "N/A"}
  </p>
);

export default PatientRecords;
