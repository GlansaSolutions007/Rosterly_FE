import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const initialData = {
    Monday: [{ id: "shift-1", time: "9:00 AM - 5:00 PM" }],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
};

const ShiftBoard = () => {
    const [shifts, setShifts] = useState(initialData);
    const [copiedShift, setCopiedShift] = useState(null); // stores the copied shift

    const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const [selectedTz, setSelectedTz] = useState(defaultTz);
    const [selectedDate, setSelectedDate] = useState(new Date());


    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceDay = source.droppableId;
        const destDay = destination.droppableId;

        if (sourceDay !== destDay) {
            const sourceShifts = Array.from(shifts[sourceDay]);
            const destShifts = Array.from(shifts[destDay]);
            const [moved] = sourceShifts.splice(source.index, 1);
            const newShift = { ...moved, id: `${destDay}-${Date.now()}` };
            destShifts.splice(destination.index, 0, newShift);

            setShifts((prev) => ({
                ...prev,
                [sourceDay]: sourceShifts,
                [destDay]: destShifts,
            }));
        }
    };

    const handleCopy = (shift) => {
        setCopiedShift(shift);
    };

    const handlePaste = (day) => {
        if (!copiedShift) return;
        const newShift = { ...copiedShift, id: `${day}-${Date.now()}` };
        setShifts((prev) => ({
            ...prev,
            [day]: [...prev[day], newShift],
        }));
        setCopiedShift(null); // clear clipboard after pasting
    };


    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const zoned = DateTime.fromJSDate(selectedDate).setZone(selectedTz);
    const utc = zoned.toUTC();

    const getFormattedTimezones = () => {
        return Intl.supportedValuesOf('timeZone').map((tz) => {
            const offset = DateTime.now().setZone(tz).offset; // in minutes
            const hours = Math.floor(Math.abs(offset) / 60)
                .toString()
                .padStart(2, '0');
            const minutes = Math.abs(offset) % 60 === 0 ? '00' : (Math.abs(offset) % 60).toString().padStart(2, '0');
            const sign = offset >= 0 ? '+' : '-';
            const formatted = `UTC${sign}${hours}:${minutes} — ${tz}`;
            return { value: tz, label: formatted };
        });
    };

    const timezones = getFormattedTimezones();

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
                    {Object.entries(shifts).map(([day, shiftList]) => (
                        <Droppable key={day} droppableId={day}>
                            {(provided) => (
                                <div
                                    className="bg-gray-100 p-4 rounded shadow min-h-[150px] relative"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="font-semibold">{day}</h2>
                                        {copiedShift && (
                                            <button
                                                className={`text-xs px-2 py-1 rounded ${copiedShift ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
                                                    }`}
                                                onClick={() => handlePaste(day)}
                                                disabled={!copiedShift}
                                            >
                                                Paste
                                            </button>   
                                        )}
                                    </div>
                                    {shiftList.map((shift, index) => (
                                        <Draggable
                                            key={shift.id}
                                            draggableId={shift.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    className="bgSucces p-2 paragraph rounded cursor-move relative flex justify-between"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <div className="">
                                                        {shift.time}
                                                        {console.log("Rendering Copy for", shift.id)}
                                                    </div>
                                                    <div>

                                                        <button
                                                            onClick={() => handleCopy(shift)}
                                                            className="text-lg rounded cursor-pointer"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
            <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Roster Timezone Picker</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Select Timezone</label>
                    <select
                        value={selectedTz}
                        onChange={(e) => setSelectedTz(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Pick Date & Time</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded border text-sm text-gray-800">
                    <p><strong>Displayed in {selectedTz}:</strong> {zoned.toFormat('dd LLL yyyy, hh:mm a')}</p>
                    <p><strong>Stored in UTC:</strong> {utc.toISO()}</p>
                </div>
            </div>
        </>
    );
};

export default ShiftBoard;
