import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaEdit, FaFilePdf, FaTrash } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { FaAngleLeft, FaPlus, FaRegCopy } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { set } from "date-fns";
import { HiTrash } from "react-icons/hi2";
import { capitalLetter } from "../Component/capitalLetter";
import FeedbackModal from "../Component/FeedbackModal";
import { percent } from "framer-motion";
import { FaTriangleExclamation } from "react-icons/fa6";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional styling


const Rosters = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("default");
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [stats, setStats] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [copiedShift, setCopiedShift] = useState(null);
  const [shiftsByEmployeeDay, setShiftsByEmployeeDay] = useState({});
  const [currentEmpId, setCurrentEmpId] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [locatedEmployees, setLocatedEmployees] = useState([]);
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedRosters, setPublishedRosters] = useState([]);
  const [isPublished, setIsPublished] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [hourRate, setHourRate] = useState(null);
  const [shiftToEdit, setShiftToEdit] = useState(null);
  const [rosterWeekId, setRosterWeekId] = useState(null);
  const [weekId, setWeekId] = useState("");
  const [publishedStates, setPublishedStates] = useState({});
  const [weekMetaByDate, setWeekMetaByDate] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const token = localStorage.getItem("token");

  const loginId = localStorage.getItem("id");

  const getWeekRange = (week) => {
    const startOfWeek = moment(week).day(3); // 3 = Wednesday
    const endOfWeek = startOfWeek.clone().add(6, "days");
    return `${startOfWeek.format("DD MMM")} - ${endOfWeek.format("DD MMM")}`;
  };

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => moment(prev).subtract(7, "days")); // subtract full week
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => moment(prev).add(7, "days")); // add full week
  };

  const getDaysForWeek = (week) => {
    const start = moment(week).day(3); // Start from Wednesday
    return Array.from({ length: 7 }, (_, i) =>
      start.clone().add(i, "days").format("ddd, DD/MM")
    );
  };

  const days = getDaysForWeek(currentWeek);

  useEffect(() => {
    if (selectedLocation) {
      postWeek();
    }
  }, [currentWeek, selectedLocation]);

  const handleLocation = (e) => {
    const newLocationId = e.target.value;
    setSelectedLocation(newLocationId);

    setLocatedEmployees([]);

    const fetchEmployees = async (id) => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${baseURL}/locations/${id}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // locatedEmployees = response.data;
        setLocatedEmployees(response.data.data);
        console.log("Employees fetched:", response.data.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    // Call with the new location id directly
    fetchEmployees(newLocationId);

    console.log("Selected Location:", newLocationId);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${baseURL}/locations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const onShiftAdd = (empId, empfirstName, day, hourRate) => {
    setCurrentEmpId(empId);
    setCurrentDay(day);
    setIsShiftOpen(true);
    setFirstName(empfirstName);
    setHourRate(hourRate);
  };

  const onShiftEdit = (empId, empFirstName, day, shift) => {
    setCurrentEmpId(empId);
    setCurrentDay(day);
    setFirstName(empFirstName);
    setStart(shift.time.split(" - ")[0]);
    setFinish(shift.time.split(" - ")[1]);
    setBreakTime(shift.breakTime);
    setDescription(shift.description);
    setShiftToEdit(shift);
    setIsShiftOpen(true);
  };

  useEffect(() => {
    if (shiftToEdit) {
      setStart(shiftToEdit.time.split(" - ")[0]);
      setFinish(shiftToEdit.time.split(" - ")[1]);
      setBreakTime(shiftToEdit.breakTime);
      setDescription(shiftToEdit.description || "");
    } else {
      setStart("");
      setFinish("");
      setBreakTime(null);
      setDescription("");
    }
  }, [shiftToEdit]);

  const handleStats = () => {
    setStats(!stats);
  };

  const generateTimeOptions = () => {
    let times = ["-- --"];
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

  const timeOptions = generateTimeOptions();
  const breakOptions = [null, 0, 15, 30, 45, 60];
  const [start, setStart] = useState(timeOptions[0]);
  const [finish, setFinish] = useState(timeOptions[0]);
  const [breakTime, setBreakTime] = useState(breakOptions[0]);
  const hoursPerDay = ["12.25", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"];

  const onDragEnd = (result) => {
    if (isPublished) return;

    const { source, destination } = result;
    if (!destination) return;

    const [sourceEmpId, sourceDay] = source.droppableId.split("-");
    const [destEmpId, destDay] = destination.droppableId.split("-");

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const sourceList = Array.from(
      (shiftsByEmployeeDay[sourceEmpId] &&
        shiftsByEmployeeDay[sourceEmpId][sourceDay]) ||
      []
    );

    const destList = Array.from(
      (shiftsByEmployeeDay[destEmpId] &&
        shiftsByEmployeeDay[destEmpId][destDay]) ||
      []
    );

    const [moved] = sourceList.splice(source.index, 1);
    const newShift = { ...moved, id: `${destEmpId}-${destDay}-${Date.now()}` };
    destList.splice(destination.index, 0, newShift);

    setShiftsByEmployeeDay((prev) => ({
      ...prev,
      [sourceEmpId]: {
        ...prev[sourceEmpId],
        [sourceDay]: sourceList,
      },
      [destEmpId]: {
        ...prev[destEmpId],
        [destDay]: destList,
      },
    }));
  };

  const handleCopy = (shift) => {
    const { id, ...shiftWithoutId } = shift;
    setCopiedShift(shiftWithoutId); // remove the original ID
  };

  const handlePaste = (empId, day) => {
    if (!copiedShift) return;
    const newShift = { ...copiedShift, id: `${empId}-${day}-${Date.now()}` };
    setShiftsByEmployeeDay((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [day]: [...(prev[empId]?.[day] || []), newShift],
      },
    }));
    setCopiedShift(null);
  };

  const handleDeleteShiftUnpublished = (empId, day, shiftId) => {
    setShiftsByEmployeeDay((prev) => {
      const currentEmpData = prev[empId] || {};
      const currentDayShifts = currentEmpData[day] || [];

      const updatedShifts = currentDayShifts.filter(
        (shift) => shift.id !== shiftId
      );

      return {
        ...prev,
        [empId]: {
          ...currentEmpData,
          [day]: updatedShifts,
        },
      };
    });
  };

  const handleDeleteShift = async (empId, day, shiftId, rosterWeekId) => {
    console.log(
      "Deleting shift:",
      empId,
      day,
      shiftId,
      selectedLocation,
      rosterWeekId
    );

    try {
      // Only call API if the shift is published (i.e., saved in DB)
      // if (shift.isPublished) {
      const response = await axios.delete(`${baseURL}/rosterDelete`, {
        data: {
          shiftId,
          locationId: selectedLocation,
          rosterWeekId,
          empId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbackMessage(response.data.message);
      setFeedbackModalOpen(true);
      console.log("Delete response:", response.data.message);

      if (!response.data.status) {
        console.error("Failed to delete shift:", response.data.message);
        return;
      }
      // }

      // Now update the local state
      setShiftsByEmployeeDay((prev) => {
        const currentEmpData = prev[empId] || {};
        const currentDayShifts = currentEmpData[day] || [];

        const updatedShifts = currentDayShifts.filter((s) => s.id !== shiftId);

        return {
          ...prev,
          [empId]: {
            ...currentEmpData,
            [day]: updatedShifts,
          },
        };
      });
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  // Handle saving the shift
  const handleShiftSave = (e) => {
    e.preventDefault();

    const isEditing = !!shiftToEdit;

    const newShift = {
      id: isEditing
        ? shiftToEdit.id
        : `${currentEmpId}-${currentDay}-${Date.now()}`,
      time: `${start} - ${finish}`,
      breakTime,
      description,
      user_id: currentEmpId,
      date: currentDay,
      weekId: weekMetaByDate[weekId],
    };

    setShiftsByEmployeeDay((prev) => {
      const currentEmpData = prev[currentEmpId] || {};
      const currentDayShifts = currentEmpData[currentDay] || [];
      const updatedShifts = isEditing
        ? currentDayShifts.map((shift) =>
          shift.id === shiftToEdit.id ? newShift : shift
        )
        : [...currentDayShifts, newShift];

      return {
        ...prev,
        [currentEmpId]: {
          ...currentEmpData,
          [currentDay]: updatedShifts,
        },
      };
    });

    console.log("Saving shift for:", currentEmpId, currentDay, newShift);
    // Reset form and close modal
    setIsShiftOpen(false);
    setStart("");
    setFinish("");
    setBreakTime("");
    setDescription("");
    setShiftToEdit(null);
  };

  const calculateNumericTotalHours = (timeRange, breakTime) => {
    if (!timeRange) return 0;

    const [startTime, endTime] = timeRange.split(" - ");
    if (!startTime || !endTime) return 0;

    const to24Hour = (timeStr) => {
      const [time, modifier] = timeStr.trim().split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return { hours, minutes };
    };

    const start = to24Hour(startTime);
    const end = to24Hour(endTime);

    const startDate = new Date(0, 0, 0, start.hours, start.minutes);
    const endDate = new Date(0, 0, 0, end.hours, end.minutes);

    let diff = (endDate - startDate) / (1000 * 60); // minutes
    if (diff < 0) diff += 1440; // overnight fix

    const breakMins = Number(breakTime) || 0;
    diff -= breakMins;

    return parseFloat((diff / 60).toFixed(2)); // total hours in decimal
  };

  //To publish the roster
  const handlePublish = async () => {
    const token = localStorage.getItem("token");

    if (!selectedLocation) {
      setFeedbackMessage(
        "Please select a location before publishing the roster."
      );
      setFeedbackModalOpen(true);
      return;
    }

    const startOfWeek = moment(currentWeek).day(3);
    const weekKey = `${startOfWeek.format("YYYY-MM-DD")}_${selectedLocation}`;
    const endOfWeek = startOfWeek.clone().add(6, "days");

    const meta = weekMetaByDate[weekKey];

    // Check if already published
    // const alreadyPublished = meta?.isPublished;

    // if (alreadyPublished) {
    //   alert("This roster has already been published.");
    //   return;
    // }

    const formattedShifts = [];

    Object.entries(shiftsByEmployeeDay).forEach(([empId, daysObj]) => {
      Object.entries(daysObj).forEach(([day, shifts]) => {
        const dayDate = moment(day, "ddd, DD/MM");
        if (
          !dayDate.isBetween(
            startOfWeek.clone().subtract(1, "day"),
            endOfWeek.clone().add(1, "day")
          )
        ) {
          return; // skip shifts not in current week
        }

        shifts.forEach((shift) => {
          formattedShifts.push({
            shiftId: shift.id,
            user_id: empId,
            date: moment(day, "ddd, DD/MM").format("YYYY-MM-DD"),
            startTime: shift.time.split(" - ")[0],
            endTime: shift.time.split(" - ")[1],
            breakTime: shift.breakTime,
            description: shift.description,
            hrsRate: shift.hrsRate || "0.00",
            percentRate: shift.percentRate || "0.00",
            totalPay: shift.totalPay || "0.00",
            status: "active",
            location_id: selectedLocation,
            totalHrs: calculateNumericTotalHours(shift.time, shift.breakTime),
          });
        });
      });
    });

    if (formattedShifts.length === 0) {
      setFeedbackMessage("No shifts to publish.");
      setFeedbackModalOpen(true);
      return;
    }
    setWeekId(weekId);
    setIsPublishing(true);
    console.log("published", formattedShifts);
    try {
      const response = await axios.post(
        `${baseURL}/porstRoster`,
        {
          rWeekStartDate: startOfWeek.format("YYYY-MM-DD"),
          rWeekEndDate: endOfWeek.format("YYYY-MM-DD"),
          locationId: selectedLocation,
          rosters: formattedShifts,
          rosterWeekId: weekId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackMessage("Roster published successfully!");
      setFeedbackModalOpen(true);
      console.log("Publish response:", response.data);
      setRosterWeekId(response.data.roster_week_id);
      // Add to published list
      setPublishedRosters((prev) => [
        ...prev,
        { location_id: selectedLocation, days },
      ]);
      console.log("days", days);
      setWeekMetaByDate((prev) => ({
        ...prev,
        [weekKey]: { weekId, isPublished: 1 },
      }));

      fetchRoster();
    } catch (error) {
      console.error("Error publishing roster:", error);
      setFeedbackMessage("Failed to publish roster. Please try again.");
      setFeedbackModalOpen(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const fetchRoster = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/rosterfetch/${selectedLocation}/${loginId}`
      );
      const rosterData = response.data.data;
      console.log("Roster data fetched:", rosterData);

      const organizedShifts = {};

      rosterData.forEach((shift) => {
        const empId = shift.user_id;
        const day = moment(shift.date).format("ddd, DD/MM");

        const formattedShift = {
          id: shift.id.toString(),
          time: `${shift.startTime} - ${shift.endTime}`,
          breakTime: shift.breakTime,
          totalPay: shift.totalPay,
          hrsRate: shift.hrsRate,
          percentRate: shift.percentRate,
          description: shift.description,
          location_id: shift.location_id,
          rosterWeekId: shift.rosterWeekId,
          userId: shift.user_id,
          date: shift.date,
          totalHrs: shift.totalHrs,
        };

        if (!organizedShifts[empId]) {
          organizedShifts[empId] = {};
        }

        if (!organizedShifts[empId][day]) {
          organizedShifts[empId][day] = [];
        }

        organizedShifts[empId][day].push(formattedShift);
      });

      setShiftsByEmployeeDay(organizedShifts);
    } catch (error) {
      console.error("Failed to fetch roster:", error);
    }
  };

  useEffect(() => {
    if (selectedLocation && currentWeek) {
      fetchRoster();
    }
  }, [selectedLocation, currentWeek]);

  const handleTogglePublish = async () => {
    const key = `${weekId}_${selectedLocation}`;
    const currentState = isPublished === 1;

    if (currentState) {
      // Unpublish
      setPublishedStates((prev) => ({ ...prev, [key]: false }));
      try {
        const response = await axios.post(
          `${baseURL}/pubUnpub/${weekId}/${selectedLocation}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsPublished(0);
        console.log("Unpublish response:", response.data);

        // Update meta locally
        const startOfWeek = moment(currentWeek).day(3);
        const weekKey = `${startOfWeek.format(
          "YYYY-MM-DD"
        )}_${selectedLocation}`;
        setWeekMetaByDate((prev) => ({
          ...prev,
          [weekKey]: { ...prev[weekKey], isPublished: 0 },
        }));
      } catch (e) {
        console.error("Failed to unpublish", e.response?.data || e.message);
      }
    } else {
      setIsPublishing(true);
      await handlePublish();

      setIsPublished(1);

      const startOfWeek = moment(currentWeek).day(3);
      const weekKey = `${startOfWeek.format("YYYY-MM-DD")}_${selectedLocation}`;
      setWeekMetaByDate((prev) => ({
        ...prev,
        [weekKey]: { ...prev[weekKey], isPublished: 1 },
      }));

      setIsPublishing(false);
    }
  };

  const handleModalClose = () => {
    setIsShiftOpen(false);
    setShiftToEdit(null);
    setCurrentEmpId(null);
    setCurrentDay(null);
    setFirstName("");
    setStart("");
    setFinish("");
    setBreakTime(null);
    setDescription("");
  };

  const postWeek = async () => {
    const token = localStorage.getItem("token");
    const startOfWeek = moment(currentWeek).day(3);
    const endOfWeek = startOfWeek.clone().add(6, "days");
    try {
      const response = await axios.post(
        `${baseURL}/rosterWeekftch`,
        {
          rWeekStartDate: startOfWeek.format("YYYY-MM-DD"),
          rWeekEndDate: endOfWeek.format("YYYY-MM-DD"),
          location_id: selectedLocation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Post week response:", response.data);
      setIsPublished(response.data.isPublished);
      setWeekId(response.data.weekId);
      // setIsPublished(response.data.isPublished);
      const { weekId, isPublished } = response.data;
      setWeekMetaByDate((prev) => ({
        ...prev,
        [`${startOfWeek.format("YYYY-MM-DD")}_${selectedLocation}`]: {
          weekId,
          isPublished,
        },
      }));
    } catch (error) {
      setIsPublished(0);
      console.error("Error posting week:", error);
    }
  };

  const calculateTotalHoursDisplay = (startTime, endTime, breakMinutes) => {
    if (!startTime || !endTime || startTime === "--" || endTime === "--")
      return "";

    const to24Hour = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return { hours, minutes };
    };

    const start = to24Hour(startTime);
    const end = to24Hour(endTime);

    const startDate = new Date(0, 0, 0, start.hours, start.minutes);
    const endDate = new Date(0, 0, 0, end.hours, end.minutes);

    let diff = (endDate - startDate) / (1000 * 60); // total minutes
    if (diff < 0) diff += 1440; // overnight shift fix

    const breakMins = Number(breakMinutes) || 0;
    diff -= breakMins;

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h ${minutes}m (${breakMins} min break)`;
  };

  const calculateShiftDuration = (timeRange, breakTime) => {
    if (!timeRange) return "";

    const [startTime, endTime] = timeRange.split(" - ");
    if (!startTime || !endTime) return "";

    const to24Hour = (timeStr) => {
      const [time, modifier] = timeStr.trim().split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return { hours, minutes };
    };

    const start = to24Hour(startTime);
    const end = to24Hour(endTime);

    const startDate = new Date(0, 0, 0, start.hours, start.minutes);
    const endDate = new Date(0, 0, 0, end.hours, end.minutes);

    let diff = (endDate - startDate) / (1000 * 60); // in minutes
    if (diff < 0) diff += 1440; // handle overnight shift

    const breakMins = Number(breakTime) || 0;
    diff -= breakMins;

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h ${minutes}m (${breakMins} min break)`;
  };

  const startOfWeek = moment(currentWeek).day(3).format("YYYY-MM-DD");
  const weekKey = `${startOfWeek}_${selectedLocation}_${loginId}`;
  const meta = weekMetaByDate[weekKey];
  // const isPublished = meta?.isPublished === 1 && meta?.userId === loginId;

  const isDayUnavailable = (employee, day) => {
    const dayMoment = moment(day, "ddd, DD/MM");
    const dayName = dayMoment.format("dddd"); // e.g., "Wednesday"
    const dateString = dayMoment.format("YYYY-MM-DD"); // e.g., "2025-06-04"

    return employee.unavail.find((unavail) => {
      if (unavail.unavailType === "Days") {
        // For specific date unavailability
        const fromDate = moment(unavail.fromDT).format("YYYY-MM-DD");
        const toDate = moment(unavail.toDT).format("YYYY-MM-DD");
        return dateString >= fromDate && dateString <= toDate;

      } else if (unavail.unavailType === "RecuDays") {
        // For recurring day unavailability (e.g., every Wednesday)
        const recurringDay = unavail.day.split(" ")[0]; // Extract day name, e.g., "Wednesday"
        return recurringDay === dayName;
      }
      return false;
    });
  };

  // Helper function to get unavailability details for display
  const getUnavailabilityDetails = (employee, day) => {
    const dayMoment = moment(day, "ddd, DD/MM");
    const dateString = dayMoment.format("YYYY-MM-DD");
    const unavail = employee.unavail.find((unavail) => {
      if (unavail.unavailType === "Days") {
        const fromDate = moment(unavail.fromDT).format("YYYY-MM-DD");
        const toDate = moment(unavail.toDT).format("YYYY-MM-DD");
        return dateString >= fromDate && dateString <= toDate;
      } else if (unavail.unavailType === "RecuDays") {
        const recurringDay = unavail.day.split(" ")[0];
        return recurringDay === dayMoment.format("dddd");
      }
      return false;
    });

    if (unavail) {
      if (unavail.unavailType === "Days") {
        const fromDate = moment(unavail.fromDT).format("DD/MM");
        const toDate = moment(unavail.toDT).format("DD/MM");
        const timeRange = moment(unavail.fromDT).format("hh:mm A");
        const endTime = moment(unavail.toDT).format("hh:mm A");

        return {
          heading: "Unavailable",
          from: `${fromDate}, ${timeRange}`,
          to: `${toDate}, ${endTime}`,
          reason: unavail.reason,
        };
      } else if (unavail.unavailType === "RecuDays") {
        const recurringDay = unavail.day.split(" ")[0]; // e.g., "Wednesday"
        if (unavail.fromDT && unavail.toDT) {
          const startTime = moment(unavail.fromDT, "hh:mm A").format("hh:mm A");
          const endTime = moment(unavail.toDT, "hh:mm A").format("hh:mm A");
          return {
            heading: "Unavailable",
            from: ` ${startTime}`,
            to: ` ${endTime}`,
            reason: unavail.reason,
          };
        } else {
          return {
            heading: "Unavailable",
            allDay: true, // Flag to indicate "All Day"
            details: "All Day",
            reason: unavail.reason || "All Day",
          };
        }
      }
    }
    return null;
  };

  const getTotalHoursPerDay = () => {
    const totals = {};
    let totalWeeklyMinutes = 0;

    days.forEach((day) => {
      let totalMinutes = 0;

      locatedEmployees.forEach((emp) => {
        const shifts = shiftsByEmployeeDay[emp.user.id]?.[day] || [];
        shifts.forEach((shift) => {
          const [startTime, endTime] = shift.time?.split(" - ") || [];
          if (startTime && endTime) {
            const to24Hour = (timeStr) => {
              const [time, modifier] = timeStr.trim().split(" ");
              let [hours, minutes] = time.split(":").map(Number);
              if (modifier === "PM" && hours !== 12) hours += 12;
              if (modifier === "AM" && hours === 12) hours = 0;
              return { hours, minutes };
            };

            const start = to24Hour(startTime);
            const end = to24Hour(endTime);
            const startDate = new Date(0, 0, 0, start.hours, start.minutes);
            const endDate = new Date(0, 0, 0, end.hours, end.minutes);

            let diff = (endDate - startDate) / (1000 * 60); // in minutes
            if (diff < 0) diff += 1440; // handle overnight shift

            const breakMins = Number(shift.breakTime) || 0;
            totalMinutes += diff - breakMins;
          }
        });
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      totals[day] = `${hours}h ${minutes}m`;
      totalWeeklyMinutes += totalMinutes;
    });

    const weeklyHours = Math.floor(totalWeeklyMinutes / 60);
    const weeklyMinutes = totalWeeklyMinutes % 60;
    totals["weekly"] = `${weeklyHours}h ${weeklyMinutes}m`;

    return totals;
  };

  const totalHoursByDay = getTotalHoursPerDay();

  const getTotalWeeklyHoursPerEmployee = () => {
    const employeeTotals = {};

    locatedEmployees.forEach((emp) => {
      if (emp.user.status === 0) return; // skip inactive employees

      let totalMinutes = 0;

      days.forEach((day) => {
        const shifts = shiftsByEmployeeDay[emp.user.id]?.[day] || [];
        shifts.forEach((shift) => {
          const [startTime, endTime] = shift.time?.split(" - ") || [];
          if (startTime && endTime) {
            const to24Hour = (timeStr) => {
              const [time, modifier] = timeStr.trim().split(" ");
              let [hours, minutes] = time.split(":").map(Number);
              if (modifier === "PM" && hours !== 12) hours += 12;
              if (modifier === "AM" && hours === 12) hours = 0;
              return { hours, minutes };
            };

            const start = to24Hour(startTime);
            const end = to24Hour(endTime);
            const startDate = new Date(0, 0, 0, start.hours, start.minutes);
            const endDate = new Date(0, 0, 0, end.hours, end.minutes);

            let diff = (endDate - startDate) / (1000 * 60); // in minutes
            if (diff < 0) diff += 1440; // handle overnight shift

            const breakMins = Number(shift.breakTime) || 0;
            totalMinutes += diff - breakMins;
          }
        });
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      employeeTotals[emp.user.id] = `${hours}h ${minutes}m`;
    });

    return employeeTotals;
  };

  const totalWeeklyHoursByEmployee = getTotalWeeklyHoursPerEmployee();

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-4 py-2">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            name="selectedLocation"
            className="input w-50 "
            value={selectedLocation}
            onChange={handleLocation}
          >
            <option value="">--Select Location--</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.location_name}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-center bg-white rounded-lg text-sm font-semibold text-gray-900 w-full md:w-75 px-2">
            <FaAngleLeft
              className="text-violet-800 hover:text-violet-950"
              size={16}
              onClick={handlePrevWeek}
            />
            <p className="paragraphBold">{getWeekRange(currentWeek)}</p>
            <FaAngleRight
              className="text-violet-800 hover:text-violet-950"
              size={16}
              onClick={handleNextWeek}
            />
          </div>

          <div className="flex gap-2">
            <div
              className="group relative flex items-center justify-center cursor-pointer bg-white rounded-lg text-sm text-gray-900 w-10 px-2"
              onClick={handleStats}
            >
              <IoStatsChartSharp className="icon50" />
              <span className="absolute top-full mt-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Statistics
              </span>
            </div>

            <div className="group relative flex items-center justify-center cursor-pointer bg-white rounded-lg text-sm text-gray-900 w-10 px-2">
              <FaFilePdf className="icon50" />
              <span className="absolute top-full mt-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                PDF
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedLocation && (
            <button
              className={`${isPublished == 0 ? "buttonSuccess" : "buttonDanger"}`}
              onClick={handleTogglePublish}
              disabled={isPublishing}
            >
              {isPublishing
                ? "Publishing..."
                : isPublished == 0
                  ? "Publish"
                  : "Unpublish"}
            </button>
          )}
        </div>
      </div>
      {stats && (
        <div className="w-full flex flex-col md:flex-row items-center justify-start gap-4 mt-6">
          <div className="card w-1/2">
            <h5 className="subHeading text-center">Mon, 7th Apr</h5>
            <div className="flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap">
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                4 Shifts
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                1.05 Hours
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                $301 Cost
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                4000 Sales
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                4% Cost vs Sales
              </p>
            </div>
          </div>

          <div className="card w-1/2">
            <h5 className="subHeading text-center">7th Apr - 13th Apr</h5>
            <div className="flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap">
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                4 Shifts
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                1.05 Hours
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                $301 Cost
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                4000 Sales
              </p>
              <p className="paragraph border p-1 border-gray-300 bg-gray-100">
                4% Cost vs Sales
              </p>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div>
          <table className="min-w-full border border-gray-300 text-sm mb-6 mt-2">
            <thead className="bg-gray-100 bgTable rounded">
              <tr>
                <th className="w-48 p-2 text-white bgTable1 text-left border border-gray-300">
                  Employee
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="p-2 text-center border border-gray-300"
                  >
                    <div className="flex flex-col items-center">
                      <span className="paragraphBold">{day}</span>
                      <span className="paragraph text-white">
                        Day Total:  {totalHoursByDay[day] || "0h 0m"}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {locatedEmployees.length === 0 && (
              <tbody>
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="p-2 text-center text-gray-600"
                  >
                    No employees to display. Please select a location or add
                    employees to this location.
                  </td>
                </tr>
              </tbody>
            )}
            <tbody>
              {locatedEmployees
                .filter((emp) => emp.user.status !== 0)
                .map((emp) => (
                  <tr key={emp.user.id} className="border border-gray-300">
                    {/* Employee Info */}
                    <td className="p-2 bg-white">
                      <div className="font-semibold">
                        {emp.user.firstName} {emp.user.lastName}({emp.user_id}){" "}
                      </div>
                      <div className="text-xs text-gray-500">
                        {emp.user.payrate} / Hr {emp.cost ? `· ${emp.cost}` : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        Weekly Hours: {totalWeeklyHoursByEmployee[emp.user.id] || "0h 0m"}
                      </div>
                    </td>

                    {/* Days Column with DragDrop */}
                    {days.map((day) => {
                      const unavail = isDayUnavailable(emp, day); // Check if day is unavailable
                      const unavailDetails = unavail
                        ? getUnavailabilityDetails(emp, day)
                        : null; // Get display details

                      return (
                        <Droppable
                          key={`${emp.user.id}-${day}`}
                          droppableId={`${emp.user.id}-${day}`}
                        >
                          {(provided) => (
                            <td
                              className="p-2 border border-gray-300"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              <div className="space-y-2">
                                {unavail && (
                                  <div className="flex justify-center items-center">
                                    <Tippy
                                      content={
                                        <div>
                                          <div className="paragraphBold">{unavailDetails?.heading}</div>
                                          {unavailDetails?.allDay ?
                                            (
                                              <div className="paragraph">{unavailDetails?.details}</div>
                                            ) : (
                                              <>
                                                <div className="paragraph">From: <span className="paragraphThin text-gray-300">{unavailDetails.from}</span></div>
                                                <div className="paragraph">To: <span className="paragraphThin text-gray-300">{unavailDetails.to}</span></div>
                                              </>
                                            )}
                                          <div className="paragraph">Reason: <span className="paragraphThin text-gray-300">{unavailDetails.reason}</span></div>
                                        </div>
                                      }
                                      placement="top"
                                    >
                                      <span>
                                        <FaTriangleExclamation className="text-red-500 cursor-pointer" />
                                      </span>
                                    </Tippy>
                                  </div>
                                )}


                                {(shiftsByEmployeeDay[emp.user.id]?.[day] || []).map(
                                  (shift, index) => (
                                    <Draggable
                                      key={shift.id}
                                      draggableId={shift.id}
                                      index={index}
                                      isDragDisabled={isPublished}
                                    >
                                      {(provided) => (
                                        <div
                                          className={`p-2 rounded flex justify-between items-center group
    ${isPublished ? 'bgTablePub cursor-default ' : 'bgTable cursor-move'} text-white`}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <div className="flex flex-col items-center justify-end w-full">
                                            <span>{shift.time}</span>
                                            <span className="text-xs text-gray-200">
                                              {calculateShiftDuration(shift.time, shift.breakTime)}
                                            </span>
                                            {/* {shift.description && (
                                            <span className="paragraphThin italic ml-2">
                                              {shift.description}
                                            </span>
                                          )} */}
                                          </div>
                                          <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <FaRegCopy
                                              className={`text-md text-green-900 rounded cursor-pointer ${isPublished ? "opacity-20 pointer-events-none" : ""}`}
                                              onClick={() => handleCopy(shift)}
                                              title="Copy Shift"
                                            />
                                            <FaEdit
                                              className={`text-md text-green-900 rounded cursor-pointer ${isPublished ? "opacity-20 pointer-events-none" : ""}`}
                                              onClick={() =>
                                                onShiftEdit(emp.user.id, emp.user.firstName, day, shift)
                                              }
                                              title="Edit Shift"
                                            />
                                            <HiTrash
                                              className="text-xl text-red-600 px-1 rounded cursor-pointer"
                                              title="Delete Shift"
                                              onClick={async () => {
                                                if (!isPublished) {
                                                  handleDeleteShiftUnpublished(emp.user.id, day, shift.id);
                                                } else {
                                                  await handleDeleteShift(
                                                    emp.user.id,
                                                    day,
                                                    shift.id,
                                                    shift.rosterWeekId
                                                  );
                                                }
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  )
                                )}
                                {provided.placeholder}
                              </div>

                              {/* Paste Button */}
                              {copiedShift &&
                                !unavail && // Keep paste disabled for unavailable days
                                !(
                                  shiftsByEmployeeDay[emp.user.id]?.[day]
                                    ?.length > 0
                                ) &&
                                !isPublished &&
                                !unavailDetails?.allDay && (
                                  <button
                                    onClick={() => handlePaste(emp.user.id, day)}
                                    className="text-xs mt-2 text-gray-500 underline cursor-pointer hover:text-green-800"
                                  >
                                    Paste
                                  </button>
                                )}

                              {/* Add Shift Button (show even if unavailable) */}
                              {!(
                                shiftsByEmployeeDay[emp.user.id]?.[day]?.length >
                                0
                              ) &&
                                !isPublished &&
                                (
                                  <div className="text-center">
                                    <button
                                      onClick={() =>
                                        emp.user.status !== 0 &&
                                        onShiftAdd(
                                          emp.user.id,
                                          emp.user.firstName,
                                          day
                                        )
                                      }
                                      className={`p-1 ${emp.user.status === 0
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-500 hover:text-green-800 cursor-pointer"
                                        }`}
                                      title={
                                        emp.user.status === 0
                                          ? "Inactive employee"
                                          : "Add Shift"
                                      }
                                      disabled={emp.user.status === 0}
                                    >
                                      <FaPlus size={12} />
                                    </button>
                                  </div>
                                )}
                            </td>
                          )}
                        </Droppable>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
            {
              locatedEmployees.length !==0 && (
                <tfoot>
                  <tr className=" font-semibold">
                    <td className="p-2 border border-gray-300 text-start" colSpan={days.length + 1}>
                      Weekly Total: {totalHoursByDay["weekly"] || "0h 0m"}
                    </td>
                  </tr>
                </tfoot>
              )
            }

          </table>
        </div>
      </DragDropContext>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50 rounded-lg"
      >
        <div className="fixed inset-0 bg-gray-700/70"></div>
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
              <Dialog.Title className="heading">Add Employee</Dialog.Title>
              <button
                className="text-white text-2xl font-bold"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form className=" p-6 space-y-3">
              <div>
                <p className="paragraph text-gray-500">
                  {" "}
                  An employee from any location can be added to this roster.
                  They will be displayed across all pages for this week only.
                  For a permanent addition to this location, change the
                  employee's profile.
                </p>
              </div>
              <div className="mt-5">
                <select name="selectedEmployee" className="inputFull">
                  <option value="default">--Select Employee--</option>
                  <option value="Location 1">Vishal</option>
                  <option value="Location 2">Harish</option>
                  <option value="Location 3">Anita</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="buttonGrey"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="buttonSuccess">
                  Save
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Transition show={isShiftOpen} as={React.Fragment}>
        <Dialog
          as="div"
          onClose={handleModalClose}
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
                    Add Shift for : "{firstName}"
                  </Dialog.Title>
                  <button
                    className="text-white text-2xl font-bold cursor"
                    onClick={handleModalClose}
                  >
                    ×
                  </button>
                </div>
                <form className="card p-6 space-y-3" onSubmit={handleShiftSave}>
                  <div className="">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Start Time */}
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

                      {/* Finish Time */}
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

                      {/* Break Time */}
                      <div className="flex flex-col">
                        <label className="paragraphBold">Break</label>
                        <select
                          className="input paragraph"
                          value={breakTime == null ? "" : breakTime}
                          onChange={(e) => setBreakTime(e.target.value)}
                        >
                          {breakOptions.map((breakOption, index) => (
                            <option key={index} value={breakOption}>
                              {breakOption} min
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {!calculateTotalHoursDisplay(start, finish, breakTime) ? (
                      <div className="text-red-600 text-xs mb-2 mt-1">
                        *Please select valid start and finish times.
                      </div>
                    ) : (
                      <div className="mb-2 ">
                        <span className="text-xs mt-1 text-gray-700">
                          Total Hours:{" "}
                          {calculateTotalHoursDisplay(start, finish, breakTime)}
                        </span>
                      </div>
                    )}

                    {/* Description Input */}
                    <label className="paragraphBold">Description:</label>
                    <textarea
                      className=" textarea paragraph"
                      rows="3"
                      placeholder="Enter description..."
                      value={description}
                      onChange={(e) =>
                        setDescription(capitalLetter(e.target.value))
                      }
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="buttonGrey"
                      onClick={handleModalClose}
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
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
      />
    </>
  );
};

export default Rosters;
