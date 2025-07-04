import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaFilePdf, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";
import axios from "axios";
import { set } from "date-fns";
import FeedbackModal from "../Component/FeedbackModal";

const TimeSheet = () => {
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("default");
  const [locatedEmployees, setLocatedEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("default");
  const [timesheetData, setTimesheetData] = useState([]);
  const [weekId, setWeekId] = useState(null);
  const [payrate, setPayrate] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

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


  const handleLocation = (e) => {
    const newLocationId = Number(e.target.value);
    setSelectedLocation(newLocationId);
    console.log("Selected Location ID:", newLocationId, "Name:", locationName);

    setLocatedEmployees([]);
    setSelectedEmployeeId("default");

    const fetchEmployees = async (id) => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${baseURL}/locations/${id}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocatedEmployees(response.data.data);
        console.log("Located Employees:", response.data.data);

      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees(newLocationId);
  };


  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${baseURL}/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(response.data);
        console.log("Locations:", response.data);

      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchTimesheet = async () => {
      const token = localStorage.getItem("token");

      if (
        selectedLocation !== "default" &&
        selectedEmployeeId !== "default" &&
        weekId !== null
      ) {

        try {
          const res = await axios.get(
            `${baseURL}/timesheet/weekly-summary?user_id=${selectedEmployeeId}&location_id=${selectedLocation}&roster_week_id=${weekId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setTimesheetData(res.data.data);
          console.log("Timesheet Data:", res.data.data);
          console.log("Selected Employee ID:", selectedEmployeeId, "Location ID:", selectedLocation, "Week ID:", weekId);


        } catch (error) {
          console.error("Failed to fetch timesheet:", error);
        }
      }
      else {
        setTimesheetData([]);
      }
    };

    fetchTimesheet();
  }, [selectedLocation, selectedEmployeeId, weekId]);

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
      setWeekId(response.data.weekId);
    } catch (error) {
      console.error("Error posting week:", error);

      if (error.response?.status === 404) {
        setTimesheetData([]);
        setWeekId(null);
      }
    }
  };

  useEffect(() => {
    if (selectedLocation !== "default") {
      postWeek();
    }
  }, [selectedLocation, currentWeek]);

  const formatTo12Hour = (timeStr) => {
    if (!timeStr || timeStr === "—") return "—";
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "—") return null;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const breakToMinutes = (breakStr) => {
    if (!breakStr || breakStr === "—") return 0;
    const match = breakStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const formatMinutesToReadable = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr`;
    return `${m} min`;
  };

  const parseActualWorkMinutes = (timeStr) => {
    if (!timeStr || timeStr === "—") return 0;

    const hrMatch = timeStr.match(/(\d+)\s*h/);
    const minMatch = timeStr.match(/(\d+)\s*m/);

    const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;

    return hours * 60 + minutes;
  };

  const calculateTimeDiff = (entry) => {
    if (
      !entry ||
      entry.scheduled_shift === "—" ||
      entry.actual_start === "—" ||
      entry.actual_end === "—"
    ) {
      return { type: "none", value: "—" };
    }

    const [start, end] = entry.scheduled_shift.split(" - ");
    const scheduledStart = timeToMinutes(start);
    const scheduledEnd = timeToMinutes(end);
    const scheduledBreak = breakToMinutes(entry.scheduled_break);
    const scheduledDuration = scheduledEnd - scheduledStart - scheduledBreak;

    const actualWork = parseActualWorkMinutes(entry.actual_work_time);

    if (actualWork > scheduledDuration) {
      return {
        type: "overtime",
        value: formatMinutesToReadable(actualWork - scheduledDuration),
      };
    }

    if (actualWork < scheduledDuration) {
      return {
        type: "lesstime",
        value: formatMinutesToReadable(scheduledDuration - actualWork),
      };
    }

    return { type: "none", value: "—" };
  };

  const timeStrToHours = (str) => {
    if (!str || str === "—") return 0;

    const hrMatch = str.match(/(\d+)\s*h(r|rs)?\b/);  // Match h, hr, hrs
    const minMatch = str.match(/(\d+)\s*m(in|ins)?\b/);

    const hours = hrMatch ? parseInt(hrMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;

    return hours + minutes / 60;
  };

  const weeklySummary = timesheetData.reduce(
    (acc, entry) => {
      const timeDiff = calculateTimeDiff(entry);

      if (timeDiff.type === "overtime") {
        acc.totalOvertime += timeStrToHours(timeDiff.value);
      }

      if (timeDiff.type === "lesstime") {
        acc.totalLessTime += timeStrToHours(timeDiff.value);
      }

      const actualHours = timeStrToHours(entry.actual_work_time);
      const overtimeHours = timeDiff.type === "overtime" ? timeStrToHours(timeDiff.value) : 0;

      acc.totalPay += (actualHours + overtimeHours) * payrate;

      if (entry.scheduled_shift !== "—") {
        const [start, end] = entry.scheduled_shift.split(" - ");
        const startMin = timeToMinutes(start);
        const endMin = timeToMinutes(end);
        const breakMin = breakToMinutes(entry.scheduled_break);
        const duration = endMin - startMin - breakMin;

        acc.totalScheduled += +(duration / 60).toFixed(2); // in hours
      }

      return acc;

    },
    {
      totalOvertime: 0,
      totalLessTime: 0,
      totalPay: 0,
      totalScheduled: 0,
    }
  );

  const handleDownloadPDF = async () => {
    if (selectedEmployeeId === "default" || !timesheetData.length) {
      setFeedbackModalOpen(true);
      setFeedbackMessage("Please select an employee with valid timesheet data.");
      return;
    }

    const employee = locatedEmployees.find(
      (emp) => emp.user.id.toString() === selectedEmployeeId
    )?.user;

    const location = locations.find(loc => loc.id.toString() === selectedLocation.toString());

    const formattedData = timesheetData.map((entry) => {
      const timeDiff = calculateTimeDiff(entry);
      const overtime = timeDiff.type === "overtime" ? timeDiff.value : "—";
      const lessTime = timeDiff.type === "lesstime" ? timeDiff.value : "—";

      const actualHours = timeStrToHours(entry.actual_work_time);
      const overtimeHours = timeDiff.type === "overtime" ? timeStrToHours(timeDiff.value) : 0;
      const pay = ((actualHours + overtimeHours) * payrate).toFixed(2);

      return {
        day: entry.date,
        scheduled_shift: entry.scheduled_shift !== "—"
          ? (() => {
            const [start, end] = entry.scheduled_shift.split(" - ");
            const duration = timeToMinutes(end) - timeToMinutes(start);
            const effective = duration - breakToMinutes(entry.scheduled_break);
            return `${entry.scheduled_shift} (${formatMinutesToReadable(effective)})`;
          })()
          : "—",
        scheduled_break: entry.scheduled_break,
        actual_working:
          entry.actual_start !== "—" && entry.actual_end !== "—"
            ? `${formatTo12Hour(entry.actual_start)} - ${formatTo12Hour(entry.actual_end)} (${entry.actual_work_time})`
            : "—",
        actual_break: entry.actual_break,
        overtime,
        less_time: lessTime,
        pay
      };
    });

    console.log("selectedLocation:", selectedLocation);
    console.log("locations:", locations);
    console.log("Resolved location name:", location?.location_name);


    const payload = {
      employee: `${employee.firstName} ${employee.lastName}`,
      week: getWeekRange(currentWeek),
      location_id: selectedLocation,
      location_name: location?.location_name || "—",
      data: formattedData,
      totalOvertime: `${weeklySummary.totalOvertime.toFixed(2)} hr`,
      totalLessTime: `${weeklySummary.totalLessTime.toFixed(2)} hr`,
      totalPay: weeklySummary.totalPay.toFixed(2),
      scheduledHours: `${weeklySummary.totalScheduled.toFixed(2)} hr`,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${baseURL}/timesheet/download-pdf`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Expect binary file
        }
      );

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${employee.firstName}_Timesheet.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Something went wrong while generating the PDF.");
    }
  };


  return (
    <div className="max-w-screen-xl mx-auto ">
      <div className="flex flex-col lg:flex-row flex-wrap justify-between items-start gap-4 py-2">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <select
            className="input w-full sm:w-60 cursor-pointer"
            value={selectedLocation}
            onChange={handleLocation}
          >
            <option value="default">--Select Location--</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name}
              </option>
            ))}
          </select>
          <select
            className="input w-full sm:w-60 cursor-pointer"
            value={selectedEmployeeId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedEmployeeId(id);
              const selectedEmp = locatedEmployees.find(
                (emp) => emp.user.id.toString() === id
              );

              if (selectedEmp) {
                setPayrate(parseFloat(selectedEmp.user.payrate));
                console.log("Selected Employee Payrate:", selectedEmp.user.payrate);

              } else {
                setPayrate(0);
              }
            }}
            disabled={!locatedEmployees.length}
          >
            {locatedEmployees.length > 0 ? (
              <>
                <option value="default">--Select Employee--</option>
                {locatedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.user.id}>
                    {emp.user.firstName} {emp.user.lastName}
                  </option>
                ))}
              </>
            ) : (
              <option value="default" disabled>
                No Employees Found
              </option>
            )}
          </select>

          <div className="flex items-center paragraphBold justify-center bg-white rounded-lg  text-gray-900 w-full sm:w-auto px-2">
            <FaAngleLeft
              className="text-gray-800 hover:text-gray-950 cursor-pointer"
              size={16}
              onClick={handlePrevWeek}
            />
            <p className="mx-2 ">{getWeekRange(currentWeek)}</p>
            <FaAngleRight
              className="text-gray-800 hover:text-gray-950 cursor-pointer"
              size={16}
              onClick={handleNextWeek}
            />
          </div>

          <div className="flex gap-2">
            {/* <div className="relative flex items-center justify-center cursor-pointer bg-white rounded-lg text-sm text-gray-900 w-10 px-2 group">
              <IoStatsChartSharp className="icon50" />
              <span className="absolute top-full mt-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Statistics
              </span>
            </div> */}
            <div onClick={handleDownloadPDF} className="relative flex items-center justify-center cursor-pointer bg-white rounded-lg text-sm text-gray-900 w-10 px-2 group">
              <FaFilePdf className="icon50" />
              <span className="absolute top-full mt-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                PDF Download
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-5 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-[700px] w-full text-sm text-gray-800">
            <thead className="bg-gray-200 paragraphBold text-gray-600 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Day</th>
                <th className="px-6 py-3 text-center">Scheduled Shift</th>
                <th className="px-6 py-3 text-center">Scheduled Break Time</th>
                <th className="px-6 py-3 text-center">Actual Working Time</th>
                <th className="px-6 py-3 text-center">Actual Break Time</th>
                <th className="px-6 py-3 text-center">Overtime</th>
                <th className="px-6 py-3 text-center">Less Time</th>
                <th className="px-6 py-3 text-right">Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weekId === null ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-red-500 italic">
                    No data available for this week.
                  </td>
                </tr>
              ) : timesheetData.length > 0 ? (
                timesheetData.map((entry, index) => (
                  <tr key={index} className="paragraphThin">
                    <td className="px-4 py-1 paragraphBold text-center">
                      {(() => {
                        const [day, date] = entry.date.split(", ");
                        return (
                          <div className="flex flex-col items-center leading-tight">
                            <span>{day},</span>
                            <span>{date}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {entry.scheduled_shift !== "—"
                        ? (() => {
                          const [start, end] = entry.scheduled_shift.split(" - ");
                          const startMin = timeToMinutes(start);
                          const endMin = timeToMinutes(end);
                          const duration = endMin - startMin;
                          const breakMin = breakToMinutes(entry.scheduled_break);
                          const effectiveMin = duration - breakMin;

                          return (
                            <div className="flex flex-col items-center">
                              <span>{entry.scheduled_shift}</span>
                              <span className="text-gray-600 text-xs">({formatMinutesToReadable(effectiveMin)})</span>
                            </div>
                          );
                        })()
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">{entry.scheduled_break}</td>
                    <td className="px-6 py-3 text-center">
                      {entry.actual_start !== "—" && entry.actual_end !== "—"
                        ? (
                          <div className="flex flex-col items-center">
                            <span>
                              {formatTo12Hour(entry.actual_start)} - {formatTo12Hour(entry.actual_end)}
                            </span>
                            <span className="text-gray-600 text-xs">({entry.actual_work_time})</span>
                          </div>
                        )
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">{entry.actual_break}</td>
                    <td className="px-6 py-3 text-center text-green-700">
                      {calculateTimeDiff(entry).type === "overtime"
                        ? calculateTimeDiff(entry).value
                        : "—"}
                    </td>

                    <td className="px-6 py-3 text-center text-red-600">
                      {calculateTimeDiff(entry).type === "lesstime"
                        ? calculateTimeDiff(entry).value
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {(() => {
                        const actualHours = timeStrToHours(entry.actual_work_time);
                        const overtimeHours =
                          calculateTimeDiff(entry).type === "overtime"
                            ? timeStrToHours(calculateTimeDiff(entry).value)
                            : 0;
                        if (!payrate || isNaN(payrate)) return "$0.00";

                        const dailyPay = ((actualHours + overtimeHours) * payrate).toFixed(2);
                        return `$${dailyPay}`;

                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                days.map((dayLabel, index) => (
                  <tr key={index}>
                    <td className="px-6 py-3 paragraphBold">{dayLabel}</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-right font-semibold">$0</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {weekId !== null && (
          <>
            <div className="bg-white px-4 sm:px-6 py-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Weekly Summary ({`${locatedEmployees.find(emp => emp.user.id.toString() === selectedEmployeeId)?.user.firstName || "Employee"}, ${getWeekRange(currentWeek)}`})
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total Scheduled Hours</span>
                  <span>{weeklySummary.totalScheduled.toFixed(2)} hr</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Overtime Hours</span>
                  <span>{weeklySummary.totalOvertime.toFixed(2)} hr </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Less Time Hours</span>
                  <span>{weeklySummary.totalLessTime.toFixed(2)} hr</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Pay</span>
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    ${weeklySummary.totalPay.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            <div className="px-4 sm:px-6 py-4 border-t text-right">
              {selectedEmployeeId !== "default" ? (
                <>
                  <button className="buttonDanger ">
                    Deny
                  </button>
                  <button className="buttonTheme ml-2">
                    Approve
                  </button>

                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  – Please select an employee to enable approval –
                </div>
              )}
            </div></>
        )}

      </div>
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
      />
    </div>
  );
};

export default TimeSheet;
