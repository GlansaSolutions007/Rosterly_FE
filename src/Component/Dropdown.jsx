import React from "react";

const Dropdown = (option, value) => {
    
  return (
    <>
      <select
        name="selectedFruit"
        className="bg-white px-3 rounded-lg py-3 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-50 w-80 appearance-none pr-10"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>\')',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1.25rem",
        }}
        onChange={handleLocation}
      >
        <option value="default">--Select location--</option>
        <option value="Location 1">Location 1</option>
        <option value="Location 2">Location 2</option>
        <option value="Location 3">Location 3</option>
      </select>
    </>
  );
};

export default Dropdown;
