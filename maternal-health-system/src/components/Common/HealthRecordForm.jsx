import { useState } from "react";
import { toast } from "react-toastify";
import axios from "../../services/axios";
import { Loader2 } from "lucide-react";

const steps = [
  "Basic Info",
  "Medical History",
  "Investigations",
  "Ultrasound & Screening",
];

const requiredFields = [
  "blood_group",
  "genotype",
  "height_cm",
  "gravidity",
  "parity",
  "lmp",
  "haemoglobin_booking",
];

const HealthRecordForm = ({
  customId,
  existingRecord,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(existingRecord || {});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }
    setLoading(true);
    try {
      const url = `/provider/mothers/${customId}/health/`;
      const method = existingRecord ? "put" : "post";
      const res = await axios[method](url, formData);
      onSuccess(res.data);
    } catch (err) {
      toast.error("Failed to save health record.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const renderError = (field) =>
    errors[field] && (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    );

  return (
    <div className="bg-white shadow-lg p-4 sm:p-6 relative">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={`h-1 rounded-full ${
                i <= step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
            <p
              className={`mt-2 text-xs sm:text-sm text-center ${
                i === step ? "text-blue-600 font-medium" : "text-gray-400"
              }`}
            >
              {s}
            </p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {step === 0 && (
          <>
            <div>
              <input
                name="blood_group"
                placeholder="Blood Group *"
                value={formData.blood_group || ""}
                onChange={handleChange}
                className={`mt-1 w-full border ${
                  errors.blood_group ? "border-red-500" : "border-gray-200"
                } rounded-md px-4 py-3 shadow-md focus:outline-none`}
              />
              {renderError("blood_group")}
            </div>

            <div>
              <input
                name="genotype"
                placeholder="Genotype *"
                value={formData.genotype || ""}
                onChange={handleChange}
                className={`mt-1 w-full border ${
                  errors.genotype ? "border-red-500" : "border-gray-200"
                } rounded-md px-4 py-3 shadow-md focus:outline-none`}
              />
              {renderError("genotype")}
            </div>

            <div>
              <input
                type="number"
                name="height_cm"
                placeholder="Height (cm) *"
                value={formData.height_cm || ""}
                onChange={handleChange}
                className={`mt-1 w-full border ${
                  errors.height_cm ? "border-red-500" : "border-gray-200"
                } rounded-md px-4 py-3 shadow-md focus:outline-none`}
              />
              {renderError("height_cm")}
            </div>

            <div>
              <input
                type="number"
                name="gravidity"
                placeholder="Gravidity *"
                value={formData.gravidity || ""}
                onChange={handleChange}
                className={`mt-1 w-full border ${
                  errors.gravidity ? "border-red-500" : "border-gray-200"
                } rounded-md px-4 py-3 shadow-md focus:outline-none`}
              />
              {renderError("gravidity")}
            </div>

            <div>
              <input
                type="number"
                name="parity"
                placeholder="Parity *"
                value={formData.parity || ""}
                onChange={handleChange}
                className={`mt-1 w-full border ${
                  errors.parity ? "border-red-500" : "border-gray-200"
                } rounded-md px-4 py-3 shadow-md focus:outline-none`}
              />
              {renderError("parity")}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Menstrual Period (LMP) * and Estimated Due Date (EDD)
              </label>
              <div className="md:flex gap-4">
                <input
                  type="date"
                  name="lmp"
                  value={formData.lmp || ""}
                  onChange={handleChange}
                  className={`mt-1 w-full border ${
                    errors.lmp ? "border-red-500" : "border-gray-200"
                  } rounded-md px-4 py-3 shadow-md focus:outline-none`}
                />
                {renderError("lmp")}
                <input
                  type="date"
                  name="edd"
                  value={formData.edd || ""}
                  onChange={handleChange}
                  className="mt-3 sm:mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <textarea
              name="allergies"
              placeholder="Allergies"
              value={formData.allergies || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <textarea
              name="chronic_conditions"
              placeholder="Chronic Conditions"
              value={formData.chronic_conditions || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <textarea
              name="medications"
              placeholder="Medications"
              value={formData.medications || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <input
              name="recent_family_planning_method"
              placeholder="Recent Family Planning Method"
              value={formData.recent_family_planning_method || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <textarea
              name="previous_illness"
              placeholder="Previous Illness"
              value={formData.previous_illness || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <textarea
              name="previous_surgery"
              placeholder="Previous Surgery"
              value={formData.previous_surgery || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <textarea
              name="family_history"
              placeholder="Family History (Hypertension, Diabetes mellitus, Asthma, etc)"
              value={formData.family_history || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
            <input
              name="infertility_status"
              placeholder="Infertility Status (Treated/Untreated)"
              value={formData.infertility_status || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none sm:col-span-2"
            />
          </>
        )}

        {step === 2 && (
          <>
            <input
              name="blood_group_father"
              placeholder="Father’s Blood Group"
              value={formData.blood_group_father || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="rhesus_factor_mother"
              placeholder="Mother’s Rhesus Factor"
              value={formData.rhesus_factor_mother || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="rhesus_factor_father"
              placeholder="Father’s Rhesus Factor"
              value={formData.rhesus_factor_father || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="hepatitis_b_status"
              placeholder="Hepatitis B Status"
              value={formData.hepatitis_b_status || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="vdrl_status"
              placeholder="VDRL Status"
              value={formData.vdrl_status || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="rv_status"
              placeholder="RV Status"
              value={formData.rv_status || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <div>
              <input
                type="number"
                name="haemoglobin_booking"
                placeholder="Haemoglobin (Booking) *"
                value={formData.haemoglobin_booking || ""}
                onChange={handleChange}
                className={`mt-1 w-full border ${
                  errors.haemoglobin_booking
                    ? "border-red-500"
                    : "border-gray-200"
                } rounded-md px-4 py-3 shadow-md focus:outline-none`}
              />
              {renderError("haemoglobin_booking")}
            </div>
            <div>
              <input
                type="number"
                name="haemoglobin_28w"
                placeholder="Haemoglobin (28 Weeks)"
                value={formData.haemoglobin_28w || ""}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
              />
            </div>
            <input
              type="number"
              name="haemoglobin_36w"
              placeholder="Haemoglobin (36 Weeks)"
              value={formData.haemoglobin_36w || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="date"
              name="ultrasound1_date"
              value={formData.ultrasound1_date || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="ultrasound1_result"
              placeholder="Ultrasound 1 Result"
              value={formData.ultrasound1_result || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              type="date"
              name="ultrasound2_date"
              value={formData.ultrasound2_date || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <input
              name="ultrasound2_result"
              placeholder="Ultrasound 2 Result"
              value={formData.ultrasound2_result || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />

            <input
              type="date"
              name="pap_smear_date"
              value={formData.pap_smear_date || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none"
            />
            <textarea
              name="pap_smear_comments"
              placeholder="Pap Smear Comments"
              value={formData.pap_smear_comments || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-3 shadow-md focus:outline-none "
            />
          </>
        )}
      </div>

      {/* Navigation Buttons - fixed at bottom on mobile */}
      <div className="flex justify-between items-center mt-6 sticky bottom-0 bg-white py-3 border-t">
        <button
          disabled={step === 0}
          onClick={prevStep}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            Save
          </button>
        )}
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="mt-4 text-sm text-gray-500 hover:underline block mx-auto cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
};

export default HealthRecordForm;
