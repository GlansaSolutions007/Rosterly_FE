import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaSearch, FaEye, FaEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { set } from "date-fns";
import axios from "axios";
import { CgProfile } from "react-icons/cg";
import { HiTrash } from "react-icons/hi2";
import { LuNotebookPen } from "react-icons/lu";
import FeedbackModal from "../Component/FeedbackModal";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { capitalLetter } from "../Component/capitalLetter";
import { FaUserSlash } from "react-icons/fa";
import { differenceInYears } from "date-fns";

const People = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const profileBaseURL = import.meta.env.VITE_PROFILE_BASE_URL;
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewButtonModel, setViewButtonModel] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDate, setCreateDate] = useState(null);
  const [editDate, setEditDate] = useState(null);
  const [note, setNote] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const currentUserRole = parseInt(localStorage.getItem("role_id"));
  const currentUserId = parseInt(localStorage.getItem("id"));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [filteredByStatus, setFilteredByStatus] = useState([]); // status-filtered data
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [locationUsers, setLocationUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    payrate: "",
    payratePercent: "",
    password: "",
    dob: "",
    profileImage: "",
    role_id: "",
    location_id: "",
  });

  useEffect(() => {
    if (createDate) {
      setFormData((prev) => ({
        ...prev,
        dob: createDate.toISOString().split("T")[0],
      }));
    }
  }, [createDate]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      payrate: "",
      payratePercent: "",
      mobileNumber: "",
      role_id: "",
      profileImage: "",
    });
    setCreateDate(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Assign the correct role ID based on the current user role
    const assignedRoleId = currentUserRole === 2 ? 3 : formData.role_id;

    // Use this updated role ID in the validation phase
    const updatedFormData = { ...formData, role_id: assignedRoleId };

    // Validate using updated data
    const newErrors = {};
    if (!updatedFormData.firstName?.trim())
      newErrors.firstName = "First name is required.";
    if (!updatedFormData.lastName?.trim())
      newErrors.lastName = "Last name is required.";
    if (!updatedFormData.email?.trim()) newErrors.email = "Email is required.";
    // if (!updatedFormData.dob?.trim())
    //   newErrors.dob = "Date of birth is required.";
    // if (!updatedFormData.payrate?.trim())
    //   newErrors.payrate = "Pay rate is required.";
    // if (!updatedFormData.payratePercent?.trim())
    //   newErrors.payratePercent = "Pay rate percentage is required.";
    // if (!updatedFormData.mobileNumber?.trim()) {
    //   newErrors.mobileNumber = "Mobile number is required.";
    // } else if (!/^\d{10}$/.test(updatedFormData.mobileNumber)) {
    //   newErrors.mobileNumber = "Mobile number must be exactly 10 digits.";
    // }
    if (!updatedFormData.role_id) newErrors.role_id = "Role is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Create form data
    const form = new FormData();
    form.append("firstName", updatedFormData.firstName);
    form.append("lastName", updatedFormData.lastName);
    form.append("email", updatedFormData.email);
    form.append("dob", updatedFormData.dob);
    form.append("payrate", updatedFormData.payrate);
    form.append(
      "payratePercent",
      updatedFormData.payratePercent?.trim() || "0"
    );
    form.append("mobileNumber", updatedFormData.mobileNumber);
    form.append("role_id", updatedFormData.role_id);
    form.append("created_by", currentUserId);
    form.append("created_on", new Date().toISOString());
    // form.append("password", "defaultPassword123");
    // form.append("location_id", updatedFormData.location_id);

    if (selectedProfile.file) {
      form.append("profileImage", selectedProfile.file);
    }

    try {
      const response = await axios.post(`${baseURL}/users`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("User created:", response.data);
      setIsModalOpen(false);
      setFeedbackMessage(response.data?.message || "User created successfully");
      setFeedbackModalOpen(true);
      resetForm(); // clear form
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      setFeedbackMessage(
        error.response?.data?.message || "Error creating user"
      );
      setFeedbackModalOpen(true);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const currentUserId = Number(localStorage.getItem("id"));
      const currentUserRole = Number(localStorage.getItem("role_id"));
      console.log(currentUserRole);
      const endpoint =
        currentUserRole === 1 ? `${baseURL}/users` : `${baseURL}/users/manager`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      let allUsers = response.data.data;
      console.log("Raw users from API:", allUsers);

      let filteredUsers = allUsers.filter((user) => {
        const userId = Number(user.id);
        const userRole = Number(user.role_id);

        if (userId === currentUserId) {
          console.log(`Removing self with id: ${userId}`);
          return false;
        }
        if (currentUserRole === 2 && userRole === 1) {
          console.log(
            `Removing admin user with id: ${userId} for manager role`
          );
          return false;
        }
        return true;
      });

      console.log("Filtered users:", filteredUsers);

      setUsers(filteredUsers);
      setFilteredProfiles(filteredUsers);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      // setFilteredByStatus(users);
      // applySearchFilter(searchTerm, users);
      applyCombinedFilters(users, selectedLocation, selectedStatus, searchTerm);
    }
  }, [users]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${baseURL}/locations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // console.log("Locations fetched:", response.data);
      setLocations(response.data);
      console.log(
        response.data.map((item) => item.id),
        "only IDs"
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleOpenModal = () => {
    setSelectedProfile({ image: "", file: null, profileImage: "" });
    resetForm(); // ✅ Clear form and errors
    setIsModalOpen(true); // ✅ Then show modal
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchTerm(keyword);

    applyCombinedFilters(users, selectedLocation, selectedStatus, keyword);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const response = await axios.post(
        `${baseURL}/users/profile/${id}/status`,
        {
          status: newStatus,
          updated_by: currentUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Status updated successfully:", response.data);

        // Update all users state
        setUsers((prev) =>
          prev.map((profile) =>
            profile.id === id ? { ...profile, status: newStatus } : profile
          )
        );

        // Re-filter updated users
        const updatedUsers = users.map((profile) =>
          profile.id === id ? { ...profile, status: newStatus } : profile
        );
        applyCombinedFilters(
          updatedUsers,
          selectedLocation,
          selectedStatus,
          searchTerm
        );
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Failed to update status:",
        error.response?.data || error.message
      );
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", selectedProfile.firstName);
      formData.append("lastName", selectedProfile.lastName);
      formData.append("email", selectedProfile.email);
      formData.append("role_id", selectedProfile.role_id);
      formData.append(
        "dob",
        editDate?.toISOString().split("T")[0] || selectedProfile.dob
      ); // format DOB
      formData.append("mobileNumber", selectedProfile.mobileNumber);
      formData.append("payrate", selectedProfile.payrate);
      formData.append("payratePercent", selectedProfile.payratePercent);

      if (
        selectedProfile.image &&
        selectedProfile.image.startsWith("data:image")
      ) {
        const blob = await fetch(selectedProfile.image).then((r) => r.blob());
        formData.append("profileImage", blob, "profile.jpg");
      }

      const response = await axios.post(
        `${baseURL}/users/${selectedProfile.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("User updated:", response.data);
      setFeedbackMessage(response.data?.message || "User updated successfully");
      setFeedbackModalOpen(true);
      fetchUsers(); // refresh user list
      setViewButtonModel(false); // close the edit modal
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      setFeedbackMessage(
        error.response?.data?.message || "Error updating user"
      );
      setFeedbackModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProfile?.dob) {
      setEditDate(new Date(selectedProfile.dob));
    } else {
      setEditDate(null);
    }
  }, [selectedProfile]);

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setFeedbackMessage("Are you sure you want to delete?");
    setShowConfirmButtons(true);
    setFeedbackModalOpen(true);
  };

  const handleCloseModal = () => {
    setFeedbackModalOpen(false);
    setTimeout(() => {
      setFeedbackMessage("");
      setShowConfirmButtons(false);
    }, 300);
  };

  const confirmDelete = async () => {
    setLoading(true);

    if (!confirmDeleteId) return;

    try {
      const response = await axios.delete(
        `${baseURL}/users/${confirmDeleteId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: {
            deletedby: currentUserId, // You must pass this value from your app's auth context
          },
        }
      );

      console.log("User deleted:", response.data); // Add this for confirmation

      setFeedbackMessage(response.data?.message || "User updated successfully");
      setShowConfirmButtons(false);
      fetchUsers(); // Refresh the user list
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setFeedbackMessage("Failed to delete user.");
      setShowConfirmButtons(false);
      setTimeout(() => setFeedbackModalOpen(false), 2000);
    }
  };
  // const handleLocationChange = async (locationId) => {
  //   setSelectedLocation(locationId);
  //   setLoading(true);

  //   try {
  //     if (locationId === "all") {
  //       // If "All Locations" is selected, show all users
  //       setFilteredProfiles(users);
  //     } else {
  //       const response = await axios.get(`${baseURL}/locations/${locationId}/users`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       });

  //       const locationUsers = response.data.data.map((item) => item.user); // Extract `user` from each record
  //       setFilteredProfiles(locationUsers);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching users by location:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const applyCombinedFilters = (
    allUsers,
    locationId,
    statusValue,
    keyword = ""
  ) => {
    let filtered = allUsers;

    // 🔹 Apply location filter
    if (locationId !== "all") {
      filtered = filtered.filter(
        (user) => String(user.location_id) === String(locationId)
      );
    }

    // 🔹 Apply status filter
    // if (statusValue !== "all") {
    //   filtered = filtered.filter(
    //     (user) => String(user.status) === String(statusValue)
    //   );
    // }
    if (statusValue !== "all") {
      filtered = filtered.filter((user) => {
        if (statusValue === "2" || statusValue === "3") {
          return user.role_id === Number(statusValue); // ✅ Corrected comparison
        }
        return String(user.status) === String(statusValue);
      });
    }

    // 🔹 Apply search keyword
    if (keyword.trim() !== "") {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((profile) => {
        const fullName =
          `${profile.firstName} ${profile.lastName}`.toLowerCase();
        const email = profile.email?.toLowerCase() || "";
        const phone = profile.mobileNumber?.toString() || "";

        return (
          fullName.includes(lowerKeyword) ||
          email.includes(lowerKeyword) ||
          phone.includes(lowerKeyword)
        );
      });
    }

    setFilteredProfiles(filtered);
    console.log("Applied filters:", {
      locationId,
      statusValue,
      keyword,
      allUsers,
    });
    console.log("Filtered profiles:", filtered);
  };

  // useEffect(() => {
  //   applyCombinedFilters(filteredByStatus, selectedLocation, selectedStatus, searchTerm);
  // }, [searchTerm]);

  return (
    <div className="flex flex-col gap-3 ">
      <div className="sticky top-0 bg-[#f1f1f1] py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left side: Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            name="selectedStatus"
            className="input flex-1 min-w-[140px] cursor-pointer"
            value={selectedStatus}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedStatus(value);

              applyCombinedFilters(users, selectedLocation, value, searchTerm);
              // setFilteredProfiles(filtered);
              // setFilteredByStatus(filtered);
              // applySearchFilter(searchTerm, filtered);
            }}
          >
            <option value="all">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
            <option value="2">Manager</option>
            <option value="3">Employee</option>
          </select>

          {/* Location Filter */}
          <select
            name="selectedLocation"
            className="input flex-1 min-w-[140px] cursor-pointer"
            value={selectedLocation}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedLocation(value);

              applyCombinedFilters(users, value, selectedStatus, searchTerm);
              // setFilteredProfiles(filtered);
              // setFilteredByStatus(filtered);
              // applySearchFilter(searchTerm, filtered);
            }}
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name}
              </option>
            ))}
          </select>
        </div>

        {/* Right side: Search + Add */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="bg-white rounded-lg border border-gray-300 flex items-center px-3 flex-1 min-w-[200px]">
            <FaSearch className="text-indigo-950" />
            <input
              type="text"
              placeholder="Search..."
              className="input w-full border-none focus:ring-0"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <button
            className="buttonTheme flex-1 min-w-[120px]"
            title="Add Employee"
            onClick={handleOpenModal}
          >
            + Employee
          </button>
        </div>
      </div>
      <div className="relative min-h-[60vh]">
        {loading && <p>Loading users...</p>}

        {!loading &&
          Array.isArray(filteredProfiles) &&
          filteredProfiles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <FaUserSlash className="text-gray-400 text-3xl mr-2" />
              <p className="text-gray-500 text-lg text-center">
                No employees found.
              </p>
            </div>
          )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          {Array.isArray(filteredProfiles) &&
            filteredProfiles.map((profile) => (
              <div key={profile.id} className="w-full">
                <div
                  className={`shadow-xl p-4 rounded-xl h-full flex flex-col justify-between ${
                    profile.status === 1 ? "mSideBar" : "mSideBarInactive"
                  }`}
                >
                  {/* Top Section: Image + Info */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {profile.profileImage ? (
                        <img
                          alt="Profile"
                          src={
                            profile.profileImage.startsWith("http")
                              ? profile.profileImage
                              : `${profileBaseURL}/${profile.profileImage}`
                          }
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <CgProfile className="h-20 w-20 rounded-full bg-gray-200 p-2" />
                      )}
                      <div className="text-left w-full min-w-0 overflow-hidden">
                        <h3 className="paragraphBold md:subheadingBold break-words">
                          {profile.role_id === 2
                            ? `${profile.firstName} ${profile.lastName} (M)`
                            : profile.role_id === 1
                            ? `${profile.firstName} ${profile.lastName} (A)`
                            : `${profile.firstName} ${profile.lastName} (E)`}
                        </h3>
                        <p className="paragraphThin break-words">
                          {profile.email}
                        </p>
                        <p className="paragraphThin break-words">
                          {profile.mobileNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Actions + Toggle */}
                  <div className="mt-4 flex flex-row flex-wrap md:justify-between">
                    {/* Status Toggle */}
                    <label
                      className="flex items-center gap-2 cursor-pointer"
                      title="Toggle Status"
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        hidden
                        checked={profile.status === 1}
                        onChange={() =>
                          handleToggleStatus(profile.id, profile.status)
                        }
                      />
                      {profile.status === 1 ? (
                        <FaToggleOn className="text-green-700 w-6 h-6 transition duration-300" />
                      ) : (
                        <FaToggleOff className="text-gray-400 w-6 h-6 transition duration-300" />
                      )}
                      <span className="text-sm select-none">
                        {profile.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </label>

                    {/* Actions */}
                    <div className="flex">
                      <FaEye
                        title="View Profile"
                        className="text-indigo-950 cursor-pointer p-2 rounded-md w-8 h-8 flex items-center justify-center"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setViewButtonModel(true);
                        }}
                      />

                      <HiTrash
                        title="Delete Profile"
                        className="textRed cursor-pointer p-2 rounded-md w-8 h-8 flex items-center justify-center"
                        onClick={() => handleDeleteClick(profile.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Transition show={isModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          onClose={() => setIsModalOpen(false)}
          className="relative z-50 rounded-lg"
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700/70"></div>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-sm sm:max-w-md w-full overflow-y-auto max-h-[90vh]">
                <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
                  <Dialog.Title className="heading">Add Employee</Dialog.Title>

                  <button
                    className="text-white font-bold text-2xl"
                    onClick={() => setIsModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                {currentUserRole == 2 && (
                  <>
                    <div className="space-y-3 p-3">
                      <p className="text-gray-500 text-sm text-center">
                        <span className="text-red-500 font-bold">*</span>
                        To view newly added employees
                        <br />
                        please assign them to your location.
                      </p>
                    </div>
                  </>
                )}
                <form className="p-6 space-y-3" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="paragraphBold">First Name <span className="text-red-600">*</span> </label>
                      <input
                        type="text"
                        className="input"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: capitalLetter(e.target.value),
                          })
                        }
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="paragraphBold">Last Name <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        className="input"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: capitalLetter(e.target.value),
                          })
                        }
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="paragraphBold">Email <span className="text-red-600">*</span> </label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="paragraphBold">Date of Birth</label>
                      <DatePicker
                        className="input"
                        selected={createDate}
                        onChange={(date) => {
                          if (!date) return;

                          const age = differenceInYears(new Date(), date);
                          setCreateDate(date); // Always show selected date

                          if (age < 10) {
                            // Set error, don't allow in form
                            setErrors((prev) => ({
                              ...prev,
                              dob: "You are not eligible. Minimum age is 10 years.",
                            }));
                            setFormData((prev) => ({ ...prev, dob: "" }));
                          } else {
                            // Clear error and set value
                            setErrors((prev) => ({ ...prev, dob: "" }));
                            setFormData((prev) => ({
                              ...prev,
                              dob: date.toISOString().split("T")[0],
                            }));
                          }
                        }}
                        showYearDropdown
                        showMonthDropdown
                        dateFormat="dd/MM/yyyy"
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText="Select date"
                        maxDate={new Date()}
                      />
                      {errors.dob && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.dob}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="paragraphBold">Phone Number</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow only numbers
                          if (!/^\d*$/.test(value)) return;

                          // Set value
                          setFormData({
                            ...formData,
                            mobileNumber: value,
                          });

                          // Validation
                          if (value.length === 0) {
                            setErrors({
                              ...errors,
                              mobileNumber: "Phone number is required",
                            });
                          } else if (value.length !== 10) {
                            setErrors({
                              ...errors,
                              mobileNumber:
                                "Phone number must be exactly 10 digits",
                            });
                          } else {
                            setErrors({ ...errors, mobileNumber: "" }); // Clear error if valid
                          }
                        }}
                        maxLength={10}
                      />
                      {errors.mobileNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.mobileNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="paragraphBold">Pay Rate/Hour</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.payrate}
                        onChange={(e) =>
                          setFormData({ ...formData, payrate: e.target.value })
                        }
                      />
                      {errors.payrate && (
                        <p className="text-red-500 text-sm">{errors.payrate}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="paragraphBold">Pay Rate %</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.payratePercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payratePercent: e.target.value,
                          })
                        }
                      />
                      {errors.payratePercent && (
                        <p className="text-red-500 text-sm">
                          {errors.payratePercent}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentUserRole === 1 && (
                    <div className="flex flex-col">
                      <label className="paragraphBold">Role <span className="text-red-600">*</span> </label>
                      <select
                        className="input"
                        value={formData.role_id || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            role_id: parseInt(e.target.value),
                          }))
                        }
                      >
                        <option value="">Select Role</option>
                        <option value="2">Manager</option>
                        <option value="3">Employee</option>
                      </select>
                      {errors.role_id && (
                        <p className="text-red-500 text-sm">{errors.role_id}</p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <label className="paragraphBold">Profile Image</label>
                    <input
                      type="file"
                      className="bg-white rounded p-2"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedProfile({
                            image: URL.createObjectURL(file),
                            file,
                          });
                        }
                      }}
                    />
                  </div>
                  {selectedProfile?.profileImage && (
                    <img
                      src={
                        selectedProfile.profileImage.startsWith("http")
                          ? selectedProfile.profileImage
                          : `${profileBaseURL}/${selectedProfile.profileImage}`
                      }
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-md"
                    />
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="buttonGrey"
                      onClick={() => {
                        resetForm(); // ✅ Clear form and errors
                        setIsModalOpen(false); // ✅ Hide modal
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="buttonTheme"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* View Profile Modal */}

      <Transition show={viewButtonModel} as={React.Fragment}>
        <Dialog
          as="div"
          onClose={() => setViewButtonModel(false)}
          className="relative z-50 rounded-lg"
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700/70"></div>
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-sm sm:max-w-md w-full">
                <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
                  <Dialog.Title className="heading">
                    Employee Details ({selectedProfile?.firstName})
                  </Dialog.Title>
                  <button
                    className="text-white font-bold text-2xl cursor"
                    onClick={() => setViewButtonModel(false)}
                  >
                    ×
                  </button>
                </div>
                <form className="mt-4 p-6 space-y-3" onSubmit={updateUser}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="paragraphBold">First Name</label>
                      <input
                        type="text"
                        className="input"
                        value={selectedProfile?.firstName || ""}
                        onChange={(e) =>
                          setSelectedProfile((prev) => ({
                            ...prev,
                            firstName: capitalLetter(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="paragraphBold">Last Name</label>
                      <input
                        type="text"
                        className="input"
                        value={selectedProfile?.lastName || ""}
                        onChange={(e) =>
                          setSelectedProfile((prev) => ({
                            ...prev,
                            lastName: capitalLetter(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="paragraphBold">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={selectedProfile?.email || ""}
                      onChange={(e) =>
                        setSelectedProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="paragraphBold">Date of Birth</label>
                    <DatePicker
                      className="input w-100"
                      selected={editDate} // <-- use the actual state
                      onChange={(date) => {
                        setEditDate(date);
                        setSelectedProfile((prev) => ({
                          ...prev,
                          dob: date.toISOString().split("T")[0], // Optional: update dob in selectedProfile if needed
                        }));
                      }}
                      showYearDropdown
                      showMonthDropdown
                      dateFormat="dd/MM/yyyy"
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      placeholderText="Select date"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className="paragraphBold">Payrate/Hour</label>
                      <input
                        type="text"
                        className="input"
                        value={selectedProfile?.payrate || ""}
                        onChange={(e) =>
                          setSelectedProfile((prev) => ({
                            ...prev,
                            payrate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="paragraphBold">Payrate %</label>
                      <input
                        type="text"
                        className="input"
                        value={selectedProfile?.payratePercent || ""}
                        onChange={(e) =>
                          setSelectedProfile((prev) => ({
                            ...prev,
                            payratePercent: e.target.value,
                          }))
                        }
                      />
                    </div>
                    {currentUserRole === 1 && (
                      <div className="flex flex-col">
                        <label className="paragraphBold">Role</label>
                        <select
                          className="input"
                          value={selectedProfile?.role_id || ""}
                          onChange={(e) =>
                            setSelectedProfile((prev) => ({
                              ...prev,
                              role_id: parseInt(e.target.value),
                            }))
                          }
                        >
                          <option value="">Select Role</option>
                          <option value="2">Manager</option>
                          <option value="3">Employee</option>
                        </select>
                        {errors.role_id && (
                          <p className="text-red-500 text-sm">
                            {errors.role_id}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <label className="paragraphBold">Phone Number</label>
                      <input
                        type="text"
                        className="input"
                        value={selectedProfile?.mobileNumber || ""}
                        onChange={(e) =>
                          setSelectedProfile((prev) => ({
                            ...prev,
                            mobileNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="paragraphBold">Profile Image</label>
                      <input
                        type="file"
                        className="bg-white rounded p-2"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSelectedProfile((prev) => ({
                                ...prev,
                                image: reader.result, // Base64 image data
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {selectedProfile?.profileImage && (
                    <img
                      src={
                        selectedProfile.profileImage.startsWith("http")
                          ? selectedProfile.profileImage
                          : `${profileBaseURL}/${selectedProfile.profileImage}`
                      }
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-md"
                    />
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="buttonGrey"
                      onClick={() => setViewButtonModel(false)}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="buttonTheme">
                      Update
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* ✅ Reusable Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={handleCloseModal}
        // onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
        onConfirm={confirmDelete}
        showConfirmButtons={showConfirmButtons}
      />
      {/* message modal emd */}
    </div>
  );
};

export default People;
