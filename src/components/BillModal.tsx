"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, DollarSign, PersonStanding, Home, Phone } from "lucide-react"
import type { Bill } from "../types/index"
import { format } from "date-fns"

/**
 * Props interface for BillModal component
 * @property bill - The bill data to display
 * @property isOpen - Controls the visibility of the modal
 * @property onClose - Callback function to close the modal
 * @property onSave - Callback function to save the bill
 * @property loading - Loading state for save operation
 */
interface BillModalProps {
    bill: Bill
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    loading: boolean
}

/**
 * BillModal Component
 * A modal component that displays detailed information about a bill
 * Features:
 * - Animated entrance and exit
 * - Bill period display
 * - Total amount display
 * - Subscriber information
 * - Save functionality
 */
export default function BillModal({ bill, isOpen, onClose, onSave, loading }: BillModalProps) {
    return (
        // Animation wrapper for modal
        <AnimatePresence>
            {isOpen && (
                // Modal backdrop with fade animation
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={onClose}
                >
                    {/* Modal content with scale animation */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header with title and close button */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Детали счета</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {/* Bill details grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Bill period information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600">Период</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    <Calendar className="inline-block mr-1 h-5 w-5" />
                                    {format(new Date(bill.start_date), "dd/MM/yyyy")} - {format(new Date(bill.end_date), "dd/MM/yyyy")}
                                </p>
                            </div>
                            {/* Total amount information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600">Общая сумма</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    <DollarSign className="inline-block mr-1 h-5 w-5" />${bill.amount.toFixed(2)}
                                </p>
                            </div>
                            {/* Subscriber name information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600">Имя подписчика</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    <PersonStanding className="inline-block mr-1 h-5 w-5" />
                                    {bill.subscriberName}
                                </p>
                            </div>
                            {/* Subscriber address information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600">Адресс подписчика</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    <Home className="inline-block mr-1 h-5 w-5" />
                                    {bill.subscriberAddress}
                                </p>
                            </div>
                        </div>
                        {/* Save button */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onSave}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                disabled={loading}
                            >
                                Сохранить счет
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}