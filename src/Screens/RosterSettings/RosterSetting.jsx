import React, { useState } from 'react';

const RosterSettingsPage = () => {
  const [approval, setApproval] = useState(true);
  const [sameLocationManagers, setSameLocationManagers] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);

  return (
    <div className="card">
      <h1 className='heading text-indigo-900 '>Roster Settings</h1>

      <div className="space-y-6 my-4">

        {/** Timezone Setting */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div className="w-full sm:w-[60%]">
            <h6 className="subHeading">Timezone</h6>
            <p className="paragraphThin">Which Timezone Do Your Locations Belong To?</p>
            <p className="paragraphBold">1:31:31 PM</p>
          </div>
          <div className="w-full sm:w-[35%] sm:text-right">
            <select className="input w-full">
              <option>(UTC+05:30) Asia/Kolkata</option>
            </select>
          </div>
        </div>

        {/** Default Employee Type */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div className="w-full sm:w-[60%]">
            <h6 className="subHeading">Default Employee Type</h6>
            <p className="paragraphThin">When Adding A New Employee, By Default What Should Their Employment Type Be?</p>
          </div>
          <div className="w-full sm:w-[35%] sm:text-right">
            <select className="input w-full">
              <option>Full</option>
            </select>
          </div>
        </div>

        {/** Approval Toggle */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div className="w-full sm:w-[60%]">
            <h6 className="subHeading">Availability Changes Require Approval</h6>
            <p className="paragraphThin">Check To Require Management Approval Before Implementing And Using Employee Initiated Unavailability Updates.</p>
          </div>
          <div className="w-full sm:w-[35%] sm:text-right">
            <input
              type="checkbox"
              checked={approval}
              onChange={() => setApproval(!approval)}
              className="w-5 h-5 text-purple-700 border-2 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
        </div>

        {/** Same Location Managers */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div className="w-full sm:w-[60%]">
            <h6 className="subHeading">Only Show Same Location Managers</h6>
            <p className="paragraphThin">Check To Only Display Managers Within The Same Location(S) As The Employee When The Employee Is Selecting Who Should Approve Their Availability Change Request.</p>
          </div>
          <div className="w-full sm:w-[35%] sm:text-right">
            <input
              type="checkbox"
              checked={sameLocationManagers}
              onChange={() => setSameLocationManagers(!sameLocationManagers)}
              className="w-5 h-5 text-purple-700 border-2 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
        </div>

        {/** Email Notification */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div className="w-full sm:w-[60%]">
            <h6 className="subHeading">Send All Unavailability Request Notifications By Email To Manager</h6>
            <p className="paragraphThin">Check To Notify Selected Manager By Email Of All Unavailability Or Leave Requests/Updates As They Occur.</p>
          </div>
          <div className="w-full sm:w-[35%] sm:text-right">
            <input
              type="checkbox"
              checked={emailNotification}
              onChange={() => setEmailNotification(!emailNotification)}
              className="w-5 h-5 text-purple-700 border-2 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
        </div>

        {/** Save Button */}
        <div className='flex justify-end'>
          <button className="buttonSuccess w-full sm:w-50">
            Save
          </button>
        </div>

      </div>
    </div>


  );
};

export default RosterSettingsPage;
