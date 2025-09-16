const UserForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleReset,
  isEditMode,
  loading,
  allowedRoles = ["provider", "mother"],
  showRoleSelect = true,
  showDepartment = true,
  showEmail = true,
  isProviderAddingMother = false,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* First Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name || ""}
          onChange={handleChange}
          required
          placeholder="e.g. John"
          className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name || ""}
          onChange={handleChange}
          required
          placeholder="e.g. Doe"
          className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
        />
      </div>

      {/* Email */}
      {showEmail && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="e.g. john.doe@example.com"
            className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
          />
        </div>
      )}

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number || ""}
          onChange={handleChange}
          maxLength={11}
          required
          placeholder="e.g. +2348123456789"
          className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
        />
      </div>

      {/* Department */}
      {showDepartment && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            required
            placeholder="e.g. Pediatrics"
            className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
          />
        </div>
      )}

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Sex</label>
        {isProviderAddingMother ? (
          <>
            <input type="hidden" name="sex" value="female" />
            <p className="mt-1 px-4 py-2 bg-gray-100 border rounded-md">
              Female
            </p>
          </>
        ) : (
          <select
            name="sex"
            value={formData.sex || ""}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        )}
      </div>

      {/* Role */}
      {showRoleSelect ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
          >
            {allowedRoles.map((role) => (
              <option key={role} value={role}>
                {role === "provider"
                  ? "Healthcare Provider"
                  : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="role" value={formData.role || ""} />
      )}

      {/* Designation */}
      {formData.role === "provider" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Designation
          </label>
          <select
            name="designation"
            value={formData.designation || ""}
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
          >
            <option value="">-- Select Designation --</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
          </select>
        </div>
      )}

      {/* Address */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          name="address"
          rows={3}
          value={formData.address || ""}
          onChange={handleChange}
          required
          placeholder="e.g. 123 Main Street"
          className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
        />
      </div>

      {isProviderAddingMother && (
        <>
          {/* --- Additional Biodata Fields --- */}
          {/* Religion */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Religion
            </label>
            <input
              type="text"
              name="religion"
              value={formData.religion || ""}
              onChange={handleChange}
              placeholder="e.g. Christianity, Islam"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* Ethnic Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ethnic Group
            </label>
            <input
              type="text"
              name="ethnic_group"
              value={formData.ethnic_group || ""}
              onChange={handleChange}
              placeholder="e.g. Yoruba, Hausa, Igbo"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marital Status
            </label>
            <select
              name="marital_status"
              value={formData.marital_status || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            >
              <option value="">-- Select --</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Education Level
            </label>
            <select
              name="education_level"
              value={formData.education_level || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            >
              <option value="">-- Select --</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              placeholder="e.g. Trader, Teacher"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* --- Next of Kin Section --- */}
          <div className="md:col-span-2">
            <h3 className="text-md font-semibold mt-6 mb-2 border-b pb-1 text-gray-700">
              Next of Kin
            </h3>
          </div>

          {/* NOK Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="nok_name"
              value={formData.nok_name || ""}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* NOK Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Relationship
            </label>
            <input
              type="text"
              name="nok_relationship"
              value={formData.nok_relationship || ""}
              onChange={handleChange}
              placeholder="e.g. Sister, Husband"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* NOK Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="nok_address"
              rows={2}
              value={formData.nok_address || ""}
              onChange={handleChange}
              placeholder="e.g. 123 Palm Street, Lagos"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* NOK Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="nok_phone"
              value={formData.nok_phone || ""}
              onChange={handleChange}
              maxLength={11}
              placeholder="e.g. +2348123456789"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* NOK Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <input
              type="text"
              name="nok_occupation"
              value={formData.nok_occupation || ""}
              onChange={handleChange}
              placeholder="e.g. Civil Servant"
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            />
          </div>

          {/* NOK Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Educational Level
            </label>
            <select
              name="nok_education_level"
              value={formData.nok_education_level || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
            >
              <option value="">-- Select --</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
              <option value="others">Others</option>
            </select>
          </div>
        </>
      )}

      {/* Buttons */}
      <div className="md:col-span-2 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-300 hover:bg-gray-400 text-gray-900 hover:text-white px-5 py-2 rounded-md cursor-pointer"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md cursor-pointer"
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update User"
            : "Create User"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
