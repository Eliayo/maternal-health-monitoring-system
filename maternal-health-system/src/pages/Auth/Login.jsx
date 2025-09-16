import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { loginUser } from "../../services/authService";

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      //  USE loginUser FROM authService.js
      const { role, must_change_password } = await loginUser(
        username,
        password
      );

      if (!role) {
        toast.error("Login failed: invalid role");
        return;
      } else {
        toast.success("Login successful!");
      }

      // Wait briefly and redirect
      setTimeout(() => {
        if (must_change_password) {
          navigate(`/${role}/update-password`);
        } else {
          navigate(`/${role}/dashboard`);
        }
      }, 500);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter key press
      handleLogin(); // Trigger the login process
    }
  };

  return (
    <div className="min-h-screen font-pop flex items-center justify-center bg-[url('https://img.freepik.com/free-photo/blurred-abstract-background-interior-view-looking-out-toward-empty-office-lobby-entrance-doors-glass-curtain-wall-with-frame_1339-6363.jpg')] bg-cover bg-center px-4 sm:px-8">
      <div className="bg-white shadow-lg p-8 sm:p-12 md:p-16 max-w-md sm:max-w-lg md:max-w-2xl w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-blue-900 mb-4 sm:mb-6">
          Welcome Back
        </h2>
        <form onKeyDown={handleKeyPress}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block font-semibold mb-2 text-sm sm:text-base"
            >
              ID/Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your ID, phone number or username"
              className="w-full p-3 sm:p-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block font-semibold mb-2 text-sm sm:text-base"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="w-full p-3 sm:p-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label
              htmlFor="rememberMe"
              className="text-gray-700 text-sm sm:text-base"
            >
              Keep me signed in
            </label>
          </div>

          <button
            type="button"
            className={`w-full bg-blue-900 text-white font-semibold text-lg sm:text-xl p-3 sm:p-4 transition duration-300 cursor-pointer ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
