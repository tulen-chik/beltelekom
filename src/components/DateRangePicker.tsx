"use client"

import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar } from "lucide-react"

interface DateRangePickerProps {
    onStartDateChange: (date: Date | undefined) => void
    onEndDateChange: (date: Date | undefined) => void
    startDate: Date | undefined
    endDate: Date | undefined
}

export default function DateRangePicker({ onStartDateChange, onEndDateChange, startDate, endDate }: DateRangePickerProps) {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800">Выбор диапазона дат</h2>
            <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => onStartDateChange(date ?? undefined)}
                        selectsStart
                        dateFormat={"dd/MM/yyyy"}
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Дата начала"
                        className="border rounded p-2"
                    />
                </div>
                <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => onEndDateChange(date ?? undefined)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat={"dd/MM/yyyy"}
                        placeholderText="Дата окончания"
                        className="border rounded p-2"
                    />
                </div>
            </div>
        </div>
    )
}