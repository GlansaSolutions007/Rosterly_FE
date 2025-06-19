import React, { useEffect, useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import loadingGif from "../assets/Loading/Loading-circle.gif";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

export default function Login() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const localURL = import.meta.env.VITE_LOCAL_URL;
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClass, setModalClass] = useState(
    "transform translate-y-10 opacity-0"
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);


  const navigate = useNavigate();

  const openModal = () => {
    setModalClass("transform translate-y-15 opacity-0");
    setIsModalOpen(true);

    setTimeout(() => {
      setModalClass(
        "transform translate-y-0 opacity-100 transition-all duration-500 ease-out"
      );
    }, 10);
  };

  const closeModal = () => {
    setModalClass("transform translate-y-10 opacity-0");
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      openModal();
    }
  }, [isModalOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/myrosterly");
    }
  }, [navigate]);

  const handleChange = (field, value) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "company":
        setCompany(value);
        break;
      case "mobile":
        setMobile(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email address.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    if (!isLogin) {
      if (!firstName) newErrors.firstName = "First name is required.";
      if (!lastName) newErrors.lastName = "Last name is required.";
      if (!company) newErrors.company = "Company name is required.";
      if (!mobile) newErrors.mobile = "Mobile number is required.";
      else if (!/^\d{10}$/.test(mobile.replace(/\s/g, "")))
        newErrors.mobile = "Enter a valid 10-digit mobile number.";

      if (!confirmPassword)
        newErrors.confirmPassword = "Please confirm your password.";
      else if (password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";

      if (!agreeTerms)
        newErrors.terms = "You must agree to the terms and conditions.";
    }

    return newErrors;
  };
  // const handleSubmit = () => {
  //   navigate("/myrosterly")
  // }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      setLoading(true);
      try {
        const response = await axios.post(`${baseURL}/login`, {
          email,
          password,
        });
        const data = response.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("firstName", data.user.firstName);
        localStorage.setItem("lastName", data.user.lastName);
        localStorage.setItem("role_id", data.user.role_id);
        localStorage.setItem("createdBy", data.user.created_by);
        localStorage.setItem("id", data.user.id);
        localStorage.setItem("profileImage", data.user.profileImage);

        setModalTitle("Success");
        // setModalMessage("Login successful!");
        // setIsModalOpen(true);

        console.log("Login successful:", data);
        console.log("Role ID from localStorage:", data.user.role_id);
        navigate("/myrosterly");
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Email or password is incorrect.";

        setModalTitle("Error");
        setModalMessage(errorMessage);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bgimg px-4 bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl flex overflow-hidden">
        <div className="w-1/2 hidden md:flex flex-col justify-center items-center bg-rosterGreen text-white p-6 bg-cover bg-center">
          <div className="bg-black/50 p-4 borderRadius10 text-center">
            <h2 className="mainHeading font-bold ">
              Fuel Your Productivity 🚀
            </h2>
            <p className="paragraph mt-3 max-w-xs">
              Log in to unlock powerful tools, stay on track, and make every
              second count. Your efficient workspace awaits!
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <div className=" flex items-center justify-center mb-6">
            <h1 className="text-center text-2xl font-bold text-secondary ">
              Login
            </h1>
            <FaUser className="inline-block ml-2 text-xl" />
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-secondary font-semibold mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`custom-focus w-full paragraphBold px-2 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="m-0">
              <label className="text-secondary font-semibold mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`custom-focus w-full paragraphBold px-2 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg pr-12`}
                  placeholder="Enter your password"
                />
                <span
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <div className="my-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordModalOpen(true)}
                  className="text-sm text-gray-600 hover:text-black transition-colors cursor-pointer duration-200"
                >
                  Forgot Password?
                </button>
              </div>


              {forgotPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
                    <h3 className="text-lg font-semibold text-center text-secondary">
                      Reset Password
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Enter your email to receive a password reset link.
                    </p>

                    <input
                      type="email"
                      placeholder="Email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${forgotError ? "border-red-500 focus:ring-red-300" : "focus:ring-primary"
                        }`}
                    />

                    {forgotError && (
                      <p className="text-sm text-red-500 mt-1">{forgotError}</p>
                    )}
                    {forgotSuccess && (
                      <p className="text-sm text-gray-700 mt-1">{forgotSuccess}</p>
                    )}

                    <div className="flex justify-end mt-4">
                      <button
                        className="buttonGrey py-2 px-4 rounded-lg"
                        onClick={() => {
                          setForgotPasswordModalOpen(false);
                          setForgotEmail("");
                          setForgotError("");
                          setForgotSuccess("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className={`buttonSuccess py-2 ml-2 px-4 rounded-lg ${forgotLoading ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        disabled={forgotLoading}
                        onClick={async () => {
                          setForgotError("");
                          setForgotSuccess("");

                          if (!forgotEmail.trim()) {
                            setForgotError("Email is required.");
                            return;
                          } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
                            setForgotError("Enter a valid email address.");
                            return;
                          }

                          setForgotLoading(true);
                          try {
                            const response = await axios.post(`${baseURL}/forgotPassword`, {
                              email: forgotEmail,
                            });

                            setForgotSuccess(
                              response?.data?.message || "Reset link sent to your email."
                            );
                            setForgotError("");
                          } catch (error) {
                            setForgotError(
                              error.response?.data?.message ||
                              "Failed to send reset link. Please try again."
                            );
                            setForgotSuccess("");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                      >
                        {forgotLoading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              )}





            </div>
            <div>
              <button
                type="submit"
                className={`w-full py-3 mt-1 rounded-xl font-semibold text-black shadow-md flex items-center justify-center
        transition-all duration-300 ease-in-out transform hover:scale-105 loginButton
        ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <img
                      src={loadingGif}
                      alt="Loading..."
                      className="h-5 w-5 mr-2 animate-spin"
                    />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
          {/* <div className="mt-2 text-center">
            <Link
              to="/register"
              className="text-center paragraph text-gray-600"
            >
              Don’t have an account?
              <span className="ml-1 text-primary cursor-pointer paragraphBold hover:underline">
                Create an account
              </span>
            </Link>
          </div> */}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className={`bg-white p-6 rounded-lg shadow-2xl w-80 ${modalClass}`}
          >
            <h3 className="font-bold headingBold text-center">{modalTitle}</h3>
            <p className="py-4 subHeading text-center">{modalMessage}</p>
            <div className="text-center">
              <button
                onClick={closeModal}
                className="buttonGrey py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
