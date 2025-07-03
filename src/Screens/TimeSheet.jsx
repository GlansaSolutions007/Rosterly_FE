import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaFilePdf, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";
import axios from "axios";
import { set } from "date-fns";

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
    const newLocationId = e.target.value;
    setSelectedLocation(newLocationId);
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
          console.log("Selected Employee ID:", selectedEmployeeId, "Location ID:", selectedLocation);


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

  return (
    <div className="max-w-screen-xl mx-auto ">
      <div className="flex flex-col lg:flex-row flex-wrap justify-between items-start gap-4 py-2">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <select
            className="input w-full sm:w-60"
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
            className="input w-full sm:w-60"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
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

          <div className="flex items-center justify-center bg-white rounded-lg text-sm font-semibold text-gray-900 w-full sm:w-auto px-2">
            <FaAngleLeft
              className="text-gray-800 hover:text-gray-950 cursor-pointer"
              size={16}
              onClick={handlePrevWeek}
            />
            <span className="mx-2">{getWeekRange(currentWeek)}</span>
            <FaAngleRight
              className="text-gray-800 hover:text-gray-950 cursor-pointer"
              size={16}
              onClick={handleNextWeek}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex items-center justify-center cursor-pointer bg-white rounded-lg text-sm text-gray-900 w-10 px-2 group">
              <IoStatsChartSharp className="icon50" />
              <span className="absolute top-full mt-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Statistics
              </span>
            </div>
            <div className="relative flex items-center justify-center cursor-pointer bg-white rounded-lg text-sm text-gray-900 w-10 px-2 group">
              <FaFilePdf className="icon50" />
              <span className="absolute top-full mt-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                PDF
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-[700px] w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase">
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
                  <tr key={index}>
                    <td className="px-6 py-3 paragraphBold">{entry.date}</td>
                    <td className="px-6 py-3 text-center">{entry.scheduled_shift}</td>
                    <td className="px-6 py-3 text-center">-</td>
                    <td className="px-6 py-3 text-center">{entry.actual_work_time}</td>
                    <td className="px-6 py-3 text-center">{entry.break_time}</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-center">—</td>
                    <td className="px-6 py-3 text-right font-semibold">$0</td>
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
                Weekly Summary (For Manager’s Log)
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total Overtime Hours</span>
                  <span>--</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Less Time Hours</span>
                  <span>--</span>
                </div>
                <div className="flex justify-between font-semibold ">
                  <span>Total Pay</span>
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    $0
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t text-right">
              {selectedEmployeeId !== "default" ? (
                <button className="buttonTheme ">
                  Approve
                </button>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  – Please select an employee to enable approval –
                </div>
              )}
            </div></>
        )}

      </div>
    </div>
  );
};

export default TimeSheet;
