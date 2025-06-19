import React, { useEffect, useState } from "react";
import DefaultProfileImage from "../assets/images/profile.png";
import axios from "axios";
import FeedbackModal from "../Component/FeedbackModal"; // ✅ Import here

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", profileImage: "", mobileNumber: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(""); // ✅ Message for modal
  const [originalMobileNumber, setOriginalMobileNumber] = useState(user.mobileNumber);
  const [isMobileUpdated, setIsMobileUpdated] = useState(false);
  const [isImageUpdated, setIsImageUpdated] = useState(false);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const profileURL = import.meta.env.VITE_PROFILE_BASE_URL;
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${baseURL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data.data;

        setUser({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          mobileNumber: userData.mobileNumber,
          profileImage: userData.profileImage,
        });
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [baseURL, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsImageUpdated(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = {};
    const mobile = user.mobileNumber?.toString().trim();

    if (!mobile) {
      newErrors.mobileNumber = "Mobile number is required.";
      valid = false;
    } else if (!/^\d{10,}$/.test(mobile)) {
      newErrors.mobileNumber = "Mobile number must be at least 10 digits.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("mobileNumber", user.mobileNumber);

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const response = await axios.post(`${baseURL}/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.data?.profileImage) {
        localStorage.setItem("profileImage", response.data.data.profileImage);
        window.dispatchEvent(new Event("profileImageUpdated"));
      }

      setFeedbackMessage(response.data?.message);
      setFeedbackModalOpen(true);
      setOriginalMobileNumber(user.mobileNumber);
      setIsMobileUpdated(false);
      setIsImageUpdated(false);
    } catch (error) {
      console.error("Error updating profile", error);
      setFeedbackMessage(response.data?.error);
      setFeedbackModalOpen(true);
    }
  };

  const profileImageUrl = user.profileImage
    ? `${profileURL}/${user.profileImage}`
    : DefaultProfileImage;

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 my-4">
      <h3 className="heading text-indigo-900">Profile Information</h3>

      <div className="flex flex-col md:flex-row items-center gap-2 w-full mt-3">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative group">
            <img
              alt="User Profile"
              src={selectedFile ? URL.createObjectURL(selectedFile) : profileImageUrl}
              className="size-40 md:size-70 rounded object-cover"
            />
            <div className="absolute inset-0 bg-black-100 bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity">
              <label className="text-white cursor-pointer">
                Choose File
                <input type="file" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <h3 className="subHeading mt-2">{user.name}</h3>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="grid gap-2" method="post">
            <div>
              <label className="paragraph">Username</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="input w-full border border-gray-500"
                readOnly
              />
            </div>

            <div>
              <label className="paragraph">Email</label>
              <input
                type="text"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="input w-full border border-gray-500"
                readOnly
              />
            </div>

            <div>
              <label className="paragraph">Mobile Number</label>
              <input
                type="number"
                value={user.mobileNumber}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setUser({ ...user, mobileNumber: newValue });

                  if (newValue.trim().length >= 10) {
                    setErrors((prev) => ({ ...prev, mobileNumber: "" }));
                  }
                  setIsMobileUpdated(newValue !== originalMobileNumber);
                }}
                className={`input w-full border ${errors.mobileNumber ? "border-red-500" : "border-gray-500"}`}
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            {(isMobileUpdated || isImageUpdated) && (
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="buttonSuccess w-40">
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ✅ Reusable Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
      />
    </div>
  );
};

export default Profile;
