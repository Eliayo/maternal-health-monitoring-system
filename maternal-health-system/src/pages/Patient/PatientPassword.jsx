import PasswordUpdate from "../../components/Common/PasswordUpdate";
import { HiLockClosed } from "react-icons/hi";

const PatientPassword = () => {
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Stepper/Progress Bar */}
        <div className="w-full h-2 bg-pink-100">
          <div
            className="h-full bg-pink-500 transition-all duration-500"
            style={{ width: "33%" }}
          ></div>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-3xl">
              <HiLockClosed />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-pink-700 mb-2">
            Welcome Mama 💕
          </h1>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
            To keep your information safe, please create a secure password
            before proceeding.
          </p>

          {/* Password Update Form */}
          <PasswordUpdate role="mother" />

          {/* Footer note */}
          <p className="text-xs text-center text-gray-400 mt-8">
            Step 1 of 3 · Profile Setup
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientPassword;
