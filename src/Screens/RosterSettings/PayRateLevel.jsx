import React, { useState } from "react";

const LevelsTableUI = () => {
    const [levels, setLevels] = useState([
        { name: "Level 1", rate: "$20", status: "Default", junior: "Apply", employees: 4 },
        { name: "Level 2", rate: "$21", status: "", junior: "Apply", employees: 0 },
        { name: "Level 3", rate: "$20", status: "", junior: "Apply", employees: 2 },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        levelName: "",
        hourlyRate: "",
        juniorRates: true,
        defaultRate: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = () => {
        const newLevel = {
            name: formData.levelName,
            rate: `$${parseFloat(formData.hourlyRate).toFixed(4)}`,
            status: formData.defaultRate ? "Default" : "",
            junior: formData.juniorRates ? "Apply" : "N/A",
            employees: 0,
        };
        setLevels([...levels, newLevel]);
        setShowModal(false);
        setFormData({
            levelName: "",
            hourlyRate: "",
            juniorRates: true,
            defaultRate: false,
        });
    };

    return (
        <div className="card p-8">
            <div className=" overflow-hidden">
                <div className="bg-[#e4e4e4] px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <p className="paragraphThin">
                        Levels allow you to link groups of employees to different pay rates based on their role, experience or classification.
                    </p>
                    <div className="space-x-2">
                        <button className="buttonGrey text-white-500 text-sm px-4 py-1.5 rounded hover:bg-gray-300">
                            Show Inactive
                        </button>
                        <button className="buttonSuccess text-white text-sm px-4 py-1.5 rounded hover:bg-[#36bb59]" onClick={() => setShowModal(true)}>
                            + Level
                        </button>
                    </div>
                </div>

                <table className="min-w-full text-sm border border-gray-300">
                    <thead className="bgTable text-white">
                        <tr>
                            <th className="subHeading border border-gray-300 text-left py-3 px-4">Level Name</th>
                            <th className="subHeading border border-gray-300 text-left py-3 px-4">Hourly Rate</th>
                            <th className="subHeading border border-gray-300 text-left py-3 px-4">Status</th>
                            <th className="subHeading border border-gray-300 text-left py-3 px-4">Junior Rates</th>
                            <th className="subHeading border border-gray-300 text-left py-3 px-4"># Attached Employees</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white border border-gray-300 text-black-800">
                        {levels.map((level, idx) => (
                            <tr key={idx} className="border border-gray-300">
                                <td className="paragraphThin border border-gray-300 py-3 px-4">{level.name}</td>
                                <td className="paragraphThin border border-gray-300 py-3 px-4">{level.rate}</td>
                                <td className="paragraphThin border border-gray-300 py-3 px-4">{level.status || "-"}</td>
                                <td className="paragraphThin border border-gray-300 py-3 px-4 text-blue-600 hover:underline cursor-pointer">
                                    {level.junior}
                                </td>
                                <td className="paragraphThin py-3 px-4">{level.employees}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-700/70 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-sm shadow-lg">
                        <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-md font-semibold">Add Pay Rate Level</h2>
                            <button onClick={() => setShowModal(false)} className="text-white text-3xl font-bold">
                                &times;
                            </button>
                        </div>

                        <div className="px-4 py-3 bg-gray-200">
                            <p className="text-sm text-gray-500 mb-2">
                                Enter an hourly base rate without any loadings (i.e. without a casual 25% loading).
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                                One level must be designated as 'default' for those employees whose pay rate is calculated automatically by iRoster.
                            </p>

                            <input
                                type="text"
                                name="levelName"
                                placeholder="Level Name"
                                value={formData.levelName}
                                onChange={handleChange}
                                className="input w-full my-2"
                            />
                            <input
                                type="number"
                                name="hourlyRate"
                                placeholder="Hourly Rate"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                className="input w-full my-2"
                            />

                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    name="juniorRates"
                                    checked={formData.juniorRates}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label className="text-sm">Junior rates will apply</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="defaultRate"
                                    checked={formData.defaultRate}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label className="text-sm">Default pay rate</label>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-gray-200 flex justify-end space-x-2 border-t">
                            <button
                                onClick={() => setShowModal(false)}
                                className="buttonGrey"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSave}
                                className="buttonSuccess"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LevelsTableUI;
