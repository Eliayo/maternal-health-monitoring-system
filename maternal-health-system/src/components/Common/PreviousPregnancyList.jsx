import { useEffect, useState } from "react";
import axios from "../../services/axios";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const emptyForm = {
  place_of_birth: "",
  gestation_at_delivery: "",
  mode_of_delivery: "",
  labour_duration: "",
  outcome: "",
  birth_weight: "",
  complications: "",
};

const PreviousPregnancyList = ({ customId }) => {
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch pregnancies
  const fetchPregnancies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/provider/mothers/${customId}/pregnancies/`);
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setPregnancies(data);
    } catch (err) {
      toast.error("Failed to fetch pregnancies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPregnancies();
  }, [customId]);

  // Open modal
  const openModal = (pregnancy = null) => {
    if (pregnancy) {
      setEditingId(pregnancy.id);
      setFormData(pregnancy);
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setModalOpen(true);
  };

  // Save pregnancy (create/update)
  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/provider/mothers/${customId}/pregnancies/${editingId}/`
        : `/provider/mothers/${customId}/pregnancies/`;

      const method = editingId ? "put" : "post";

      // ✅ Filter payload to only what the backend expects
      const payload = {
        place_of_birth: formData.place_of_birth || "",
        gestation_at_delivery: formData.gestation_at_delivery || "",
        mode_of_delivery: formData.mode_of_delivery || "",
        labour_duration: formData.labour_duration || "",
        outcome: formData.outcome || "",
        birth_weight: formData.birth_weight
          ? parseFloat(formData.birth_weight)
          : null,
        complications: formData.complications || "",
      };

      await axios[method](url, payload);
      toast.success(
        `Pregnancy ${editingId ? "updated" : "added"} successfully`
      );
      setModalOpen(false);
      fetchPregnancies();
    } catch (err) {
      toast.error("Failed to save pregnancy");
    } finally {
      setSaving(false);
    }
  };

  // Soft delete pregnancy
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`/provider/mothers/${customId}/pregnancies/${id}/`);
      toast.success("Pregnancy deleted");
      fetchPregnancies();
    } catch {
      toast.error("Failed to delete pregnancy");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Previous Pregnancies
        </h3>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Pregnancy List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : pregnancies.length === 0 ? (
        <p className="text-gray-500 text-center">
          No previous pregnancies recorded.
        </p>
      ) : (
        <div className="grid gap-4">
          {pregnancies.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-4"
            >
              {/* Content */}
              <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Place of Birth</p>
                  <p className="font-medium">{p.place_of_birth || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Gestation</p>
                  <p className="font-medium">
                    {p.gestation_at_delivery || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Mode of Delivery</p>
                  <p className="font-medium">{p.mode_of_delivery || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Outcome</p>
                  <p className="font-medium">{p.outcome || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Birth Weight</p>
                  <p className="font-medium">{p.birth_weight || "-"}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Complications</p>
                  <p className="font-medium">{p.complications || "-"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => openModal(p)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
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
        <div className="fixed inset-0 backdrop-contrast-50 flex items-center justify-center z-50 px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-600">
              {editingId ? "Edit Pregnancy" : "Add Pregnancy"}
            </h4>
            <div className="grid gap-3">
              <input
                type="text"
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, place_of_birth: e.target.value })
                }
                placeholder="Place of Birth"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="gestation_at_delivery"
                value={formData.gestation_at_delivery}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gestation_at_delivery: e.target.value,
                  })
                }
                placeholder="Gestation at Delivery"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="mode_of_delivery"
                value={formData.mode_of_delivery}
                onChange={(e) =>
                  setFormData({ ...formData, mode_of_delivery: e.target.value })
                }
                placeholder="Mode of Delivery"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="labour_duration"
                value={formData.labour_duration}
                onChange={(e) =>
                  setFormData({ ...formData, labour_duration: e.target.value })
                }
                placeholder="Labour Duration"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="outcome"
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                placeholder="Outcome"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <input
                type="text"
                name="birth_weight"
                value={formData.birth_weight}
                onChange={(e) =>
                  setFormData({ ...formData, birth_weight: e.target.value })
                }
                placeholder="Birth Weight"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
              <textarea
                name="complications"
                value={formData.complications}
                onChange={(e) =>
                  setFormData({ ...formData, complications: e.target.value })
                }
                placeholder="Complications"
                className="border border-gray-200 shadow-md rounded-lg px-3 py-2 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 cursor-pointer"
              >
                {saving && <Loader2 className="animate-spin w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousPregnancyList;
