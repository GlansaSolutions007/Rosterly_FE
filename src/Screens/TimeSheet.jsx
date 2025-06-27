import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaFilePdf, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";
import axios from "axios";

const TimeSheet = () => {
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("default");
  const [locatedEmployees, setLocatedEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("default");

  const getWeekRange = (week) => {
    const startOfWeek = moment(week).startOf("isoWeek").format("DD MMM");
    const endOfWeek = moment(week).endOf("isoWeek").format("DD MMM");
    return `${startOfWeek} - ${endOfWeek}`;
  };

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => moment(prev).subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => moment(prev).add(1, "week"));
  };

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

  const selectedEmployee = locatedEmployees.find(
    (emp) => emp.id.toString() === selectedEmployeeId
  );
  const weekData = [
    { day: "Monday", pay: 1500 },
    { day: "Tuesday", pay: 1600 },
    { day: "Wednesday", pay: 1700 },
    { day: "Thursday", pay: 1800 },
    { day: "Friday", pay: 1900 },
  ];

  const totalPay = weekData.reduce((sum, item) => sum + item.pay, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <option key={emp.id} value={emp.id}>
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
                <th className="px-6 py-3 text-center">Break Time</th>
                <th className="px-6 py-3 text-center">Actual Working Time</th>
                <th className="px-6 py-3 text-center">Overtime</th>
                <th className="px-6 py-3 text-center">Less Time</th>
                <th className="px-6 py-3 text-right">Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(selectedEmployeeId !== "default"
                ? weekData
                : Array(5).fill(null)
              ).map((item, index) => {
                // Calculate the day name for empty rows
                let dayLabel = item?.day;
                if (!item) {
                  // Get the correct day name based on index (Monday=0)
                  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                  dayLabel = daysOfWeek[index] || "";
                }
                return (
                  <tr key={index}>
                    <td className="px-6 py-3 font-medium">
                      {dayLabel}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {item ? "8 hrs" : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {item ? "30 mins" : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {item
                        ? item.day === "Wednesday"
                          ? "9 hrs"
                          : item.day === "Tuesday"
                          ? "7 hrs"
                          : "8 hrs"
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {item
                        ? item.day === "Wednesday"
                          ? "1 hr"
                          : item.day === "Monday"
                          ? "0.5 hrs"
                          : "—"
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {item
                        ? item.day === "Tuesday"
                          ? "1 hr"
                          : item.day === "Friday"
                          ? "1.5 hrs"
                          : "—"
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {item ? `$${item.pay}` : "$0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 sm:px-6 py-4 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Weekly Summary (For Manager’s Log)
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Total Overtime Hours</span>
              <span>{selectedEmployeeId !== "default" ? "1.5 hrs" : "0 hrs"}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Less Time Hours</span>
              <span>{selectedEmployeeId !== "default" ? "2.5 hrs" : "0 hrs"}</span>
            </div>
            <div className="flex justify-between font-semibold ">
              <span>Total Pay</span>
              <span style={{ color: "green", fontWeight: "bold" }}>
                {selectedEmployeeId !== "default" ? `$${totalPay}` : "$0"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t text-right">
          {selectedEmployeeId !== "default" ? (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Approve
            </button>
          ) : (
            <div className="text-sm text-gray-500 italic">
              – Please select an employee to enable approval –
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSheet;
