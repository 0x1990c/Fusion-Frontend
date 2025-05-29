"use client"

import React, { useState, useRef } from "react"
import DatePicker from "react-datepicker"
import { X, Calendar } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

const DateInterval = ({ onClose, onSubmit, lastQueryDate }) => {

  // Parse the last query date or use current date
  const parsedLastQueryDate = lastQueryDate ? new Date(lastQueryDate) : new Date()

  // Initialize state with default dates (from: 1 month ago, to: current date)
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const datePickerRef = useRef(null);
  const datePickerRef2 = useRef(null);

  const handleSubmit = () => {
    onSubmit({ fromDate, toDate })
  }

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-bold">Date Interval</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        {/* Last Query Date */}
        <div className="mb-4 text-center">
          <p className="text-sm font-medium">LAST QUERY DATE: {parsedLastQueryDate.toLocaleDateString("en-US")}</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="from-date" className="font-bold">
              FROM:
            </label>
            <div className="relative">
              <DatePicker
                id="from-date"
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                dateFormat="MM/dd/yyyy"
                className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={datePickerRef}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" size={16} 
                onClick={() => datePickerRef.current?.setOpen(true)}/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="to-date" className="font-bold">
              TO:
            </label>
            <div className="relative">
              <DatePicker
                id="to-date"
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="MM/dd/yyyy"
                className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={datePickerRef2}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" size={16} 
                onClick={() => datePickerRef2.current?.setOpen(true)}/>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            GET CASES
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateInterval
