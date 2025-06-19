import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaFilePdf } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { FaAngleLeft, FaPlus } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { Dialog } from "@headlessui/react";

const Rosters = () => {
  const [selectedLocation, setSelectedLocation] = useState("default");
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [stats, setStats] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);

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
    setSelectedLocation(e.target.value);
    console.log("Selected Location:", e.target.value);
  };

  const days = [
    "Mon 07/04",
    "Tue 08/04",
    "Wed 09/04",
    "Thu 10/04",
    "Fri 11/04",
    "Sat 12/04",
    "Sun 13/04",
  ];

  const data = [
    {
      time: "09:30 Am - 06:30 Pm",
      hrs: "8.25hrs(45m)",
      unavail: "Unavailable",
      icon: "+",
    },
  ];

  const employees = [
    { name: "Unassigned shifts", hours: "8.25", cost: null },
    { name: "Harish Dobila", hours: "5.00", cost: "$10.00" },
    { name: "Sourav Behuria", hours: "4.00", cost: "$9.00" },
    { name: "Vishal Kattera", hours: "8.00", cost: "$20.00" },
  ];

  const handleStats = () => {
    setStats(!stats);
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

  const timeOptions = generateTimeOptions();
  const breakOptions = [0, 15, 30, 45, 60];
  const [start, setStart] = useState(timeOptions[0]);
  const [finish, setFinish] = useState(timeOptions[0]);
  const [breakTime, setBreakTime] = useState(breakOptions[0]);
  const hoursPerDay = ["12.25", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"];
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
            <option value="default">--Select Location--</option>
            <option value="Location 1">Store 1</option>
            <option value="Location 2">Store 2</option>
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

        <button className="buttonSuccess ">Publish</button>
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

      <div className="mt-8 min-h-screen">
        <div className="overflow-x-auto   ">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bgTable">
              <tr className=" border border-gray-300">
                <th className="w-48 p-2 text-left border border-gray-300 subHeading"></th>
                {days.map((day, idx) => (
                  <th
                    key={idx}
                    className="p-2 text-center text-gray-800 font-bold border border-gray-300"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, idx) => (
                <tr key={idx} className="border border-gray-300">
                  <td className="p-2 border border-gray-300 bg-gray-50">
                    <div className="paragraphBold">{emp.name}</div>
                    <div className="smallText">
                      {emp.hours} hrs {emp.cost ? `· ${emp.cost}` : ""}
                    </div>
                  </td>

                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 align-center p-2 border border-gray-300"
                    >
                      <div className="bgSucces text-white p-2 paragraph rounded">
                        {d.time}
                        <br />
                        <span className="text-xs">0.50 Hrs (15 Min)</span>{" "}
                        <br />
                        <span className="text-xs">Lunch</span>
                      </div>
                    </td>
                  ))}
                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 align-center p-2 border border-gray-300 "
                    >
                      <button
                        className="text-gray-400 hover:text-blue-500 font-bold"
                        onClick={() => setIsShiftOpen(true)}
                      >
                        <FaPlus
                          className=" hover:text-violet-950 cursor bg-rosterGreen text-white rounded-md p-1"
                          size={20}
                        />
                      </button>
                    </td>
                  ))}
                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 bg-gray-100 align-center p-2 border border-gray-300"
                    >
                      <button className="text-gray-500 paragraph hover:text-blue-500 ">
                        {d.unavail}
                      </button>
                    </td>
                  ))}
                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 align-center p-2 border border-gray-300"
                    >
                      <button
                        className="text-gray-400 hover:text-blue-500 font-bold"
                        onClick={() => setIsShiftOpen(true)}
                      >
                        <FaPlus
                          className=" hover:text-violet-950 cursor bg-rosterGreen text-white rounded-md p-1"
                          size={20}
                        />
                      </button>
                    </td>
                  ))}
                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 align-center p-2 border border-gray-300"
                    >
                      <button
                        className="text-gray-400 hover:text-blue-500 font-bold"
                        onClick={() => setIsShiftOpen(true)}
                      >
                        <FaPlus
                          className=" hover:text-violet-950 cursor bg-rosterGreen text-white rounded-md p-1"
                          size={20}
                        />
                      </button>
                    </td>
                  ))}
                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 align-center p-2 border border-gray-300"
                    >
                      <button
                        className="text-gray-400 hover:text-blue-500 font-bold"
                        onClick={() => setIsShiftOpen(true)}
                      >
                        <FaPlus
                          className=" hover:text-violet-950 cursor bg-rosterGreen text-white rounded-md p-1"
                          size={20}
                        />
                      </button>
                    </td>
                  ))}
                  {data.map((d, colIdx) => (
                    <td
                      key={colIdx}
                      className="text-center h-20 align-center p-2 border border-gray-300"
                    >
                      <button
                        className="text-gray-400 hover:text-blue-500 font-bold"
                        onClick={() => setIsShiftOpen(true)}
                      >
                        <FaPlus
                          className=" hover:text-violet-950 cursor bg-rosterGreen text-white rounded-md p-1"
                          size={20}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Add Employee Button */}
              <tr className="border border-gray-300 h-15 bg-gray-100">
                <td className="p-2 border border-gray-300">
                  <button
                    className="buttonSuccess"
                    onClick={() => setIsModalOpen(true)}
                  >
                    + Employee
                  </button>
                </td>
                {days.map((_, idx) => (
                  <td
                    key={idx}
                    className="p-2 text-center paragraphBold border border-gray-300"
                  >
                    {hoursPerDay[idx]} hrs
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

      <Dialog
        open={isShiftOpen}
        onClose={() => setIsShiftOpen(false)}
        className="relative z-50 rounded-lg"
      >
        <div className="fixed inset-0 bg-gray-700/70"></div>
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-gray-200 rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-gray-800 rounded-t-lg text-white px-4 py-3 flex justify-between items-center">
              <Dialog.Title className="heading">Add Open Shift</Dialog.Title>
              <button
                className="text-white text-2xl font-bold cursor"
                onClick={() => setIsShiftOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="card p-6 space-y-3">
              <div className="">
                <div className="grid grid-cols-3 gap-4 mb-4">
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
                      value={breakTime}
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

                {/* Description Input */}
                <label className="paragraphBold">Description:</label>
                <textarea
                  className=" textarea paragraph"
                  rows="3"
                  placeholder="Enter description..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="buttonGrey"
                  onClick={() => setIsShiftOpen(false)}
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
    </>
  );
};

export default Rosters;
