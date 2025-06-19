import React from "react";
import { Plus, Pencil } from "lucide-react";

const Unavailability = () => {
    return (
        <div className="p-4">
            <div className="text-2xl font-bold mb-4 text-purple-800">Unavailability</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Side - Add Days Off & Requested Dates */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Days Off Adding */}
                    <div className="bg-white rounded shadow p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-1">From Date</label>
                                <input type="date" className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">To Date</label>
                                <input type="date" className="w-full border rounded px-3 py-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Specify the leave type</label>
                            <select className="w-full border rounded px-3 py-2">
                                <option>Without Pay</option>
                                <option>Paid Leave</option>
                                <option>Sick Leave</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Specify number of leave hours per week</label>
                            <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 16.03" />
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Save</button>
                            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Reset</button>
                        </div>
                    </div>

                    {/* Requested Dates Off List */}
                    <div className="bg-white rounded shadow p-4">
                        <div className="text-lg font-semibold mb-2">Requested Dates Off</div>
                        <div className="border p-2 rounded flex justify-between items-center mb-2">
                            <div>
                                <div>28/03/25 - 29/03/25</div>
                                <div className="text-sm text-gray-500">(Function)</div>
                            </div>
                            <Pencil size={16} className="cursor-pointer" />
                        </div>
                        <div className="border p-2 rounded flex justify-between items-center">
                            <div>
                                <div>04/04/25 - 05/04/25</div>
                                <div className="text-sm text-gray-500">16.00hrs of Without Pay Leave (temple visit)</div>
                            </div>
                            <Pencil size={16} className="cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Right Side - Recurring Unavailability */}
                <div className="bg-white rounded shadow p-4 space-y-2 h-full">
                    <div className="text-lg font-semibold mb-2">Recurring Unavailability</div>
                    {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ].map((day) => (
                        <div
                            key={day}
                            className={`flex justify-between items-center border p-2 rounded ${day === "Saturday" || day === "Sunday"
                                ? "text-red-600"
                                : "text-purple-700"
                                }`}
                        >
                            <span>
                                {day}
                                {day === "Saturday" && <span className="text-sm block">8:00am - 10:00am / Off</span>}
                                {day === "Sunday" && <span className="text-sm block">3:30pm - 11:15pm / TIS Sunday</span>}
                            </span>
                            <Plus size={20} className="cursor-pointer" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Unavailability;
