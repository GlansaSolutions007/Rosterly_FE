import React from 'react'

const General = () => {
    return (
        <div className="card">
            <h1 className='heading text-indigo-900 '>General Settings</h1>

            <div className="space-y-6 my-4">
                {[
                    {
                        title: 'Timezone',
                        desc: 'Which Timezone Do Your Locations Belong To?',
                        options: ['(UTC+05:30) Asia/Kolkata'],
                    },
                    {
                        title: 'Default Employee Type',
                        desc: 'When Adding A New Employee, By Default What Should Their Employment Type Be?',
                        options: ['Full Time', 'Part Time'],
                    },
                    {
                        title: 'Default Hours Per Day',
                        desc: 'Default Number Of Hours Per Full-Time Employee Day. Used To Calculate Hours For Leave Days.',
                        options: ['08:00', '12:00'],
                    },
                    {
                        title: 'Default Leave Type',
                        desc: 'When Applying For And Importing Leave Onto The Timesheet, If Unspecified, What Leave Type Should Be The Default?.',
                        options: ['Without Pay', 'Casual Leave', 'Sick Leave', 'Annual Leave'],
                    },
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-[35rem]">
                            <h6 className="subHeading">{item.title}</h6>
                            <p className="paragraphThin">{item.desc}</p>
                        </div>
                        <select className="input w-full sm:w-64">
                            {item.options.map((option, i) => (
                                <option key={i}>{option}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {/* Checkboxes */}
            <div className="space-y-6 my-4">
                {[
                    {
                        title: 'Availability Changes Require Approval',
                        desc: 'Check To Require Management Approval Before Implementing And Using Employee Initiated Unavailability Updates.',
                    },
                    {
                        title: 'Only Show Same Location Managers',
                        desc: 'Check To Only Display Managers Within The Same Location(S) As The Employee When The Employee Is Selecting Who Should Approve Their Availability Change Request.',
                    },
                    {
                        title: 'Send All Unavailability Request Notifications By Email To Manager',
                        desc: 'Check To Notify Selected Manager By Email Of All Unavailability Or Leave Requests/Updates As They Occur.',
                    },
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="w-full sm:w-[35rem]">
                            <h6 className="font-bold text-gray-800">{item.title}</h6>
                            <p className="paragraphThin">{item.desc}</p>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
                <button className="buttonSuccess w-full sm:w-52">
                    Save
                </button>
            </div>
        </div>

    )
}

export default General