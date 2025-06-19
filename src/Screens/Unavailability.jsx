import { Dialog, Transition } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPlusSquare } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import axios from "axios";
import { set } from "date-fns";
import moment from "moment";
import FeedbackModal from "../Component/FeedbackModal";
import { FaEdit } from "react-icons/fa";
import { HiTrash } from "react-icons/hi2";
import { capitalLetter } from "../Component/capitalLetter";

const Unavailability = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [editShiftOpen, setEditShiftOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectToNotify, setSelectToNotify] = useState([]);
  const [notifyToId, setNotifyToId] = useState("");
  const [managers, setManagers] = useState([]);
  const [unavailability, setUnavailability] = useState([]);
  const [errors, setErrors] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [unavailabilityId, setUnavailabilityId] = useState(null);

  const days = [
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
  ];

  // fetching the notifying manager
  const fetchNotifyingManager = async () => {
    try {
      const created_by = localStorage.getItem("createdBy");
      const response = await axios.get(`${baseURL}/users/${created_by}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // setSelectToNotify(response.data.data);

      const userData = response?.data?.data;
      if (userData) {
        setSelectToNotify([
          {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        ]);
      } else {
        console.warn("No user data returned for createdBy ID.");
      }
    } catch (error) {
      console.error("Error fetching notifying manager:", error);
    }
  };

  useEffect(() => {
    axios
      .get(`${baseURL}/get-managers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setManagers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching managers", err);
      });
  }, []);

  useEffect(() => {
    fetchNotifyingManager();
  }, []);

  const resetForm = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setReason("");
    setNotifyToId("");
    setSelectedDay("");
    setSelectToNotify([]);
    setIsEditing(false);
    setEditId(null);
    setErrors({});
  };

  // save the unavailability
  const saveUnavailability = async (e) => {
    e.preventDefault();
    // console.log(moment(fromDate).format("YYYY-MM-DD hh:mm a"));
    let validationErrors = {};

    // Check if fromDate is in the past or earlier than current time
    if (fromDate <= new Date()) {
      validationErrors.fromDate = "From Date & Time cannot be in the past.";
    }

    if (!fromDate) {
      validationErrors.fromDate = "From Date & Time is required.";
    }

    if (!toDate) {
      validationErrors.toDate = "To Date & Time is required.";
    }

    if (fromDate && toDate && fromDate >= toDate) {
      validationErrors.dateRange =
        "To Date & Time must be after From Date & Time.";
    }

    if (!notifyToId) {
      validationErrors.notifyToId = "Please select a manager to notify.";
    }

    if (!reason.trim()) {
      validationErrors.reason = "Please provide a reason.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // Prevent submit if any errors
    }
    try {
      const response = await axios.post(
        `${baseURL}/unavailability/1`,
        {
          userId: id,
          unavailType: 1,
          day: selectedDay,
          fromDT: moment(fromDate).format("YYYY-MM-DD hh:mm a"),
          toDT: moment(toDate).format("YYYY-MM-DD hh:mm a"),
          notifyTo: notifyToId,
          unavailStatus: "pending",
          reason: reason, // if you added `reason` column
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Unavailability saved:", response.data);
      resetForm();
      setFeedbackMessage(response.data?.message);
      setFeedbackModalOpen(true);
      fetchUnavailability();
      // setTimeout(() => {
      //   window.location.reload();
      // }, 3000);

      // try {
      //   const isEditMode = !!unavailabilityId; // Check if editing
      //   const url = `${baseURL}/unavailability/${isEditMode ? unavailabilityId : "1"}`;
      //   const method = isEditMode ? axios.put : axios.post;

      //   const response = await method(
      //     url,
      //     {
      //       userId: id,
      //       unavailType: 1,
      //       day: selectedDay,
      //       fromDT: moment(fromDate).format("YYYY-MM-DD hh:mm a"),
      //       toDT: moment(toDate).format("YYYY-MM-DD hh:mm a"),
      //       notifyTo: notifyToId,
      //       unavailStatus: "pending",
      //       reason: reason,
      //     },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },
      //     }
      //   );

      //   console.log("Unavailability saved:", response.data);
      //   resetForm();
      //   setFeedbackMessage(response.data?.message);
      //   setFeedbackModalOpen(true);
      //   setTimeout(() => {
      //     window.location.reload();
      //   }, 3000);
    } catch (error) {
      console.error("Error saving unavailability:", error);
      setFeedbackMessage(error.response.data?.message || "An error occurred");
      setFeedbackModalOpen(true);
    }
  };

  const updateUnavailability = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!fromDate) {
      validationErrors.fromDate = "From Date & Time is required.";
    } else if (fromDate < new Date()) {
      validationErrors.fromDate = "From Date & Time cannot be in the past.";
    }

    if (!toDate) {
      validationErrors.toDate = "To Date & Time is required.";
    }

    if (fromDate && toDate && fromDate >= toDate) {
      validationErrors.dateRange =
        "To Date & Time must be after From Date & Time.";
    }

    if (!notifyToId) {
      validationErrors.notifyToId = "Please select a manager to notify.";
    }

    if (!reason.trim()) {
      validationErrors.reason = "Please provide a reason.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const response = await axios.put(
        `${baseURL}/unavailability/${unavailabilityId}`,
        {
          userId: id,
          unavailType: 1,
          day: selectedDay,
          fromDT: moment(fromDate).format("YYYY-MM-DD hh:mm a"),
          toDT: moment(toDate).format("YYYY-MM-DD hh:mm a"),
          notifyTo: notifyToId,
          unavailStatus: "pending",
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Unavailability updated:", response.data);
      resetForm();
      setFeedbackMessage(response.data?.message);
      setFeedbackModalOpen(true);
      fetchUnavailability();
      // setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      console.error("Error updating unavailability:", error);
      setFeedbackMessage(error.response?.data?.message || "An error occurred");
      setFeedbackModalOpen(true);
    }
  };

  const generateTimeOptions = () => {
    let times = [];
    let hour = 0;
    let minute = 0;

    while (hour < 24) {
      let ampm = hour < 12 ? "AM" : "PM";
      let displayHour = hour % 12 || 12;
      let displayMinute = minute === 0 ? "00" : minute;
      times.push(`${displayHour}:${displayMinute} ${ampm}`);

      minute += 15;
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }

    return times;
  };

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");

    return `${paddedHours}:${paddedMinutes}:00`; // match backend's H:i:s
  };

  const timeOptions = generateTimeOptions();
  const [start, setStart] = useState("");
  const [finish, setFinish] = useState("");
  const [modalNotifyToId, setModalNotifyToId] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const openModal = (day) => {
    setSelectedDay(day);
    setIsShiftOpen(true);
  };

  const saveRecurringUnavailability = async (e) => {
    e.preventDefault();
    const startTime = isAllDay ? null : start;
    const finishTime = isAllDay ? null : finish;
    const recuDay = isAllDay ? `${selectedDay} (All Day)` : selectedDay;
    console.log(startTime, finishTime, modalNotifyToId, modalDescription);
    console.log(id, "ID");
    try {
      const response = await axios.post(
        `${baseURL}/unavailability/2`,
        {
          userId: id,
          day: recuDay,
          fromDT: startTime,
          toDT: finishTime,
          reason: modalDescription,
          notifyTo: modalNotifyToId,
          unavailStatus: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Recurring Unavailability saved:", response.data);
      setStart("");
      setFinish("");
      setModalNotifyToId("");
      setModalDescription("");
      setIsShiftOpen(false);
      setIsAllDay(false);
      setFeedbackMessage(response.data?.message);
      setFeedbackModalOpen(true);
      console.log(start, finish, "Time");
      // setTimeout(() => {
      //   window.location.reload();
      // }, 3000);
      fetchUnavailability();
    } catch (error) {
      console.error("Error saving recurring unavailability:", error);
      setFeedbackMessage(error.response.data?.message || "An error occurred");
      setFeedbackModalOpen(true);
    }
  };

  const fetchUnavailability = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/unavailability/login/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnavailability(response.data.data);
      console.log("Unavailability data:", response.data.data);
    } catch (error) {
      console.error("Error fetching unavailability:", error);
    }
  };
  useEffect(() => {
    fetchUnavailability();
  }, []);

  const daysOff = unavailability.filter(
    (item) => item.unavailType.toLowerCase() === "days"
  );

  const recurringUnavailability = unavailability.filter(
    (item) => item.unavailType.toLowerCase() === "recudays"
  );

  const formatDate = (datetime) => {
    return new Date(datetime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCloseModal = () => {
    setIsShiftOpen(false);
    setEditShiftOpen(false);
    setSelectedDay("");
    setIsAllDay(false);
    setStart("");
    setFinish("");
    setModalNotifyToId("");
    setModalDescription("");
  };
  const handleEdit = (item) => {
    setIsEditing(true);
    setUnavailabilityId(item.id);
    setEditId(item.id);
    setFromDate(new Date(item.fromDT));
    setToDate(new Date(item.toDT));
    setReason(item.reason || "");
    setNotifyToId(item.notifyTo);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4  py-2 my-4">
        <div className="flex flex-col gap-4 w-full lg:w-[60%]">
          <div className="card w-full">
            <h1 className="heading">Unavailable Days</h1>
            <form onSubmit={saveUnavailability}>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="">
                    <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                      <label className="paragraphBold whitespace-nowrap">
                        From Date & Time:
                      </label>
                      <DatePicker
                        className="mixedInput custom-focus z-9999999"
                        selected={fromDate}
                        onChange={(date) => setFromDate(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        customInput={
                          <div className="rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer w-full bg-white-100 ">
                            <span className="black-100 font12">
                              {fromDate.toLocaleString("en-US", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                            <svg
                              className="w-4 h-4 texttheme"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.879a1 1 0 011.414 1.414l-4 4.586a1 1 0 01-1.414 0l-4-4.586a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        }
                      />
                    </div>
                    {errors.fromDate && (
                      <p className="text-red-500 text-sm">{errors.fromDate}</p>
                    )}
                  </div>

                  <div className="">
                    <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                      <label className="paragraphBold whitespace-nowrap">
                        To Date & Time:
                      </label>
                      <DatePicker
                        className="mixedInput custom-focus"
                        selected={toDate}
                        onChange={(date) => setToDate(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy h:mm aa"
                        customInput={
                          <div className="rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer w-full bg-white-100 ">
                            <span className="black-100 font12">
                              {toDate.toLocaleString("en-Us", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                            <svg
                              className="w-4 h-4 texttheme"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.879a1 1 0 011.414 1.414l-4 4.586a1 1 0 01-1.414 0l-4-4.586a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        }
                      />
                    </div>
                    {errors.toDate && (
                      <p className="text-red-500 text-sm">{errors.toDate}</p>
                    )}
                    {errors.dateRange && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dateRange}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="paragraphBold block mb-2">
                    Select a manager to notify
                  </label>
                  {/* <select
                    className="input w-full p-3 custom-focus"
                    onChange={(e) => setNotifyToId(e.target.value)}
                    onClick={fetchNotifyingManager}
                  >
                    <option value="">-- Select --</option>
                    {selectToNotify.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select> */}

                  <select
                    className="input w-full p-3 custom-focus"
                    onChange={(e) => setNotifyToId(e.target.value)}
                    // onChange={(e) => setNotifyToId(Number(e.target.value))}
                    onClick={fetchNotifyingManager}
                    value={notifyToId}
                  >
                    <option value="">-- Select --</option>
                    {selectToNotify.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>

                  {errors.notifyToId && (
                    <p className="text-red-500 text-sm">{errors.notifyToId}</p>
                  )}
                </div>

                <div>
                  <label className="paragraphBold block mb-2">
                    Please provide a brief reason
                  </label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(capitalLetter(e.target.value))}
                    className="textarea w-full p-3 resize-none custom-focus"
                    placeholder="Type your reason here..."
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm">{errors.reason}</p>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-2">
                  {/* <button className="buttonSuccess button font12 font-semibold px-4 py-2 rounded-md">
                    Save
                  </button> */}

                  {/* <button className="buttonSuccess button font12 font-semibold px-4 py-2 rounded-md">
                    {isEditing ? "Update" : "Save"}
                  </button>
                  {isEditing && (
                    <button
                      onClick={resetForm}
                      type="button"
                      className="buttonDanger button font12 font-semibold px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  )} */}
                  {!isEditing ? (
                    <button
                      onClick={saveUnavailability}
                      className="buttonSuccess button font12 font-semibold px-4 py-2 rounded-md"
                    >
                      Submit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={updateUnavailability}
                        className="buttonSuccess button font12 font-semibold px-4 py-2 rounded-md"
                      >
                        Update
                      </button>
                      <button
                        onClick={resetForm}
                        type="button"
                        className="buttonDanger button font12 font-semibold px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* <button
                    onClick={resetForm}
                    className="buttonDanger button font12 font-semibold px-4 py-2 rounded-md"
                  >
                    Reset
                  </button> */}
                </div>
              </div>
            </form>
          </div>

          <div className="card rounded-md p-5 overflow-auto">
            <h1 className="subHeading">Requested Days Off</h1>
            {daysOff.length > 0 ? (
              
                daysOff.map((item) => (
                  <div key={item.id} className="py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="paragraphBold">
                          {formatDate(item.fromDT)} ({formatTime(item.fromDT)}) -{" "}
                          {formatDate(item.toDT)} ({formatTime(item.toDT)})
                        </p>

                        {item.reason && (
                          <p className="paragraphThin">
                            {item.reason || "No reason provided"}
                          </p>
                        )}

                        <p
                          className={`paragraphThin mt-1 text-sm italic ${item.unavailStatus === 0
                              ? "text-red-500"
                              : item.unavailStatus === 1
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                        >
                          {item.unavailStatus === 0
                            ? "Pending"
                            : item.unavailStatus === 1
                              ? "Approved"
                              : "Denied"}
                        </p>
                      </div>
                      {/* <button className="black-100 hover:texttheme mt-1 cursor-pointer">
                    <FaPencilAlt className="w-4 h-4" />
                  </button> */}
                      {item.unavailStatus === 1 ? null : (
                        <button
                          className="black-100 hover:texttheme mt-1 cursor-pointer"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <hr className="white-300" />
                  </div>
                ))
              
            ) :
              (
                <p className="paragraph">No data available</p>
              )}

          </div>
        </div>

        <div className="card rounded-md p-5 w-full lg:w-[40%]">
          <h1 className="text-center subHeading">Recurring Unavailability</h1>

          {days.map((day, index) => {
            const matchingUnavailability = recurringUnavailability.filter(
              (item) => item.day?.startsWith(day)
            );

            return (
              <div
                key={index}
                className="flex rounded-md justify-between p-5 my-3 bg-white-100 items-center"
              >
                <div className="flex flex-col">
                  <p
                    className={`paragraphBold ${day === "Saturday" || day === "Sunday"
                        ? "text-black-600"
                        : ""
                      }`}
                  >
                    {day}
                  </p>

                  {/* Show unavailability for this day */}
                  {matchingUnavailability.length > 0 &&
                    matchingUnavailability.map((item) => (
                      <div key={item.id}>
                        <div className="flex ">
                          <p className="paragraph text-sm ">
                            {item.day} {item.fromDT} - {item.toDT}
                          </p>{" "}
                          (
                          <p
                            className={`paragraphThin text-sm italic ${item.unavailStatus === 0
                                ? "text-red-500"
                                : item.unavailStatus === 2
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                          >
                            {item.unavailStatus === 0
                              ? "Pending"
                              : item.unavailStatus === 1
                                ? "Approved"
                                : "Denied"}
                          </p>
                          )
                        </div>
                        {item.reason && (
                          <p className="paragraphThin text-sm ">
                            {item.reason || "No reason provided"}
                          </p>
                        )}
                      </div>
                    ))}
                </div>

                <div
                  className="mt-2 sm:mt-0 sm:ml-4 cursor-pointer"
                  onClick={() => {
                    if (matchingUnavailability.length === 0) {
                      openModal(day); // Open Add modal
                    } else if (matchingUnavailability[0].unavailStatus === 1) {
                      setSelectedDay(day); // Set the selected day
                      setEditShiftOpen(true); // Open Edit modal
                    }
                    // If unavailStatus is 0, do nothing (no icon shown anyway)
                  }}
                >
                  {matchingUnavailability.length === 0 ? (
                    <FaPlusSquare className="text-indigo-900 text-xl" />
                  ) : matchingUnavailability[0].unavailStatus === 0 ||
                    matchingUnavailability[0].unavailStatus ===
                    1 ? // <FaEdit />
                    null : // <HiTrash className="text-red-700 text-xl" />
                    null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Transition show={isShiftOpen} as={React.Fragment}>
        <Dialog
          as="div"
          onClose={() => setIsShiftOpen(false)}
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
                  <Dialog.Title className="heading">
                    Add Unavailability for {selectedDay}
                  </Dialog.Title>
                  <button
                    className="text-white text-2xl font-bold cursor"
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>
                <form
                  className="card p-6 space-y-3"
                  onSubmit={saveRecurringUnavailability}
                >
                  <p className="paragraph text-gray-500">
                    Enter the times that you will NOT be available.
                  </p>

                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="allDay"
                        checked={isAllDay}
                        onChange={() => setIsAllDay(!isAllDay)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="allDay" className="paragraphBold">
                        All Day
                      </label>
                    </div>
                    {!isAllDay && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col">
                          <label className="paragraphBold">Start</label>
                          <select
                            className="input paragraph"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                          >
                            {timeOptions.map((time, index) => (
                              <option key={index} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="paragraphBold">Finish</label>
                          <select
                            className="input paragraph"
                            value={finish}
                            onChange={(e) => setFinish(e.target.value)}
                          >
                            {timeOptions.map((time, index) => (
                              <option key={index} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="paragraphBold block mb-4">
                        Select a manager to notify
                      </label>
                      <select
                        className="input w-full p-3 custom-focus"
                        onChange={(e) => setModalNotifyToId(e.target.value)}
                        onClick={fetchNotifyingManager}
                      >
                        <option>-- Select --</option>
                        {selectToNotify.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="paragraphBold">Description:</label>
                    <textarea
                      className=" textarea paragraph"
                      rows="3"
                      placeholder="Enter description..."
                      value={modalDescription}
                      onChange={(e) =>
                        setModalDescription(capitalLetter(e.target.value))
                      }
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="buttonGrey"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="buttonSuccess">
                      Save
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <Dialog
        open={editShiftOpen}
        onClose={() => setEditShiftOpen(false)}
        className="relative z-50 rounded-lg"
      >
        <div className="fixed inset-0 bg-gray-700/70"></div>
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
              <Dialog.Title className="heading">
                Edit Unavailability
              </Dialog.Title>
              <button
                className="text-white text-2xl font-bold cursor"
                onClick={() => setEditShiftOpen(false)}
              >
                ×
              </button>
            </div>
            <form
              className="card p-6 space-y-3"
            // onSubmit={saveRecurringUnavailability}
            >
              <p className="paragraph text-gray-500">
                Enter the times that you will NOT be available.
              </p>

              <div className="mt-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="paragraphBold">Start</label>
                    <select
                      className="input paragraph"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                    >
                      {timeOptions.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="paragraphBold">Finish</label>
                    <select
                      className="input paragraph"
                      value={finish}
                      onChange={(e) => setFinish(e.target.value)}
                    >
                      {timeOptions.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="paragraphBold block mb-4">
                    Select a manager to notify
                  </label>
                  <select
                    className="input w-full p-3 custom-focus"
                    onChange={(e) => setModalNotifyToId(e.target.value)}
                    onClick={fetchNotifyingManager}
                  >
                    <option>-- Select --</option>
                    {selectToNotify.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="paragraphBold">Description:</label>
                <textarea
                  className=" textarea paragraph"
                  rows="3"
                  placeholder="Enter description..."
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="buttonDanger">
                  Delete
                </button>
                <button
                  type="button"
                  className="buttonGrey"
                  onClick={() => setEditShiftOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="buttonSuccess">
                  Update
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
      />
    </>
  );
};

export default Unavailability;
