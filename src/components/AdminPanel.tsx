'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Calendar, DollarSign, X, CheckSquare, Square, ChevronDown, ChevronUp, LogOut, Phone, Plus, Tag } from 'lucide-react'
import { Subscriber, Call, Tariff, Bill } from '../types/index'
import { format } from 'date-fns'
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function AdminPanel() {
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [searchResults, setSearchResults] = useState<Subscriber[]>([])
    const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [calls, setCalls] = useState<Call[]>([])
    const [selectedCalls, setSelectedCalls] = useState<Call[]>([])
    const [bill, setBill] = useState<Bill | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [expandedCalls, setExpandedCalls] = useState<boolean>(false)
    const [isCreateCallModalOpen, setIsCreateCallModalOpen] = useState<boolean>(false)
    const [newCall, setNewCall] = useState<Partial<Call>>({})
    const [tariffs, setTariffs] = useState<Tariff[]>([])
    const [newTariff, setNewTariff] = useState<Partial<Tariff>>({
        name: '',
        start_date: '',
        day_rate_start: 0,
        night_rate_start: 0,
        end_date: '',
        day_rate_end: 0,
        night_rate_end: 0,
        zone_code: ''
    })
    const [isCreateTariffModalOpen, setIsCreateTariffModalOpen] = useState<boolean>(false)
    const router = useRouter()

    const handleSearch = async (): Promise<void> => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get<Subscriber[]>(`/api/subscribers?search=${encodeURIComponent(searchTerm)}`)
            setSearchResults(response.data)
        } catch (error) {
            console.error('Error searching subscribers:', error)
            setError('Failed to search subscribers. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubscriberSelect = (subscriber: Subscriber): void => {
        setSelectedSubscriber(subscriber)
        setSearchResults([])
        setStartDate(undefined)
        setEndDate(undefined)
        setCalls([])
        setSelectedCalls([])
        setBill(null)
    }

    const handleDeleteTariff = async (zoneCode: string) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`/api/tariffs?zone_code=${encodeURIComponent(zoneCode)}`);
            alert('Tariff deleted successfully!');
            fetchTariffs();
        } catch (error) {
            console.error('Error deleting tariff:', error);
            setError('Failed to delete tariff. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCalls = useCallback(async () => {
        if (selectedSubscriber && startDate && endDate) {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.get<Call[]>('/api/calls', {
                    params: {
                        subscriber_id: selectedSubscriber.subscriber_id,
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0]
                    }
                })
                setCalls(response.data)
                if (response.data.length === 0) {
                    setError('No calls found for the selected date range.')
                }
            } catch (error) {
                console.error('Error fetching calls:', error)
                setError('Failed to fetch calls. Please try again.')
            } finally {
                setLoading(false)
            }
        }
    }, [selectedSubscriber, startDate, endDate])

    const fetchTariffs = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get<Tariff[]>('/api/tariffs/all')
            setTariffs(response.data)
        } catch (error) {
            console.error('Error fetching tariffs:', error)
            setError('Failed to fetch tariffs. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCalls()
        fetchTariffs()
    }, [fetchCalls, fetchTariffs])

    const handleCallToggle = (call: Call): void => {
        setSelectedCalls((prev) => {
            const isSelected = prev.some((c) => c.id === call.id)
            return isSelected ? prev.filter((c) => c.id !== call.id) : [...prev, call]
        })
    }

    const handleSelectAll = (): void => {
        setSelectedCalls(calls)
    }

    const handleDeselectAll = (): void => {
        setSelectedCalls([])
    }

    const generateBill = async (): Promise<void> => {
        setLoading(true)
        setError(null)
        let totalAmount = 0
        const details: Bill['details'] = []

        try {
            for (const call of selectedCalls) {
                const response = await axios.get<Tariff>('/api/tariffs', {
                    params: {
                        zone_code: call.zone_code,
                        call_date: call.call_date
                    }
                })
                const tariff = response.data

                if (tariff) {
                    const callTime = new Date(`1970-01-01T${call.start_time}`)
                    const isDayTime = callTime.getHours() >= 6 && callTime.getHours() < 22
                    const rate = isDayTime ? tariff.day_rate_end : tariff.night_rate_end
                    const effectiveRate = rate ?? 0
                    const callCost = (call.duration / 60) * effectiveRate

                    totalAmount += callCost
                    details.push({
                        date: call.call_date,
                        time: call.start_time,
                        duration: call.duration,
                        cost: callCost
                    })
                }
            }

            if (selectedSubscriber && startDate && endDate) {
                setBill({
                    id: crypto.randomUUID(),
                    totalAmount,
                    details,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    created_at: new Date().toISOString()
                })
                setIsModalOpen(true)
            }
        } catch (error) {
            console.error("Error generating bill:", error)
            setError('Failed to generate bill. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const saveBill = async () => {
        if (bill && selectedSubscriber && startDate && endDate) {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.post('/api/bills', {
                    subscriber_id: selectedSubscriber.subscriber_id,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    amount: bill.totalAmount,
                    details: bill.details
                })
                console.log('Bill saved successfully:', response.data)
                alert('Bill saved successfully!')
                setSelectedCalls([])
                setBill(null)
                setIsModalOpen(false)
            } catch (error) {
                console.error('Error saving bill:', error)
                setError('Failed to save bill. Please try again.')
            } finally {
                setLoading(false)
            }
        }
    }

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        return `${hours}h ${minutes}m ${remainingSeconds}s`
    }

    const handleLogout = () => {
        Cookies.remove('userRole')
        Cookies.remove('userProfile')
        router.push('/')
    }

    const handleCreateCall = async () => {
        if (selectedSubscriber && newCall.call_date && newCall.start_time && newCall.duration && newCall.zone_code) {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.post('/api/calls', {
                    subscriber_id: selectedSubscriber.subscriber_id,
                    ...newCall
                })
                console.log('Call created successfully:', response.data)
                alert('Call created successfully!')
                setIsCreateCallModalOpen(false)
                setNewCall({})
                fetchCalls()
            } catch (error) {
                console.error('Error creating call:', error)
                setError('Failed to create call. Please try again.')
            } finally {
                setLoading(false)
            }
        } else {
            setError('Please fill in all required fields.')
        }
    }

    const handleCreateTariff = async () => {
        if (newTariff.zone_code && newTariff.name && newTariff.start_date && newTariff.end_date && newTariff.day_rate_start !== undefined && newTariff.night_rate_start !== undefined && newTariff.day_rate_end !== undefined && newTariff.night_rate_end !== undefined) {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.post('/api/tariffs', newTariff)
                console.log('Tariff created successfully:', response.data)
                alert('Tariff created successfully!')
                setIsCreateTariffModalOpen(false)
                setNewTariff({name:'', start_date:'', day_rate_start:0, night_rate_start:0, end_date:'', day_rate_end:0, night_rate_end:0, zone_code:''}) //reset form
                fetchTariffs()
            } catch (error) {
                console.error('Error creating tariff:', error)
                setError('Failed to create tariff. Please try again.')
            } finally {
                setLoading(false)
            }
        } else {
            setError('Please fill in all required fields.')
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
                        <p className="text-gray-600">Manage subscribers, calls, and bills</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
                    >
                        <LogOut className="mr-2 h-5 w-5"/>
                        Logout
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Subscriber Search</h2>
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter full or partial subscriber ID"
                        className="border rounded-l p-2 flex-grow"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-colors"
                        disabled={loading}
                    >
                        <Search className="h-5 w-5"/>
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <ul className="mt-2 border rounded divide-y">
                        {searchResults.map((result) => (
                            <li
                                key={result.subscriber_id}
                                onClick={() => handleSubscriberSelect(result)}
                                className="cursor-pointer hover:bg-gray-100 p-2 transition-colors"
                            >
                                Subscriber ID: {result.subscriber_id}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Tariff Management</h2>
                    <button
                        onClick={() => setIsCreateTariffModalOpen(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                    >
                        <Plus className="mr-2 h-5 w-5"/>
                        Create Tariff
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Zone Code</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Day Rate</th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Night Rate</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {tariffs.map((tariff) => (
                            <tr key={tariff.zone_code} className="hover:bg-gray-50">
                                <td className="py-2 px-4 text-sm text-gray-800">{tariff.zone_code}</td>
                                {tariff.day_rate_end ? <td className="py-2 px-4 text-sm text-gray-800">${tariff.day_rate_end.toFixed(2)}</td> : <></>}
                                {tariff.night_rate_end ? <td className="py-2 px-4 text-sm text-gray-800">${tariff.night_rate_end.toFixed(2)}</td> : <></>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSubscriber && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Date Range Selection</h2>
                        <button
                            onClick={() => setIsCreateCallModalOpen(true)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                        >
                            <Plus className="mr-2 h-5 w-5"/>
                            Create Call
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gray-500"/>
                            <DatePicker
                                selected={startDate}
                                onChange={(date: Date | null) => setStartDate(date ?? undefined)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Start Date"
                                className="border rounded p-2"
                            />
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gray-500"/>
                            <DatePicker
                                selected={endDate}
                                onChange={(date: Date | null) => setEndDate(date ?? undefined)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="End Date"
                                className="border rounded p-2"
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-blue-100 text-blue-700 p-4 rounded mb-4">
                    Loading...
                </div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            {calls.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Select Calls</h2>
                        <button
                            onClick={() => setExpandedCalls(!expandedCalls)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                            {expandedCalls ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                        </button>
                    </div>
                    {expandedCalls && (
                        <>
                            <div className="mb-4 space-x-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={handleDeselectAll}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                >
                                    Deselect All
                                </button>
                            </div>
                            <ul className="max-h-60 overflow-y-auto border rounded p-2">
                                {calls.map((call) => (
                                    <li key={call.id} className="flex items-center py-2 border-b last:border-b-0">
                                        <button
                                            onClick={() => handleCallToggle(call)}
                                            className="mr-2 text-gray-500 hover:text-blue-500 transition-colors"
                                        >
                                            {selectedCalls.some((c) => c.id === call.id) ? (
                                                <CheckSquare className="h-5 w-5"/>
                                            ) : (
                                                <Square className="h-5 w-5"/>
                                            )}
                                        </button>
                                        <span>{new Date(call.call_date).toLocaleDateString()} - {call.start_time} - {call.duration} seconds</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {selectedCalls.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Bill Generation</h2>
                    <button
                        onClick={generateBill}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        disabled={loading}
                    >
                        Generate Bill
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && bill && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.9, opacity: 0}}
                            className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Bill Details</h2>
                                <button onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Period</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Calendar className="inline-block mr-1 h-5 w-5"/>
                                        {format(new Date(bill.start_date), 'dd/MM/yyyy')} - {format(new Date(bill.end_date), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <DollarSign className="inline-block mr-1 h-5 w-5"/>
                                        ${bill.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Call Details</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Date</th>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Time</th>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Duration</th>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Cost</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {bill.details.map((call, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 text-sm text-gray-800">{format(new Date(call.date), 'dd/MM/yyyy')}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{call.time}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{formatDuration(call.duration)}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">${call.cost.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={saveBill}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    disabled={loading}
                                >
                                    Save Bill
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateCallModalOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setIsCreateCallModalOpen(false)}
                    >
                        <motion.div
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.9, opacity: 0}}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Create New Call</h2>
                                <button onClick={() => setIsCreateCallModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateCall();
                            }} className="space-y-4">
                                <div>
                                    <label htmlFor="call_date" className="block text-sm font-medium text-gray-700">
                                        Call Date
                                    </label>
                                    <input
                                        type="date"
                                        id="call_date"
                                        value={newCall.call_date || ''}
                                        onChange={(e) => setNewCall({...newCall, call_date: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        id="start_time"
                                        value={newCall.start_time || ''}
                                        onChange={(e) => setNewCall({...newCall, start_time: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                        Duration (seconds)
                                    </label>
                                    <input
                                        type="number"
                                        id="duration"
                                        value={newCall.duration || ''}
                                        onChange={(e) => setNewCall({...newCall, duration: parseInt(e.target.value)})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zone_code" className="block text-sm font-medium text-gray-700">
                                        Zone Code
                                    </label>
                                    <select
                                        id="zone_code"
                                        value={newCall.zone_code || ''}
                                        onChange={(e) => setNewCall({...newCall, zone_code: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    >
                                        <option value="">Select a zone</option>
                                        {tariffs.map((tariff) => (
                                            <option key={tariff.zone_code} value={tariff.zone_code}>
                                                {tariff.zone_code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Create Call
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateTariffModalOpen && (
                    <motion.div
                        // ... (modal styling)
                    >
                        <motion.div
                            // ... (modal content styling)
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Create New Tariff</h2>
                                <button onClick={() => setIsCreateTariffModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateTariff();
                            }} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={newTariff.name || ''}
                                        onChange={(e) => setNewTariff({...newTariff, name: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zone_code" className="block text-sm font-medium text-gray-700">
                                        Zone Code
                                    </label>
                                    <input
                                        type="text"
                                        id="zone_code"
                                        value={newTariff.zone_code || ''}
                                        onChange={(e) => setNewTariff({...newTariff, zone_code: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        value={newTariff.start_date || ''}
                                        onChange={(e) => setNewTariff({...newTariff, start_date: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="day_rate_start" className="block text-sm font-medium text-gray-700">
                                        Day Rate (Start)
                                    </label>
                                    <input
                                        type="number"
                                        id="day_rate_start"
                                        value={newTariff.day_rate_start || ''}
                                        onChange={(e) => setNewTariff({...newTariff, day_rate_start: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="night_rate_start" className="block text-sm font-medium text-gray-700">
                                        Night Rate (Start)
                                    </label>
                                    <input
                                        type="number"
                                        id="night_rate_start"
                                        value={newTariff.night_rate_start || ''}
                                        onChange={(e) => setNewTariff({...newTariff, night_rate_start: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        value={newTariff.end_date || ''}
                                        onChange={(e) => setNewTariff({...newTariff, end_date: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="day_rate_end" className="block text-sm font-medium text-gray-700">
                                        Day Rate (End)
                                    </label>
                                    <input
                                        type="number"
                                        id="day_rate_end"
                                        value={newTariff.day_rate_end || ''}
                                        onChange={(e) => setNewTariff({...newTariff, day_rate_end: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="night_rate_end" className="block text-sm font-medium text-gray-700">
                                        Night Rate (End)
                                    </label>
                                    <input
                                        type="number"
                                        id="night_rate_end"
                                        value={newTariff.night_rate_end || ''}
                                        onChange={(e) => setNewTariff({...newTariff, night_rate_end: parseFloat(e.target.value)})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Create Tariff
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

