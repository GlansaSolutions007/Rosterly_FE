import React, { useState } from 'react'
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineArrowOutward } from "react-icons/md";
import { FaUserClock } from "react-icons/fa6";
import General from './General';
import RosterSettingsPage from './RosterSetting';
import Permission from './Permission';
import { GrDocumentTime } from "react-icons/gr";
import { RiListSettingsLine } from "react-icons/ri";
import { BsNewspaper } from "react-icons/bs";


const SystemSettings = () => {
  const [selectedSetting, setSelectedSetting] = useState('General');

  const renderComponent = () => {
    switch (selectedSetting) {
      case 'General': return <General />;
      case 'Roster': return <RosterSettingsPage />;
      case 'Permission': return <Permission />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="mt-2 w-full">
        <div className="flex flex-wrap gap-2 justify-between px-1 ">
          {[
            { name: 'General', icon: <IoSettingsOutline className="text-xl sm:text-3xl" /> },
            { name: 'Roster', icon: <FaUserClock className="text-xl sm:text-3xl" /> },
            { name: 'TimeSheet', icon: <GrDocumentTime className="text-xl sm:text-3xl" /> },
            { name: 'Integrations', icon: <RiListSettingsLine className="text-xl sm:text-3xl" /> },
            { name: 'Permission', icon: <BsNewspaper className="text-xl sm:text-3xl" /> },

          ].map((setting) => (
            <div
              key={setting.name}
              className={`w-[18%] p-2 sm:p-4 rounded-md transition-all duration-200 cursor-pointer text-xs sm:text-sm
              flex flex-col items-center text-center 
              ${selectedSetting === setting.name ? 'buttonSuccessActive text-black' : 'sideBar'}
              `}
              onClick={() => setSelectedSetting(setting.name)}
              title={`${setting.name} Settings`}
            >
              <div className={`mb-1 ${selectedSetting === setting.name ? 'text-black' : 'text-gray-600'}`}>
                {setting.icon}
              </div>
              <div className={`font-semibold hidden sm:block ${selectedSetting === setting.name ? 'text-black' : 'text-gray-700'}`}>
                {setting.name}
              </div>
            </div>

          ))}
        </div>
      </div>

      <div className="mt-5">
        {renderComponent()}
      </div>
    </div>
  )
}

export default SystemSettings