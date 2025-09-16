import { useEffect, useState } from "react";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { Loader2, Edit, Trash2, Plus } from "lucide-react";

const ExaminationList = ({ customId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    visit_date: "",
    gestational_age_weeks: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    weight_kg: "",
    temperature_c: "",
    pulse_rate: "",
    respiratory_rate: "",
    fundal_height_cm: "",
    fetal_heart_rate: "",
    urine_protein: "",
    urine_glucose: "",
    notes: "",
    next_appointment: "",
    oedema: "",
    presentation: "",
    lie: "",
    problem_list: "",
    delivery_plan: "",
    admission_instructions: "",
  });

  // Fetch visits
  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/provider/mothers/${customId}/visits/`);
      const data = res.data;
      setVisits(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Error fetching visits:", err);
      toast.error("Failed to load examination records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customId) fetchVisits();
  }, [customId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/provider/mothers/${customId}/visits/${editingId}/`
        : `/provider/mothers/${customId}/visits/`;
      const method = editingId ? "put" : "post";

      await axios[method](url, formData);
      toast.success(
        `Examination ${editingId ? "updated" : "added"} successfully`
      );
      setModalOpen(false);
      fetchVisits();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`/provider/mothers/${customId}/visits/${id}/`);
      toast.success("Examination deleted");
      fetchVisits();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openModal = (visit = null) => {
    if (visit) {
      setEditingId(visit.id);
      setFormData({ ...visit });
    } else {
      setEditingId(null);
      setFormData({
        visit_date: "",
        gestational_age_weeks: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        weight_kg: "",
        temperature_c: "",
        pulse_rate: "",
        respiratory_rate: "",
        fundal_height_cm: "",
        fetal_heart_rate: "",
        urine_protein: "",
        urine_glucose: "",
        notes: "",
        next_appointment: "",
        oedema: "",
        presentation: "",
        lie: "",
        problem_list: "",
        delivery_plan: "",
        admission_instructions: "",
      });
    }
    setModalOpen(true);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Examination Records</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Visit
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : visits.length === 0 ? (
        <p className="text-gray-500 text-center">
          No examination records found.
        </p>
      ) : (
        <div className="grid gap-4">
          {visits.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium text-sm">
                  Visit Date: {v.visit_date?.split("T")[0]}
                </p>
                <p className="text-xs text-gray-500">
                  By: {v.provider_name || "-"}
                </p>
              </div>

              {/* Content */}
              <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">
                    Gestational Age (weeks)
                  </p>
                  <p className="font-medium">
                    {v.gestational_age_weeks || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Weight (kg)</p>
                  <p className="font-medium">{v.weight_kg || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Blood Pressure</p>
                  <p className="font-medium">
                    {v.blood_pressure_systolic}/{v.blood_pressure_diastolic}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Temperature (°C)</p>
                  <p className="font-medium">{v.temperature_c || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Pulse</p>
                  <p className="font-medium">{v.pulse_rate || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Respiratory Rate</p>
                  <p className="font-medium">{v.respiratory_rate || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Fundal Height (cm)</p>
                  <p className="font-medium">{v.fundal_height_cm || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Fetal Heart Rate</p>
                  <p className="font-medium">{v.fetal_heart_rate || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Oedema</p>
                  <p className="font-medium">{v.oedema || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Presentation</p>
                  <p className="font-medium">{v.presentation || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Lie</p>
                  <p className="font-medium">{v.lie || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Urine Protein</p>
                  <p className="font-medium">{v.urine_protein || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Urine Glucose</p>
                  <p className="font-medium">{v.urine_glucose || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg ">
                  <p className="text-xs text-gray-500">Next Appointment</p>
                  <p className="font-medium">{v.next_appointment || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500">Problem List</p>
                  <p className="font-medium">{v.problem_list || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500">Delivery Plan</p>
                  <p className="font-medium">{v.delivery_plan || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500">
                    Admission Instructions
                  </p>
                  <p className="font-medium">
                    {v.admission_instructions || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="font-medium">{v.notes || "-"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => openModal(v)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 backdrop-contrast-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Examination" : "Add Examination"}
            </h3>

            <div className="grid gap-3">
              <label>Visit Date</label>
              <input
                type="datetime-local"
                name="visit_date"
                value={formData.visit_date}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="gestational_age_weeks"
                placeholder="Gestational Age (weeks)"
                value={formData.gestational_age_weeks}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="blood_pressure_systolic"
                placeholder="Systolic BP"
                value={formData.blood_pressure_systolic}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="blood_pressure_diastolic"
                placeholder="Diastolic BP"
                value={formData.blood_pressure_diastolic}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="weight_kg"
                placeholder="Weight (kg)"
                value={formData.weight_kg}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="temperature_c"
                placeholder="Temperature (°C)"
                value={formData.temperature_c}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="pulse_rate"
                placeholder="Pulse Rate"
                value={formData.pulse_rate}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="respiratory_rate"
                placeholder="Respiratory Rate"
                value={formData.respiratory_rate}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="fundal_height_cm"
                placeholder="Fundal Height (cm)"
                value={formData.fundal_height_cm}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="number"
                name="fetal_heart_rate"
                placeholder="Fetal Heart Rate"
                value={formData.fetal_heart_rate}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="urine_protein"
                placeholder="Urine Protein (-, +, ++)"
                value={formData.urine_protein}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="urine_glucose"
                placeholder="Urine Glucose"
                value={formData.urine_glucose}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="oedema"
                placeholder="Oedema (None, Mild, Moderate, Severe)"
                value={formData.oedema}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="presentation"
                placeholder="Presentation (Head, Hand, Buttocks)"
                value={formData.presentation}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="lie"
                placeholder="Lie (longitudinally, transversely, obliquely)"
                value={formData.lie}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <textarea
                name="problem_list"
                placeholder="Problem List"
                value={formData.problem_list}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <textarea
                name="delivery_plan"
                placeholder="Delivery Plan"
                value={formData.delivery_plan}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <textarea
                name="admission_instructions"
                placeholder="Admission Instructions"
                value={formData.admission_instructions}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <label>Next Appointment Date</label>
              <input
                type="date"
                name="next_appointment"
                value={formData.next_appointment}
                onChange={handleChange}
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationList;
