import { Dialog, Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { CgCloseO } from "react-icons/cg";
import axios from "axios";
import FeedbackModal from "../Component/FeedbackModal"; // ✅ Import here
import GoogleMapSelector from "../Component/GoogleMap";
import { set } from "date-fns";
import { capitalLetter } from "../Component/capitalLetter";

const Location = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [selectLocation, setSelectLocation] = useState("");
  const [employees, setEmployees] = useState("");
  const [employeeName, setEmployeeName] = useState([]);
  const [staff, setStaff] = useState([]);
  const [locationEmployees, setLocationEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [loading, setLoading] = useState(false);

  const [checked, setChecked] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [addlocationName, setAddlocationName] = useState("");
  const [addaddress, setAddaddress] = useState("");
  const [locationId, setLocationId] = useState("");
  const [sales, setSales] = useState("");
  const [salesId, setSalesId] = useState("");
  const [addsales, setAddsales] = useState("");

  const [locations, setLocations] = useState([]);
  const [updatelocationName, setUpdatelocationName] = useState("");
  const [updateaddress, setUpdateaddress] = useState("");
  const roleId = Number(localStorage.getItem("role_id")); // or from context/state
  const [modalRoleFilter, setModalRoleFilter] = useState(null);

  const [salesData, setSalesData] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  });
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [addlatitude, setAddlatitude] = useState("");
  const [addlongitude, setAddlongitude] = useState("");
  const [errors, setErrors] = useState({});
  const [address, setAddress] = useState("");
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };



  useEffect(() => {
    console.log("user ID:", id);
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const employeeList = await axios.get(
        `${baseURL}/users/login/${id}/${locationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmployeeName(employeeList.data.data);
      console.log("Employee List:", employeeList.data.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };


  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${baseURL}/locations`, { headers });
        console.log("Locations:", response.data);
        console.log("Location", locationId);
        setLocations(response.data.data || response.data);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };

    // Employee List Start here

    fetchLocations();
    // fetchSales();
    if (id && locationId) {
      fetchEmployees();
    }
  }, [id, locationId]);

  const validate = () => {
    const newErrors = {};
    if (!locationName.trim()) {
      newErrors.locationName = "Location Name is required";
    }
    if (employees.length === 0) {
      newErrors.employees = "At least one employee must be selected";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //  Handle one checkbox
  const handleChange = (e) => {
    const id = e.target.value;
    if (e.target.checked) {
      setEmployees([...employees, id]);
      console.log("Selected Employee ID:", id);
    } else {
      setEmployees(employees.filter((empId) => empId !== id));
    }
  };

  // Handle select all
  const handleAllchecked = () => {
    if (allSelected) {
      setEmployees([]);
    } else {
      const allIds = employeeName.map((emp) => emp.id.toString());
      setEmployees(allIds);
      console.log("All IDs selected:", allIds);
    }
    // setAllSelected(!allSelected);
  };

  const handleDltLoc = async (e, empId) => {
    e.preventDefault();
    setConfirmDeleteId(empId);
    setFeedbackMessage("Are you sure you want to delete?");
    setShowConfirmButtons(true);
    setFeedbackModalOpen(true);

    // You can add your API call or state update logic here
  };

  const confirmDelete = async () => {
    setLoading(true);

    if (!confirmDeleteId) return;

    try {
      const response = await axios.delete(
        `${baseURL}/locations/${locationId}/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: {
            user_ids: [confirmDeleteId], // You must pass this value from your app's auth context
          },
        }
      );

      console.log("User deleted:", response.data); // Add this for confirmation

      setFeedbackMessage("User deleted successfully.");
      setShowConfirmButtons(false);
      await getLocation(locationId);
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setLoading(false);
      }, 2000);
      fetchEmployees(); 
    } catch (error) {
      console.error("Error deleting user:", error);
      setFeedbackMessage("Failed to delete user.");
      setShowConfirmButtons(false);
      setTimeout(() => setFeedbackModalOpen(false), 2000);
    }
  };

  // Check if all are selected
  const allSelected =
    employeeName.length > 0 && employees.length === employeeName.length;

  // const fetchEmployeesLoc = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await axios.get(
  //       `${baseURL}/locations/employeesByLocation/${locationId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     setStaff(res.data.data); // Assuming `setStaff` is your state updater
  //     console.log("Fetched Employees:", res.data.data);
  //   } catch (error) {
  //     console.error("Error fetching employees:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchEmployeesLoc();
  // }, []);

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    if (!locationId) {
      setFeedbackMessage("Please select a valid location.");
      setFeedbackModalOpen(true);
      return;
    }

    if (employees.length === 0) {
      setFeedbackMessage("Please select at least one employee.");
      setFeedbackModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${baseURL}/locations/${locationId}/users`,
        {
          location_id: locationId,
          user_ids: employees.map((id) => Number(id)),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", res.data);
      console.log("API Response:", res.data);

      if (res.data) {
        setFeedbackMessage(
          res.data?.message || "Employees assigned successfully."
        );
        setEmployees([]);
        setLocationName("");
        setIsEmployeeModalOpen(false);
        await getLocation(locationId)
        fetchEmployees();      
      } else {
        setFeedbackMessage(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("API Error:", error);

      if (error.response) {
        setFeedbackMessage(
          error.response.data.message || "Server responded with an error."
        );
      } else if (error.request) {
        setFeedbackMessage(
          "No response from the server. Please check your network."
        );
      } else {
        setFeedbackMessage("Request setup error: " + error.message);
      }
    }

    setFeedbackModalOpen(true);
  };

  const handleLocation = (e) => {
    const selectedValue = e.target.value;
    setSelectLocation(selectedValue);
    // if (selectedValue) {
    getLocation(selectedValue);
    // }
  };

  // Location Handling Start here
  const getLocation = async (locationId) => {
    // alert(selectLocation);
    if (!locationId) return;

    try {
      setLocationEmployees([]);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${baseURL}/locations/${locationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data || response.data;
      const locId = Number(data.id);
      console.log("Fetched Location:", data);
      setLocationId(locId);
      console.log("Location ID:", locId);
      setLocationName(data.location_name || "");
      setSales(data.sales?.toString() || "");
      setLatitude(data.latitude?.toString() || "");
      setLongitude(data.longitude?.toString() || "");
      setAddress(data.address || "");

      // Sales data based on location ID
      const Salesresponse = await axios.get(
        `${baseURL}/locationSales/location/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Sales data:", Salesresponse.data);
      const locationSalesId = Salesresponse.data.id;
      setSalesId(locationSalesId);
      setSalesData({
        Monday: Salesresponse.data.monday || 0,
        Tuesday: Salesresponse.data.tuesday || 0,
        Wednesday: Salesresponse.data.wednesday || 0,
        Thursday: Salesresponse.data.thursday || 0,
        Friday: Salesresponse.data.friday || 0,
        Saturday: Salesresponse.data.saturday || 0,
        Sunday: Salesresponse.data.sunday || 0,
      });

      const sfresponse = await axios.get(
        `${baseURL}/locations/${data.id}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // setStaff(Staffresponse.data.data);
      const Staffresponse = sfresponse.data.data || sfresponse.data;
      setLocationEmployees(Staffresponse);
      console.log(
        "Raw sfresponse:",
        Staffresponse.map((sf) => ({ firstName: sf.user.firstName }))
      );
      console.log("sfresponse.data:", sfresponse.data.data);
    } catch (error) {
      console.error("Failed to fetch location", error);
    }
  };
  //     const Staffresponse = await axios.get(
  //       `${baseURL}/locations/employeesByLocation/${data.id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     setStaff(Staffresponse.data.employees);
  //     console.log("Staff data:", Staffresponse.data.data);
  //     console.log("saleId:", salesId);
  //   } catch (error) {
  //     console.error("Failed to fetch location", error);
  //   }
  // };

  const validateForm = () => {
    const newErrors = {};

    if (!addlocationName.trim())
      newErrors.addlocationName = "Location name is required.";
    if (!addsales.trim() || isNaN(addsales))
      newErrors.addsales = "Enter a valid number for sales.";
    if (!addlatitude.trim() || isNaN(addlatitude))
      newErrors.addlatitude = "Enter a valid latitude.";
    if (!addlongitude.trim() || isNaN(addlongitude))
      newErrors.addlongitude = "Enter a valid longitude.";
    if (!addaddress.trim()) newErrors.addaddress = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpdateForm = () => {
    const newErrors = {};

    if (!locationName.trim())
      newErrors.locationName = "Location name is required.";
    // if (!sales.trim() || isNaN(sales))
    //   newErrors.sales = "Enter a valid number for sales.";
    if (!latitude.trim() || isNaN(latitude))
      newErrors.latitude = "Enter a valid latitude.";
    if (!longitude.trim() || isNaN(longitude))
      newErrors.longitude = "Enter a valid longitude.";
    if (!address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
          `${baseURL}/locations`,
          {
            location_name: addlocationName,
            sales: parseFloat(addsales),
            latitude: parseFloat(addlatitude),
            longitude: parseFloat(addlongitude),
            address: addaddress,
            created_by: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Location added successfully", response.data);

        setAddlocationName("");
        setSales("");
        setLatitude("");
        setLongitude("");
        setAddaddress("");
        setErrors({});
        // Close modal if applicable
        setIsModalOpen(false);

        // Show success feedback
        setFeedbackMessage(
          response.data?.message || "Location added successfully."
        );
        setFeedbackModalOpen(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error("API Error:", error);
        if (error.response && error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
        setFeedbackMessage(
          error.response?.data?.message ||
          "Failed to add location. Please try again."
        );
        setFeedbackModalOpen(true);
      }
    }
  };

  const handleCloseModal = () => {
    setAddlocationName("");
    setAddsales("");
    setAddlatitude("");
    setAddlongitude("");
    setAddaddress("");
    setErrors({});
    setIsModalOpen(false);
  };



  const updateLocation = async (e) => {
    e.preventDefault();
    console.log("Updating location with ID:", selectLocation);
    console.log("Location Name:", locationName);
    console.log("Sales:", sales);
    console.log("Latitude:", parseFloat(latitude));
    console.log("Longitude:", parseFloat(longitude));
    console.log("Address:", address);
    console.log("Location ID:", locationId);

    if (!selectLocation) return;

    if (!validateUpdateForm()) return;

    try {
      console.log("Updating location with ID:", selectLocation);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${baseURL}/locations/${selectLocation}`,
        {
          location_name: locationName,
          // sales: parseFloat(sales),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Location updated successfully", response.data);
      // Show success feedback
      setFeedbackMessage(
        response.data?.message || "Location updated successfully."
      );
      setFeedbackModalOpen(true);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);

      const updatedLocations = await axios.get(`${baseURL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(updatedLocations.data.data || updatedLocations.data);

      const updatedLocation = await axios.get(
        `${baseURL}/locations/${selectLocation}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(
        "Verified updated location:",
        updatedLocation.data.data || updatedLocation.data
      );
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const updateSales = async () => {
    if (!locationId) return;

    try {
      const token = localStorage.getItem("token");
      console.log("Updating sales with ID:", locationId);
      const response = await axios.put(
        `${baseURL}/locationSales/${locationId}`,
        {
          monday: salesData.Monday,
          tuesday: salesData.Tuesday,
          wednesday: salesData.Wednesday,
          thursday: salesData.Thursday,
          friday: salesData.Friday,
          saturday: salesData.Saturday,
          sunday: salesData.Sunday,
          updated_by: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Sales updated successfully", response.data);
      setFeedbackMessage(
        response.data?.message || "Sales Updated successfully"
      );
      setFeedbackModalOpen(true);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleFeedbackClose = () => {
    setFeedbackModalOpen(false);

    if (
      feedbackMessage === "Employees assigned successfully." ||
      feedbackMessage?.toLowerCase().includes("assigned")
    ) {
      setIsEmployeeModalOpen(false);
    }
  };

  const filteredModalEmployees = employeeName.filter(emp => emp.roleId === modalRoleFilter);


  return (
    <div className=" py-2">
      <div className="">
        <div className="col-span-3">

          <div className="bg-gray-200 p-4 borderRadius10">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="flex md:flex-row gap-4">
                <select
                  className="input w-full md:w-auto"
                  onChange={handleLocation}
                  value={selectLocation}
                >
                  <option value="">-- Select location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>

                {/* <button
                  className="buttonSuccess w-full md:w-auto"
                  onClick={getLocation}
                >
                  Get Data
                </button> */}
              </div>
              {(activeTab === "general" || activeTab === "Sales") && (
                <button
                  className="buttonTheme w-full md:w-auto"
                  title="Add Location"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Location
                </button>
              )}
              {activeTab === "Employees" && (
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  {/* Only Admin (roleId 1) sees both buttons */}
                  {roleId === 1 && (
                    <>
                      <button
                        className="buttonTheme w-full md:w-auto"
                        title="Assign Manager"
                        onClick={() => {
                          setModalRoleFilter(2); // Only managers (roleId === 2)
                          setIsEmployeeModalOpen(true);
                        }}
                      >
                        + Assign Manager
                      </button>
                      <button
                        className="buttonTheme w-full md:w-auto"
                        title="Assign Employee"
                        onClick={() => {
                          setModalRoleFilter(3); // Only employees (roleId === 3)
                          setIsEmployeeModalOpen(true);
                        }}
                      >
                        + Assign Employee
                      </button>
                    </>
                  )}

                  {/* Only Manager (roleId 2) sees Assign Employee */}
                  {roleId === 2 && (
                    <button
                      className="buttonTheme w-full md:w-auto"
                      title="Assign Employee"
                      onClick={() => {
                        setModalRoleFilter(3);
                        setIsEmployeeModalOpen(true);
                      }}
                    >
                      + Assign Employee
                    </button>
                  )}
                </div>
              )}

            </div>
            <div className="subHeading flex  md:flex-row gap-6 mb-6">
              {["general", "Sales", "Employees"].map((tab) => (
                <label key={tab} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tabOption"
                    value={tab}
                    checked={activeTab === tab}
                    onChange={() => setActiveTab(tab)}
                    className="form-radio text-purple-600"
                  />
                  <span className="text-sm font-semibold text-slate-900 capitalize">
                    {tab}
                  </span>
                </label>
              ))}
            </div>

            <div className="space-y-6 mt-2">
              {activeTab === "general" && (
                <form onSubmit={updateLocation}>
                  <div className="card space-y-4">
                    <div className=" flex flex-col md:flex-row justify-between gap-4">
                      <div className="w-full">
                        <h4 className="subHeading">Location Name</h4>
                        <p className="paragraphThin">
                          What you normally refer to the roster location as.
                          (For example, Brisbane CBD.)
                        </p>
                      </div>
                      <div className="w-full flex flex-col items-end">
                        <input
                          type="text"
                          placeholder="Location Name"
                          className="input border border-gray-300 w-full md:w-auto"
                          value={locationName}
                          onChange={(e) => setLocationName(capitalLetter(e.target.value))}
                        />
                        {errors.locationName && (
                          <span className="text-sm text-red-600">
                            {errors.locationName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className=" flex flex-col md:flex-row justify-between gap-4">
                      <div className="w-full">
                        <h4 className="subHeading">Address</h4>
                        <p className="paragraphThin">
                          The address of the location.
                        </p>
                      </div>
                      <div className="w-full flex flex-col items-end">
                        <input
                          type="text"
                          placeholder="Address"
                          className="input border border-gray-300 w-full md:w-auto"
                          value={address}
                          onChange={(e) => setAddress(capitalLetter(e.target.value))}
                        />
                        {errors.address && (
                          <span className="text-sm text-red-600">
                            {errors.address}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className=" flex flex-col md:flex-row justify-between gap-4">
                      <div className="w-full">
                        <h4 className="subHeading">Latitude</h4>
                        <p className="paragraphThin">
                          Latitude coordinate of the location.
                        </p>
                      </div>
                      <div className="w-full flex flex-col items-end">
                        <input
                          type="text"
                          placeholder="Latitude"
                          className="input border border-gray-300 w-full md:w-auto"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                        />
                        {errors.latitude && (
                          <span className="text-sm text-red-600">
                            {errors.latitude}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className=" flex flex-col md:flex-row justify-between gap-4">
                      <div className="w-full">
                        <h4 className="subHeading">Longitude</h4>
                        <p className="paragraphThin">
                          Longitude coordinate of the location.
                        </p>
                      </div>
                      <div className="w-full flex flex-col items-end">
                        <input
                          type="text"
                          placeholder="Longitude"
                          className="input border border-gray-300 w-full md:w-auto"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                        />
                        {errors.longitude && (
                          <span className="text-sm text-red-600">
                            {errors.longitude}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectLocation && (
                      <div className="flex justify-end">
                        <button
                          className="buttonTheme w-full md:w-auto"
                          disabled={!selectLocation}
                        >
                          Update
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {activeTab === "Sales" && (
                <div className="card p-6 rounded-xl">
                  <h2 className="heading">Expected Average Sales</h2>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2"
                    >
                      <label className="font-medium text-sm text-black w-full md:w-auto">
                        {day}
                      </label>
                      <input
                        type="text"
                        value={salesData[day] === null ? 0 : salesData[day]}
                        onChange={(e) =>
                          setSalesData((prev) => ({
                            ...prev,
                            [day]: e.target.value,
                          }))
                        }
                        className="w-full md:w-1/3 px-4 py-2 text-sm border bg-white border-gray-300 rounded-md focus:outline-none"
                      />
                    </div>
                  ))}
                  {/* <div className="flex justify-end mt-6">
                    <button className="buttonSuccess w-full md:w-auto">Update</button>
                  </div> */}
                  {selectLocation && (
                    <div className="flex justify-end">
                      <button
                        className="buttonTheme w-full md:w-auto"
                        onClick={updateSales}
                        disabled={!selectLocation}
                      >
                        Update
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Employees" && (
                <div className="card rounded-xl p-6 space-y-4" key={selectLocation}>
                  {/* Header */}
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div>
                      <h4 className="heading">Employees</h4>
                      <p className="text-sm text-gray-600">
                        Employees Assigned to Office
                        <br />
                        <span className="text-xs text-gray-500">
                          Below is a list of employees assigned to Office.
                        </span>
                      </p>
                    </div>

                    {/* Right Side: Button + Search bar grouped */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* <button className="buttonTheme">+ Employee</button> */}

                      <div className="bg-white rounded-lg border border-gray-300 w-full md:w-auto">
                        {/* <div className="flex flex-row items-center px-3">
                            <FaSearch className="text-indigo-950" />
                            <input
                              type="text"
                              placeholder="Search..."
                              className="input w-full"
                            />
                          </div> */}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable List */}
                  <div className="bg-white rounded-md shadow-inner p-4 max-h-[600px] overflow-y-auto space-y-3">
                    {Array.isArray(locationEmployees) &&
                      locationEmployees.length > 0 ? (
                      locationEmployees.map((sf, index) => (
                        <div
                          key={sf.id || `staff-${index}`}
                          className="flex flex-col md:flex-row items-center justify-between px-3 py-2 border-b border-gray-100 hover:bg-gray-50 rounded-md transition gap-2"
                        >
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <CgCloseO
                              className="text-red-500 cursor-pointer"
                              onClick={(e) => handleDltLoc(e, sf.user.id)}
                            />

                            <span className="text-sm font-medium text-gray-800">
                              {sf.user.role_id == 2 ? `${sf.user.firstName} ${sf.user.lastName}(Manager)` : `${sf.user.firstName} ${sf.user.lastName}`}
                              {/* {sf.user.firstName} {sf.user.lastName} */}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No staff found for this location.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Model starts */}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          {/* <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-4xl w-full mx-4"> */}
         <Transition.Child
                       as={React.Fragment}
                       enter="ease-out duration-300"
                       enterFrom="opacity-0 scale-95 translate-y-4"
                       enterTo="opacity-100 scale-100 translate-y-0"
                       leave="ease-in duration-200"
                       leaveFrom="opacity-100 scale-100 translate-y-0"
                       leaveTo="opacity-0 scale-95 translate-y-4"
                     >
          <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
              <Dialog.Title className="heading">Add Location</Dialog.Title>
              <button
                className="text-white font-bold text-2xl"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <form className="p-6" onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 flex flex-col">
                  <label className="paragraphBold mb-2">
                    Select Location on Map
                  </label>
                  {/* <div className="flex-1 h-74 border rounded-md overflow-hidden"> */}
                  <div className="h-64 md:h-72 border rounded-md overflow-hidden">
                    <GoogleMapSelector
                      address={addaddress}
                      onLocationSelect={({ lat, lng }) => {
                        setAddlatitude(lat.toFixed(9));
                        setAddlongitude(lng.toFixed(9));
                      }}
                    />
                  </div>
                </div>
                {/* Left Column - Form */}
                <div className="flex-1 space-y-4">
                  <p className="paragraphThin text-gray-500">
                    Type your address to locate it on the map.
                  </p>
                  <div>
                    <label className="paragraphBold block mb-1">Address</label>
                    <textarea
                      className="input w-full"
                      rows={7}
                      value={addaddress}
                      onChange={(e) => setAddaddress(e.target.value)}
                    />
                    {errors.addaddress && (
                      <span className="text-sm text-red-600">
                        {errors.addaddress}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                      <label className="paragraphBold block mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={addlatitude}
                        onChange={(e) => setAddlatitude(e.target.value)}
                      />
                      {errors.addlatitude && (
                        <span className="text-sm text-red-600">
                          {errors.addlatitude}
                        </span>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="paragraphBold block mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        value={addlongitude}
                        onChange={(e) => setAddlongitude(e.target.value)}
                      />
                      {errors.addlongitude && (
                        <span className="text-sm text-red-600">
                          {errors.addlongitude}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="paragraphBold block mb-1">
                      Location Name
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={addlocationName}
                      onChange={(e) => setAddlocationName(capitalLetter(e.target.value))}
                    />
                    {errors.addlocationName && (
                      <span className="text-sm text-red-600">
                        {errors.addlocationName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="paragraphBold block mb-1">
                      Average Daily Sales ($)
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={addsales}
                      onChange={(e) => setAddsales(e.target.value)}
                    />
                    {errors.addsales && (
                      <span className="text-sm text-red-600">
                        {errors.addsales}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column - Map */}

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  // className="buttonGrey"
                  className="buttonGrey w-full sm:w-auto"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  // className="buttonTheme"
                  className="buttonTheme w-full sm:w-auto"
                >
                  Add Location
                </button>
              </div>
            </form>
          </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
      </Transition>
      {/* Location Model Ends */}
      {/* Employee Model Starts*/}

  <Transition show={isEmployeeModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
        onClose={() => setIsEmployeeModalOpen(false)}
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
          <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
              <Dialog.Title className="heading">{modalRoleFilter == 2 ? "Assign Manager" : "Assign Employee"}</Dialog.Title>
              <button
                className="text-white font-bold text-2xl"
                onClick={() => setIsEmployeeModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              className="mt-1 p-4 space-y-3"
              onSubmit={handleEmployeeSubmit}
            >
              {/* Location Name Field */}
              <div className="flex flex-col">
                <label className="paragraphBold">Location Name</label>
                <input
                  type="text"
                  className="input"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                />
                {errors.locationName && (
                  <span className="text-sm text-red-600">
                    {errors.locationName}
                  </span>
                )}
              </div>

              {/* Employee Selection */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label className="paragraphBold">Employees List</label>
                  <div className="paragraphBold flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={handleAllchecked}
                      checked={allSelected}
                    />
                    Select All
                  </div>
                </div>

                <div className="employee-checkboxes border p-2 rounded max-h-80 overflow-auto">
                  {filteredModalEmployees.length > 0 ? (
                    filteredModalEmployees.map((emp) => {
                        const isChecked = employees.includes(emp.id.toString());

                        const toggleCheckbox = () => {
                          const fakeEvent = {
                            target: {
                              value: emp.id.toString(),
                              checked: !isChecked,
                            },
                          };
                          handleChange(fakeEvent);
                        };

                        return (
                          <div
                            className="flex items-center bg-white rounded p-2 gap-3 mb-2 cursor-pointer"
                            key={emp.id}
                            onClick={toggleCheckbox}
                          >
                            <input
                              type="checkbox"
                              value={emp.id.toString()}
                              onChange={handleChange}
                              checked={isChecked}
                              onClick={(e) => e.stopPropagation()} // prevent double trigger
                            />
                            <p className="paragraph">
                              {emp.firstName} {emp.lastName}
                            </p>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-gray-500">No employees available</p>
                  )}
                </div>


                {/* <div className="employee-checkboxes border p-2 rounded max-h-80 overflow-auto">
                  {employeeName.length > 0 ? (
                    employeeName.map((emp) => (
                      <div
                        className="flex items-center bg-white rounded p-2 gap-3 mb-2"
                        key={emp.id}
                      >
                        <input
                          type="checkbox"
                          value={emp.id.toString()}
                          onChange={handleChange}
                          checked={employees.includes(emp.id.toString())}
                        />
                        <img
                          src={emp.profileImage}
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="h-10 w-10 rounded-full"
                        />
                        <p className="paragraph">
                          {emp.firstName} {emp.lastName}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No employees available</p>
                  )}
                </div> */}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" title="Add Employee" className="buttonTheme">
                  Add
                </button>
              </div>
            </form>
          </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
      </Transition>

      {/* Employee Model Ends */}
      {/* ✅ Reusable Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        // onClose={() => setFeedbackModalOpen(false)}
        onClose={handleFeedbackClose}

        onConfirm={confirmDelete}
        showConfirmButtons={showConfirmButtons}
        message={feedbackMessage}
      />
    </div>
  );
};

export default Location;
