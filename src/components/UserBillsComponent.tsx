'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, DollarSign, PhoneCall, X, LogOut } from 'lucide-react'
import {router} from "next/client";
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";

interface CallDetail {
    cost: number
    date: string
    time: string
    duration: number
}

interface Bill {
    id: string
    subscriber_id: string
    start_date: string
    end_date: string
    amount: number
    details: CallDetail[]
    created_at: string
}

interface UserBillsComponentProps {
    initialBills: Bill[]
    userId: string
}

export default function UserBillsComponent({ initialBills, userId }: UserBillsComponentProps) {
    const [bills] = useState<Bill[]>(initialBills)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        return `${hours}h ${minutes}m ${remainingSeconds}s`
    }

    useEffect(() => {
        if (selectedBill) {
            setIsModalOpen(true)
        }
    }, [selectedBill])

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedBill(null)
    }

    const router = useRouter()

    const handleLogout = () => {
        Cookies.remove('userRole')
        Cookies.remove('userProfile')
        router.push('/')
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ваши счета</h1>
                        <p className="text-gray-600">Управляйте своими счетами</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
                    >
                        <LogOut className="mr-2 h-5 w-5"/>
                        Выйти
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">История счетов</h2>
                {bills.length === 0 ? (
                    <p className="text-center text-gray-600">Счета не найдены.</p>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {bills.map((bill) => (
                            <motion.div
                                key={bill.id}
                                className="cursor-pointer p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-gray-50"
                                onClick={() => setSelectedBill(bill)}
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-lg text-gray-800">${bill.amount.toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">
                                            <CalendarDays className="inline-block mr-1 h-4 w-4"/>
                                            {format(new Date(bill.start_date), 'dd/MM/yyyy')} - {format(new Date(bill.end_date), 'dd/MM/yyyy')}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <Clock className="inline-block mr-1 h-4 w-4"/>
                                        {format(new Date(bill.created_at), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && selectedBill && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.9, opacity: 0}}
                            className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Детали счета</h2>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Период</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <CalendarDays className="inline-block mr-1 h-5 w-5"/>
                                        {format(new Date(selectedBill.start_date), 'dd/MM/yyyy')} - {format(new Date(selectedBill.end_date), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Общая сумма</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <DollarSign className="inline-block mr-1 h-5 w-5"/>
                                        ${selectedBill.amount.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Создан</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Clock className="inline-block mr-1 h-5 w-5"/>
                                        {format(new Date(selectedBill.created_at), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">ID подписчика</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <PhoneCall className="inline-block mr-1 h-5 w-5"/>
                                        {selectedBill.subscriber_id}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Звонки</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата</th>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Время</th>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Продолжительность</th>
                                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Стоимость</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {selectedBill.details.map((call, index) => (
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
