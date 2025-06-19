import React, { useState } from "react";
import axios from "axios";
// import { Eye, EyeOff } from 'lucide-react'; // Use Lucide or FontAwesome or any icon lib
import { FaEye, FaEyeSlash } from "react-icons/fa";
import FeedbackModal from "../Component/FeedbackModal";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);

    if (!minLength) {
      setPasswordMessage("Password must be at least 6 characters");
      setPasswordValid(false);
    } else if (!hasUppercase) {
      setPasswordMessage("Password must include at least one uppercase letter");
      setPasswordValid(false);
    } else {
      setPasswordMessage("Strong password");
      setPasswordValid(true);
    }
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/changePassword`,
        {
          login_id: id,
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackMessage(
        response.data?.message || "Password changed successfully."
      );
      setFeedbackModalOpen(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordValid(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to change password.";
      setFeedbackMessage(msg);
      setFeedbackModalOpen(true);
    }
  };

  const renderPasswordField = (
    label,
    value,
    setValue,
    show,
    setShow,
    onChange,
    showValidation = false
  ) => (
    <div className="relative">
      <label className="paragraph">{label}</label>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="input w-full border border-gray-500 pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute top-9 right-3 text-gray-600"
      >
        {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
      </button>
      {showValidation && passwordMessage && (
        <p
          className={`text-xs mt-1 ${
            passwordValid ? "text-green-700" : "text-red-600"
          }`}
        >
          {passwordMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        {/* <h3 className="heading text-indigo-900">Change Password</h3> */}
        <div className="  md:flex-row items-center gap-2 w-full mt-3">
          <div className="w-100">
            <form onSubmit={handleSubmit} className="grid gap-2" method="post">
              {renderPasswordField(
                "Current Password",
                currentPassword,
                setCurrentPassword,
                showCurrent,
                setShowCurrent,
                (e) => setCurrentPassword(e.target.value)
              )}

              {renderPasswordField(
                "New Password",
                newPassword,
                setNewPassword,
                showNew,
                setShowNew,
                handleNewPasswordChange,
                true
              )}

              {renderPasswordField(
                "Confirm Password",
                confirmPassword,
                setConfirmPassword,
                showConfirm,
                setShowConfirm,
                (e) => setConfirmPassword(e.target.value)
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="buttonSuccess w-40">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
      />
    </div>
  );
};

export default ChangePassword;
