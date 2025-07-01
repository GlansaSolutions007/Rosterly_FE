import moment from "moment";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  FaRegClock,
  FaMapMarkerAlt,
  FaUserTimes,
  FaAngleLeft,
  FaAngleRight,
  FaClock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { getDistance } from "geolib";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import { getRoleId } from "../Component/RoleId";
import axios from "axios";
import { SlCalender } from "react-icons/sl";
import { Dialog, Transition } from "@headlessui/react";

const Rosterly = () => {
  const userName = localStorage.getItem("firstName");
  const baseURL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const loginId = localStorage.getItem("id");
  // State updates
  const [activeTimer, setActiveTimer] = useState(null);
  const [isShiftFinished, setIsShiftFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0); // current mode's elapsed
  const [breakElapsed, setBreakElapsed] = useState(0);
  const [shiftElapsed, setShiftElapsed] = useState(0);
  const getCurrentWeekStart = () => {
    const today = moment();
    const day = today.day();
    return today.subtract((day >= 3 ? day - 3 : 7 - (3 - day)), 'days'); // go to this week’s Wednesday
  };
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekStart());
  const [isAtStore, setIsAtStore] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftEndTime, setShiftEndTime] = useState(null);
  const [rWeekStartDate, setRWeekStartDate] = useState("");
  const [rWeekEndDate, setRWeekEndDate] = useState("");
  const [weekId, setWeekId] = useState(null);
  const [rosterData, setRosterData] = useState([]);
  const [endWeekDay, setEndWeekDay] = useState("");
  const [startWeekDay, setStartWeekDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalShiftHour, setTotalShiftHour] = useState('');
  const [shiftBreak, setShiftBreak] = useState('');
  const [locationName, setLocationName] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [todayShift, setTodayShift] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // for DB
  const [locLatitude, setLocLatitude] = useState([]);
  const [locLongitude, setLocLognitude] = useState([]);
  const [shiftData, setShiftData] = useState([]);


  useEffect(() => {
    if (weekId) {
      // This will run AFTER weekId is updated
      console.log("Updated Week ID:", weekId);
      // You can perform dependent actions here
    }
  }, [weekId]);

  // useEffect(() => {
  //   console.log("LocLatitude: ", locLatitude, "LocLognitude: ", locLongitude);
  // }, [locLatitude, locLongitude]);

  // Starts a timer that ticks every second
  const shiftStartTimeRef = useRef(null);
  const breakStartTimeRef = useRef(null);
  const timerRef = useRef(null);
  const accumulatedShiftRef = useRef(0);
  const accumulatedBreakRef = useRef(0);

  const startTimer = (type) => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();

      if (type === "shift" && shiftStartTimeRef.current) {
        const currentElapsed = now - shiftStartTimeRef.current;
        const totalShiftElapsed = accumulatedShiftRef.current + currentElapsed;
        setShiftElapsed(Math.floor(totalShiftElapsed / 1000));
      }

      if (type === "break" && breakStartTimeRef.current) {
        const currentBreakElapsed = now - breakStartTimeRef.current;
        const totalBreakElapsed = accumulatedBreakRef.current + currentBreakElapsed;
        setBreakElapsed(Math.floor(totalBreakElapsed / 1000));
      }
    }, 1000);
  };

  // Stops any running timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const formatTimeForAPI = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toTimeString().split(" ")[0]; // Returns HH:mm:ss
  };

  const getWeekRange = (week) => {
    const startOfWeek = moment(week).isoWeekday(3); // Wednesday
    const endOfWeek = moment(startOfWeek).add(6, "days"); // Tuesday

    return {
      displayRange: `${startOfWeek.format("DD MMM")} - ${endOfWeek.format(
        "DD MMM"
      )}`,
      startDate: startOfWeek.format("YYYY-MM-DD"),
      endDate: endOfWeek.format("YYYY-MM-DD"),
    };
  };
  const { displayRange, startDate, endDate } = getWeekRange(currentWeek);

  useEffect(() => {
    const fetchDashboardCards = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${baseURL}/dashboardCards`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              rWeekStartDate: startDate,
              rWeekEndDate: endDate,
            },
          } // ✅ your Laravel endpoint
        );
        const shiftData = response.data.RosterData;
        setShiftData(shiftData);
        console.log(shiftData, "bhaaaaiaiiiiii");
      } catch (error) {
        console.error("Error fetching dashboard cards:", error);
      } finally {
        setLoading(false);
      }
    };
    if (startDate && endDate) {
      fetchDashboardCards();
    }
    console.log(startDate, "and", endDate);
  }, [startDate, endDate]);

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => moment(prev).subtract(1, "week"));
  };
  const handleNextWeek = () => {
    setCurrentWeek((prev) => moment(prev).add(1, "week"));
  };

  const getDaysForWeek = (date) => {
    const day = moment(date).day();
    const start = moment(date).subtract((day >= 3 ? day - 3 : 7 - (3 - day)), 'days'); // get nearest past Wednesday
    return Array.from({ length: 7 }, (_, i) =>
      start.clone().add(i, "days").format("ddd, DD/MM")
    );
  };



  const days = getDaysForWeek(currentWeek);

  const logAttendanceAction = async (actionType) => {
    if (!todayShift) {
      console.warn("No todayShift data available for logging.");
      return;
    }
    try {
      const response = await axios.post(`${baseURL}/attendance/log`, {
        user_id: loginId,
        roster_id: todayShift?.rosterId,
        action_type: actionType,
        location: todayShift?.location_Id,
        remarks: "",
      });

      if (response.data.status) {
        console.log(`${actionType} logged successfully.`);
      } else {
        console.warn(`Failed to log ${actionType}:`, response.data.message);
      }
    } catch (error) {
      console.error(`Error logging ${actionType}:`, error.message);
    }
  };


  const handleShiftToggle = async () => {
    if (isShiftFinished) return;

    const now = Date.now();

    if (!shiftStartTime) {
      setShiftStartTime(now);
      localStorage.setItem("shiftStartTime", now);
      shiftStartTimeRef.current = now;
      localStorage.setItem("shiftStartTimeRef", now.toString());
      await logAttendanceAction("start");
    } else if (activeTimer === "break" && breakStartTimeRef.current) {
      // End break
      const breakElapsed = now - breakStartTimeRef.current;
      accumulatedBreakRef.current += breakElapsed;
      localStorage.setItem("accumulatedBreak", accumulatedBreakRef.current.toString());
      setBreakElapsed(Math.floor(accumulatedBreakRef.current / 1000));
      breakStartTimeRef.current = null;
      localStorage.removeItem("breakStartTime");
      await logAttendanceAction("break_end");
    }

    stopTimer();
    if (!shiftStartTimeRef.current) {
      shiftStartTimeRef.current = now;
      localStorage.setItem("shiftStartTimeRef", now.toString());
    }
    setActiveTimer("shift");
    localStorage.setItem("activeTimer", "shift");
    startTimer("shift");
  };

  const handleBreakToggle = async () => {
    if (isShiftFinished) return;

    const now = Date.now();

    if (activeTimer === "shift" && shiftStartTimeRef.current) {
      // Pause shift
      const elapsed = now - shiftStartTimeRef.current;
      accumulatedShiftRef.current += elapsed;
      localStorage.setItem("accumulatedShift", accumulatedShiftRef.current.toString());
      setShiftElapsed(Math.floor(accumulatedShiftRef.current / 1000));
      shiftStartTimeRef.current = null;
      localStorage.removeItem("shiftStartTimeRef");
      stopTimer();
    }

    if (activeTimer === "break" && breakStartTimeRef.current) {
      // End break
      const elapsed = now - breakStartTimeRef.current;
      accumulatedBreakRef.current += elapsed;
      localStorage.setItem("accumulatedBreak", accumulatedBreakRef.current.toString());
      setBreakElapsed(Math.floor(accumulatedBreakRef.current / 1000));
      breakStartTimeRef.current = null;
      localStorage.removeItem("breakStartTime");
      await logAttendanceAction("break_end");

      // Resume shift
      shiftStartTimeRef.current = now;
      localStorage.setItem("shiftStartTimeRef", now.toString());
      setActiveTimer("shift");
      localStorage.setItem("activeTimer", "shift");
      startTimer("shift");
    } else {
      // Start break
      stopTimer();
      breakStartTimeRef.current = now;
      localStorage.setItem("breakStartTime", now.toString());
      setActiveTimer("break");
      localStorage.setItem("activeTimer", "break");
      await logAttendanceAction("break_start");
      startTimer("break");
    }
  };

  const handleFinishShift = async () => {
    stopTimer();
    const now = Date.now();
    if (shiftStartTimeRef.current) {
      const elapsed = now - shiftStartTimeRef.current;
      accumulatedShiftRef.current += elapsed;
      setShiftElapsed(Math.floor(accumulatedShiftRef.current / 1000));
    }
    if (breakStartTimeRef.current) {
      const elapsed = now - breakStartTimeRef.current;
      accumulatedBreakRef.current += elapsed;
      setBreakElapsed(Math.floor(accumulatedBreakRef.current / 1000));
      breakStartTimeRef.current = null;
    }

    setShiftEndTime(now);
    setIsShiftFinished(true);
    setActiveTimer(null);

    // Prepare data for generatetimesheet endpoint
    const shiftMinutes = Math.floor(accumulatedShiftRef.current / 1000 / 60); // Convert milliseconds to minutes
    const breakMinutes = Math.floor(accumulatedBreakRef.current / 1000 / 60); // Convert milliseconds to minutes
    const date = moment().format("YYYY-MM-DD"); // Current date in YYYY-MM-DD format
    const startTime = formatTimeForAPI(shiftStartTime); // HH:mm:ss format
    const endTime = formatTimeForAPI(now); // HH:mm:ss format

    try {
      const response = await axios.post(`${baseURL}/generatetimesheet`, {
        user_id: loginId,
        roster_id: todayShift?.rosterId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        break_minutes: breakMinutes,
        shift_minutes: shiftMinutes,
      });

      if (response.data.status) {
        console.log("Timesheet generated successfully.");
      } else {
        console.warn("Failed to generate timesheet:", response.data.message);
      }
    } catch (error) {
      console.error("Error generating timesheet:", error.message);
    }

    localStorage.removeItem("shiftStartTime");
    localStorage.removeItem("shiftStartTimeRef");
    localStorage.removeItem("activeTimer");
    localStorage.removeItem("breakStartTime");
    localStorage.removeItem("accumulatedBreak");
    localStorage.removeItem("accumulatedShift");
    localStorage.removeItem("todayShift");

    await logAttendanceAction("end");
    setIsModalOpen(true); // Open the modal after finishing the shift
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };


  useEffect(() => {
    const savedShiftStart = localStorage.getItem("shiftStartTime");
    const savedBreakStart = localStorage.getItem("breakStartTime");
    const savedActiveTimer = localStorage.getItem("activeTimer");
    const savedBreakElapsed = localStorage.getItem("accumulatedBreak");
    const savedAccumulatedShift = localStorage.getItem("accumulatedShift");
    const storedLocation = localStorage.getItem("locationName");
    const storedDate = localStorage.getItem("todayDate");
    const storedTodayShift = localStorage.getItem("todayShift");
    const storedShiftStartRef = localStorage.getItem("shiftStartTimeRef");
    const totalHours = localStorage.getItem("totalShiftHour");
    const breakTime = localStorage.getItem("shiftBreak");

    if (breakTime) setShiftBreak(breakTime);
    if (totalHours) setTotalShiftHour(totalHours);
    if (storedTodayShift) setTodayShift(JSON.parse(storedTodayShift));
    if (storedLocation) setLocationName(storedLocation);
    if (storedDate) setTodayDate(storedDate);

    if (savedAccumulatedShift) {
      accumulatedShiftRef.current = parseInt(savedAccumulatedShift, 10);
      setShiftElapsed(Math.floor(accumulatedShiftRef.current / 1000));
    }

    if (savedBreakElapsed) {
      accumulatedBreakRef.current = parseInt(savedBreakElapsed, 10);
      setBreakElapsed(Math.floor(accumulatedBreakRef.current / 1000));
    }

    if (savedShiftStart) {
      setShiftStartTime(parseInt(savedShiftStart, 10));
    }

    if (storedShiftStartRef && savedActiveTimer === "shift") {
      shiftStartTimeRef.current = parseInt(storedShiftStartRef, 10);
      setActiveTimer("shift");
      startTimer("shift");
    }

    if (savedBreakStart && savedActiveTimer === "break") {
      breakStartTimeRef.current = parseInt(savedBreakStart, 10);
      setActiveTimer("break");
      startTimer("break");
    }

    if (savedActiveTimer) {
      setIsAtStore(true);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();

        if (activeTimer === "shift" && shiftStartTimeRef.current) {
          stopTimer();
          startTimer("shift");
        } else if (activeTimer === "break" && breakStartTimeRef.current) {
          stopTimer();
          startTimer("break");
        }
      } else {
        stopTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const formatDisplayTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };


  // 17.43920120470179, 78.38736913783626 (Glansa Solutions)
  const STORE_LOCATION = {
    latitude: 17.4391091,
    longitude: 78.3873906,
  };

  const ALLOWED_RADIUS_METERS = 100; // e.g., 500m radius

  const checkLocation = async () => {
    setIsCheckingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Current Latitude:", latitude);
        console.log("Current Longitude:", longitude);
        try {
          const response = await axios.get(`${baseURL}/rosterWeekDay`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              latitude: latitude,
              longitude: longitude,
              rWeekStartDate: startDate,
              rWeekEndDate: endDate,
            },
          });

          const rosterWeekData = response.data.rosterWeekId;
          const weekId = rosterWeekData.length > 0 ? rosterWeekData[0].id : null;
          const locationId = rosterWeekData.length > 0 ? rosterWeekData[0].location_id : null;
          console.log('rosterweek', rosterWeekData);


          if (!weekId || !locationId) {
            setIsAtStore(false);
            setLocationError("No shift assigned to your current location.");
            setIsCheckingLocation(false);
            return;
          }

          const dashRes = await axios.get(`${baseURL}/dashboardData`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              locationId: locationId,
              rosterWeekId: weekId,
            },
          });

          const dashData = dashRes.data.RosterData || [];

          const foundShift = dashData.find((shift) =>
            moment(shift.date).isSame(moment(), "day")
          );
          setTodayShift(foundShift);

          if (foundShift) {
            setTotalShiftHour(foundShift.totalHrs || "0");
            setShiftBreak(foundShift.breakTime || "0");
            setLocationName(foundShift.location_name);
            const formattedDate = foundShift.date.split("-").reverse().slice(0, 2).join("/");
            setTodayDate(formattedDate)
            setTodayShift(foundShift);
            localStorage.setItem("todayShift", JSON.stringify(foundShift));
            localStorage.setItem("locationName", foundShift.location_name);
            localStorage.setItem("todayDate", formattedDate);
            localStorage.setItem("totalShiftHour", foundShift.totalHrs);
            localStorage.setItem('shiftBreak', foundShift.breakTime);

            setIsAtStore(true);
            setLocationError("");
          } else {
            setIsAtStore(false);
            setLocationError("No shift found at your current location for today.");
          }
          console.log('dashhhh', dashData);

          // Check if today’s shift exists for the current location
          const hasTodayShiftAtLocation = dashData.some((shift) =>
            moment(shift.date).isSame(moment(), "day")
          );

          if (hasTodayShiftAtLocation) {
            setIsAtStore(true);
            setLocationError("");
          } else {
            setIsAtStore(false);
            setLocationError("No shift found at your current location for today.");
          }
        } catch (error) {
          setIsAtStore(false);
          setLocationError(error.response?.data?.message || "Error fetching shift data.");
          console.error("Failed to fetch dashboard data:", error);
        }

        setIsCheckingLocation(false);
      },


      (error) => {
        console.error("Geolocation error:", error);
        setIsAtStore(false);
        setLocationError("Unable to fetch location. Please enable location access.");
        setIsCheckingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };


  const todayShiftExists = useMemo(() => {
    return shiftData?.some((shift) =>
      moment(shift.date).isSame(moment(), "day")
    );
  }, [shiftData]);

  const colors = ["text-yellow-500", "text-pink-500", "text-indigo-500", "text-orange-500"];


  return (
    <>
      <div className="text-indigo-950">
        <p className="text-sm sm:text-base font-bold">Welcome, </p>
        <p className="text-lg sm:text-xl font-bold">
          {getRoleId() === 1 ? `${userName} (Admin)` : userName}
        </p>
      </div>
      {getRoleId() === 1 ? (
        <Dashboard />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="text-indigo-950 mt-2">
              {isAtStore ? (
                <>
                  {!isShiftFinished && (
                    <>
                      <button
                        onClick={handleShiftToggle}
                        className={`buttonSuccess mr-2 w-full sm:w-auto `}
                      >
                        {activeTimer === "shift"
                          ? "Shift Running..."
                          : activeTimer === "break"
                            ? "Resume Shift"
                            : "Start Shift"}
                      </button>

                      <button
                        onClick={handleBreakToggle}
                        className="buttonDanger mr-2 w-full sm:w-auto"
                      >
                        {activeTimer === "break" ? "Stop Break" : "Start Break"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleFinishShift}
                    className={`buttonFTheme w-full sm:w-auto ${isShiftFinished ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={isShiftFinished || !shiftElapsed}
                  >
                    {isShiftFinished ? "Shift Finished" : "Finish Shift"}
                  </button>
                  <div className="subHeading mt-3">Welcome to {locationName}</div>

                </>
              ) : (
                <>
                  {todayShiftExists ? (
                    <>
                      <button
                        className="buttonSuccess mt-2"
                        disabled={isCheckingLocation}
                        onClick={checkLocation}
                      >
                        {isCheckingLocation ? "Checking..." : "Check Location"}
                      </button>
                      {locationError && (
                        <p className="text-red-600 paragraph">{locationError}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600 paragraph">
                      You don’t have any shifts scheduled for today. Enjoy your day off!
                    </p>
                  )}
                </>
              )}
            </div>

            {(shiftElapsed > 0 || isShiftFinished) && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80 }}
                className="flex flex-col justify-end flex-1 text-right text-indigo-950"
              >
                <p className="subHeading">Date: {todayDate}</p>
                {shiftStartTime && (
                  <p className="subHeading text-green-800">
                    Start Time: {formatDisplayTime(shiftStartTime)}
                  </p>
                )}

                <p className="py-1 subHeading">
                  Shift Time: <strong>{formatTime(shiftElapsed)}({totalShiftHour} hrs)</strong>
                </p>
                {shiftEndTime && (
                  <p className="subHeading text-red-700">
                    End Time: {formatDisplayTime(shiftEndTime)}
                  </p>
                )}
                <p className="subHeading text-red-700">
                  Break Time: {formatTime(breakElapsed)}({shiftBreak} min)
                </p>
              </motion.div>
            )}
            <Transition show={isModalOpen} as={React.Fragment}>

              <Dialog as="div" onClose={closeModal} className="relative z-50">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/50 transition-opacity duration-300" />
                </Transition.Child>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 translate-y-4"
                  >
                    <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white shadow-xl transition-all duration-300 ease-out scale-95 opacity-0 animate-fadeIn">
                      <div className="flex flex-col p-6 ">
                        <Dialog.Title className="text-lg font-semibold mb-4 text-indigo-950 text-center mt-2 bg-gray-200 rounded-lg py-2">
                          Shift Summary
                        </Dialog.Title>
                        <p className="subHeading">Date: {todayDate}</p>
                        {shiftStartTime && (
                          <p className="subHeading ">
                            Start Time: {formatDisplayTime(shiftStartTime)}
                          </p>
                        )}
                        <p className="py-1 subHeading">
                          Shift Time: <strong>{formatTime(shiftElapsed)} ({totalShiftHour} hrs)</strong>
                        </p>
                        {shiftEndTime && (
                          <p className="subHeading ">
                            End Time: {formatDisplayTime(shiftEndTime)}
                          </p>
                        )}
                        <p className="subHeading ">
                          Break Time: {formatTime(breakElapsed)} ({shiftBreak} min)
                        </p>
                        <button
                          onClick={closeModal}
                          className="mt-4 buttonSuccess"
                        >
                          Close
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          </div>

          <div className="card w-full px-4 my-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h2 className="subHeading text-lg sm:text-xl text-indigo-900">
                Shift Details
              </h2>
              <div className="flex items-center justify-center bg-white rounded-lg text-sm font-semibold text-gray-900 w-full sm:w-fit px-2 py-1 border border-gray-300 shadow-sm">
                <FaAngleLeft
                  className="text-gray-800 hover:text-gray-950 cursor-pointer"
                  size={16}
                  onClick={handlePrevWeek}
                />
                <span className="mx-2 paragraphBold">{displayRange}</span>
                <FaAngleRight
                  className="text-gray-800 hover:text-gray-950 cursor-pointer"
                  size={16}
                  onClick={handleNextWeek}
                />
              </div>
            </div>

            <div className="w-full">
              {/* Flex direction changes based on screen size */}
              <div className="flex flex-col sm:flex-row gap-3">
                {days.map((dayLabel, i) => {
                  const fullDate = moment(startDate).add(i, "days").format("YYYY-MM-DD");
                  const shifts = shiftData.filter((item) => item.date === fullDate);

                  return (
                    <div
                      key={i}
                      className="w-full sm:w-[calc(100%/3-1rem)] p-3 border border-gray-300 rounded-md bg-white"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="text-black paragraphBold text-center mb-2 px-4 py-2 rounded-lg bg-gray-100">
                          {dayLabel}
                        </div>

                        {loading ? (
                          <p className="text-center text-gray-500 italic">Loading...</p>
                        ) : (
                          <div className="flex flex-col gap-2 text-xs text-gray-800">
                            {shifts.length > 0 ? (
                              shifts.map((shift, index) => {
                                const locationColor = colors[index % colors.length];
                                return (
                                  <div className="cardYellow w-full" key={index}>
                                    <p className="flex items-center gap-1">
                                      <SlCalender className="text-gray-600" title="Time" />
                                      {shift.startTime} - {shift.endTime}
                                    </p>

                                    <p className="flex flex-col items-start">
                                      <span className="flex gap-1 items-center">
                                        <FaClock className="text-gray-600" title="Total hours" />
                                        {shift.totalHrs} hrs
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <FaClock className="text-red-400" title="Break" />
                                        {shift.breakTime} Min Break
                                      </span>
                                    </p>

                                    <p className="flex items-center gap-1">
                                      <FaMapMarkerAlt className="text-gray-600" title="Location" />
                                      <span className={`${locationColor} font-bold`}>{shift.location_name}</span>
                                    </p>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="italic text-center text-gray-500 cardGrey">
                                No Shift Assigned
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </>
      )
      }
      {/* // <Dashboard /> */}
    </>
  );
};

export default Rosterly;
