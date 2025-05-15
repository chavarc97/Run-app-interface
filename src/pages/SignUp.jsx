import { useState, useEffect } from "react";
import { FaApple } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, loading, error, isAuthenticated, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    
    // Clear any previous errors when component mounts
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    
    setFormData({
      ...formData,
      [name]: val
    });
    
    // Check password match when either password or confirmPassword changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        setPasswordMatch(value === formData.confirmPassword || formData.confirmPassword === "");
      } else {
        setPasswordMatch(value === formData.password);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    try {
      await signUp(formData.username, formData.email, formData.password);
      // Redirect happens automatically via the useEffect when isAuthenticated changes
    } catch (err) {
      // Error is handled by the store and displayed via the error state
      console.error("Sign up error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-zinc-400/20 backdrop-blur-2xl rounded-lg shadow-lg border border-gray-100/20">
        <h1 className="text-3xl font-bold text-center mb-6 pt-5 text-gray-100">
          Create your RunApp Account
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Name"
              className="text-white w-full px-4 py-2 bg-zinc-200/20 border border-gray-100/30 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="text-white w-full px-4 py-2 bg-zinc-200/20 border border-gray-100/30 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="text-white w-full px-4 py-2 bg-zinc-200/20 border border-gray-200/30 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`text-white w-full px-4 py-2 bg-zinc-200/20 border border-gray-200/30 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !passwordMatch ? "border-red-500" : ""
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {!passwordMatch && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-center mb-6">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              className="h-4 w-4 text-blue-500 focus:ring-blue-bg-zinc-200/20 border-gray-200/30 rounded"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <label
              htmlFor="agreeTerms"
              className="ml-2 block text-sm text-gray-100"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-sky-500 hover:text-sky-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-sky-500 hover:text-sky-700">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-2 px-4 bg-sky-500 text-white font-semibold rounded hover:bg-sky-600 transition duration-200"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/30 border-1"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white rounded-2xl text-gray-500">or</span>
          </div>
        </div>



        <div className="text-center mt-6">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-sky-500 hover:text-sky-700 font-medium"
            >
              Log in »
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;