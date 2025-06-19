import React from 'react';

const JuniorRate = () => {
  const data = [
    { age: '15 Years Old And Under', rate: '40.00%' },
    { age: '16 Years Old', rate: '50.00%' },
    { age: '17 Years Old', rate: '60.00%' },
    { age: '18 Years Old', rate: '70.00%' },
    { age: '19 Years Old', rate: '80.00%' },
    { age: '20 Years Old', rate: '90.00%' },
  ];

  return (
    <div className="card p-8">
      <div className="flex items-center justify-between bg-gray-200 rounded-t-lg px-4 py-3">
        <p className="paragraphThin">
          A Level’s Hourly Rate Can Be Reduced Based On An Employee’s Age.
        </p>
        <div className="flex gap-2">
          <button className="buttonSuccessB">
            Show Inactive
          </button>
          <button className="buttonSuccess">
            + Age
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300">
            <thead>
                <tr className="bgTable text-white">
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Age</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Percentage Of Full Rate</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">15 Years Old And Under</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">40.00%</td>
                </tr>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">16 Years Old</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">50.00%</td>
                </tr>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">14 Years Old</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">50.00%</td>
                </tr>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">12 Years Old</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">50.00%</td>
                </tr>
                {/* Add the rest of your rows similarly */}
            </tbody>
        </table>
    </div>
  );
};

export default JuniorRate;
