import React from 'react';

const PenalityRate = () => {
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
      {/* Top header bar */}
      <div className="flex items-center justify-between bg-gray-200 rounded-t-lg px-4 py-3">
        <p className="paragraphThin">
          Every Shift Can Be Checked Against Rule To Determine If Any  Penality Rate Applies.
        </p>
        <div className="flex gap-2">
          <button className="buttonSuccessB">
            Show Inactive
          </button>
          <button className="buttonSuccess">
            + Rule
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300">
            <thead>
                <tr className="bgTable text-white">
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Priority</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Short Name</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Factor</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Day</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Applicable Time</th>
                <th className="subHeading border border-gray-300 px-4 py-2 text-left">Employee Types</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">1</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Public Holiday Hours</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Public Hol</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">2.75 X Base</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Public Holiday</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">All Day</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">FT PT CAS</td>
                </tr>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">2</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Sunday Hours</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Sun Hol</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">2.75 X Base</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Sunday</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">All Day</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">FT PT CAS</td>
                </tr>
                <tr>
                <td className="paragraphThin border border-gray-300 px-4 py-2">3</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Saturday Hours</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Sat Hol</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">2.75 X Base</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">Saturday</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">All Day</td>
                <td className="paragraphThin border border-gray-300 px-4 py-2">FT PT CAS</td>
                </tr>
                
                {/* Add the rest of your rows similarly */}
            </tbody>
        </table>
    </div>
  );
};

export default PenalityRate;
