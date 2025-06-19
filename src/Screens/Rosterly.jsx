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

    // If shift is starting for the first time
    if (!shiftStartTime) {
      setShiftStartTime(now);
      localStorage.setItem("shiftStartTime", now);
      await logAttendanceAction("start");
    }

    // If currently on break, end break first
    if (activeTimer === "break" && breakStartTimeRef.current) {
      const breakElapsed = now - breakStartTimeRef.current;
      accumulatedBreakRef.current += breakElapsed;
      localStorage.setItem("accumulatedBreak", accumulatedBreakRef.current);

      breakStartTimeRef.current = null;
      localStorage.removeItem("breakStartTime");

      await logAttendanceAction("break_end");
    }

    // Now start the shift
    stopTimer(); // stops any active timer
    shiftStartTimeRef.current = now;

    setActiveTimer("shift");
    localStorage.setItem("activeTimer", "shift");
    localStorage.setItem("shiftStartTimeRef", now.toString());

    startTimer("shift");
  };


  const handleBreakToggle = async () => {
    if (isShiftFinished) return;

    const now = Date.now();

    if (activeTimer === "shift") {
      const now = Date.now();
      const elapsed = now - shiftStartTimeRef.current;

      accumulatedShiftRef.current += elapsed;
      localStorage.setItem("accumulatedShift", accumulatedShiftRef.current);

      shiftStartTimeRef.current = null;
      stopTimer();
    }

    if (activeTimer === "break") {
      // End break
      stopTimer();
      const elapsed = now - breakStartTimeRef.current;

      // Update accumulated break time
      accumulatedBreakRef.current += elapsed;
      localStorage.setItem("accumulatedBreak", accumulatedBreakRef.current);

      setBreakElapsed(Math.floor(accumulatedBreakRef.current / 1000));
      breakStartTimeRef.current = null;
      localStorage.removeItem("breakStartTime");

      setActiveTimer("shift");
      localStorage.setItem("activeTimer", "shift");

      await logAttendanceAction("break_end");
      startTimer("shift");
    } else {
      // Start break
      stopTimer();

      breakStartTimeRef.current = now;
      localStorage.setItem("breakStartTime", now.toString());

      setActiveTimer("break");
      localStorage.setItem("activeTimer", "break");

      // setBreakElapsed(Math.floor(accumulatedBreakRef.current / 1000));
      await logAttendanceAction("break_start");
      startTimer("break");
    }
  };

  const handleFinishShift = async () => {
    stopTimer();
    const end = Date.now();
    if (shiftStartTimeRef.current) {
      const elapsed = end - shiftStartTimeRef.current;
      accumulatedShiftRef.current += elapsed;
    }

    setShiftElapsed(Math.floor(accumulatedShiftRef.current / 1000));
    setShiftEndTime(end);
    setIsShiftFinished(true);
    setActiveTimer(null);
    localStorage.removeItem("shiftStartTime");
    localStorage.removeItem("activeTimer");
    localStorage.removeItem("breakStartTime");
    localStorage.removeItem("accumulatedBreak");
    localStorage.removeItem("accumulatedShift");
    localStorage.removeItem("todayShift");

    await logAttendanceAction("end");
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
    const storedShiftStart = localStorage.getItem("shiftStartTimeRef");
    if (storedShiftStart) {
      shiftStartTimeRef.current = parseInt(storedShiftStart, 10);

    }
    if (storedTodayShift) {
      setTodayShift(JSON.parse(storedTodayShift));
    }
    if (storedLocation) setLocationName(storedLocation);
    if (storedDate) setTodayDate(storedDate);

    if (savedAccumulatedShift) {
      accumulatedShiftRef.current = parseInt(savedAccumulatedShift, 10);
    }

    if (savedShiftStart && savedActiveTimer === "shift") {
      shiftStartTimeRef.current = parseInt(savedShiftStart, 10);
      const now = Date.now();
      const elapsed = now - shiftStartTimeRef.current;
      setShiftElapsed(Math.floor((accumulatedShiftRef.current + elapsed) / 1000));
    }

    if (savedShiftStart) {
      const shiftStart = parseInt(savedShiftStart, 10);
      shiftStartTimeRef.current = shiftStart;
      setShiftStartTime(shiftStart);
      const elapsed = Math.floor((Date.now() - shiftStart) / 1000);
      setShiftElapsed(elapsed);
      setIsAtStore(true);
    }

    if (savedBreakElapsed) {
      const breakTotal = parseInt(savedBreakElapsed, 10);
      accumulatedBreakRef.current = breakTotal;
      setBreakElapsed(Math.floor(breakTotal / 1000));
    }

    if (savedBreakStart && savedActiveTimer === "break") {
      const breakStart = parseInt(savedBreakStart, 10);
      breakStartTimeRef.current = breakStart;
    }

    if (savedActiveTimer === "shift" || savedActiveTimer === "break") {
      setActiveTimer(savedActiveTimer);
      startTimer(savedActiveTimer);
      setIsAtStore(true);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();

        if (activeTimer === "shift" && shiftStartTimeRef.current) {
          const elapsed = now - shiftStartTimeRef.current;
          setShiftElapsed(Math.floor((accumulatedShiftRef.current + elapsed) / 1000));
        }

        if (activeTimer === "break" && breakStartTimeRef.current) {
          const elapsed = now - breakStartTimeRef.current;
          setBreakElapsed(Math.floor((accumulatedBreakRef.current + elapsed) / 1000));
        }

        stopTimer(); // Clear old interval
        if (activeTimer) startTimer(activeTimer); // Will only start if none exists
      } else {
        // When tab is hidden, stop the timer to prevent inaccurate increments
        stopTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeTimer]);

  useEffect(() => {
    return () => stopTimer(); // Cleanup on unmount
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
      <div className="text-indigo-950 p-1">
        <p className="text-sm sm:text-base font-bold">Welcome, </p>
        <p className="text-lg sm:text-xl font-bold">
          {getRoleId() === 1 ? `${userName} (Admin)` : userName}
        </p>
      </div>
      {getRoleId() === 1 ? (
        <Dashboard />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 p-1">
            <div className="text-indigo-950">
              {isAtStore ? (
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

                  <button
                    onClick={handleFinishShift}
                    className="buttonTheme w-full sm:w-auto"
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
                        className="buttonSuccess"
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
                className="flex flex-col justify-end flex-1 mt-10 text-right text-indigo-950"
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
          </div>

          {/* <div className="card w-full px-4">
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
                <span className="mx-2 paragraphBold">
                  {displayRange} ({startDate} to {endDate})
                </span>
                <FaAngleRight
                  className="text-gray-800 hover:text-gray-950 cursor-pointer"
                  size={16}
                  onClick={handleNextWeek}
                />
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] gap-4 justify-center text-center sm:text-left">
              {days.map((day, i) => {
                const fullDate = moment(rWeekStartDate)
                  .add(i, "days")
                  .format("YYYY-MM-DD");

                const shift = shiftData.find((item) => item.date === fullDate);
                return (
                  <div key={i} className="mt-2 mx-auto">
                    <div className={`${shift ? 'cardYellow' : 'cardGrey'}`}>
                      <p className="subHeading">{day}</p>
                      {shift ? (
                        <>
                          <p className="paragraph">
                            Shift Time: {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="paragraph">
                            Total Hours: {shift.totalHrs} hrs
                          </p>
                          <p className="paragraph">
                            Break Time: {shift.breakTime} min
                          </p>
                        </>
                      ) : (
                        <p className="headingBold text-gray-500">
                          No Shift Assigned
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 w-full col-span-1 sm:col-span-2 mx-auto">
                <div className="p-4 bg-gray-100 border rounded-lg h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-indigo-900 heading">
                      Give Your <strong>Unavailability</strong>
                    </h2>
                    <h2 className="text-indigo-900 subHeading">
                      date and time.
                    </h2>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      className="buttonSuccessActive w-full sm:w-1/2"
                      onClick={unavailabilityHandler}
                    >
                      Select Your Unavailability
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
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
                                      <span className={`${locationColor} font-bold` }>{shift.location_name}</span>
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
