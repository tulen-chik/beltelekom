"use client"

import { useState } from "react"
import { CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react"
import type { Call } from "../types/index"

/**
 * Props interface for CallsList component
 * @property calls - Array of call records to display
 * @property selectedCalls - Array of currently selected calls
 * @property onToggleCall - Callback function to toggle selection of a call
 * @property onSelectAll - Callback function to select all calls
 * @property onDeselectAll - Callback function to deselect all calls
 */
interface CallsListProps {
    calls: Call[]
    selectedCalls: Call[]
    onToggleCall: (call: Call) => void
    onSelectAll: () => void
    onDeselectAll: () => void
}

/**
 * CallsList Component
 * A component that displays a list of calls with selection functionality
 * Features:
 * - Expandable/collapsible list
 * - Individual call selection
 * - Select all/deselect all functionality
 * - Scrollable list for many calls
 */
export default function CallsList({ calls, selectedCalls, onToggleCall, onSelectAll, onDeselectAll }: CallsListProps) {
    // State to control list expansion
    const [expanded, setExpanded] = useState<boolean>(false)

    return (
        // Main container with white background and shadow
        <div className="bg-white shadow-md rounded-lg p-6">
            {/* Header with title and expand/collapse button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Выбрать звонки</h2>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
            </div>
            {/* Expanded content */}
            {expanded && (
                <>
                    {/* Selection control buttons */}
                    <div className="mb-4 space-x-2">
                        <button
                            onClick={onSelectAll}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Выбрать все
                        </button>
                        <button
                            onClick={onDeselectAll}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            Отменить все
                        </button>
                    </div>
                    {/* Scrollable list of calls */}
                    <ul className="max-h-60 overflow-y-auto border rounded p-2">
                        {calls.map((call) => (
                            <li key={call.id} className="flex items-center py-2 border-b last:border-b-0">
                                {/* Call selection toggle button */}
                                <button
                                    onClick={() => onToggleCall(call)}
                                    className="mr-2 text-gray-500 hover:text-blue-500 transition-colors"
                                >
                                    {selectedCalls.some((c) => c.id === call.id) ? (
                                        <CheckSquare className="h-5 w-5" />
                                    ) : (
                                        <Square className="h-5 w-5" />
                                    )}
                                </button>
                                {/* Call details */}
                                <span>
                                    {new Date(call.call_date).toLocaleDateString()} - {call.start_time} - {call.duration} секунд
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}