'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, DollarSign, X, LogOut, PersonStanding, Home, Phone, Wallet, Download } from 'lucide-react'
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { supabase } from '@/lib/supabase'
import { Subscriber } from "@/types"
import { jsPDF } from "jspdf"
// @ts-ignore
import autoTable from 'jspdf-autotable'

interface Bill {
    id: string
    subscriber_id: string
    start_date: string
    end_date: string
    amount: number
    details: {
        calls: {
            id: number
            duration: number
            call_date: string
            zone_code: string
            start_time: string
        }[]
    }
    created_at: string
    subscriberName: string
    subscriberAddress: string
}

interface UserBillsComponentProps {
    initialBills: Bill[]
    userId: Subscriber
}

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}ч ${minutes}м ${remainingSeconds}с`
}

export default function UserBillsComponent({ initialBills, userId }: UserBillsComponentProps) {
    const [bills, setBills] = useState<Bill[]>(initialBills)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userData, setUserData] = useState<Subscriber | null>(null)
    const [balance, setBalance] = useState<number | null>(null)
    const router = useRouter()

    useEffect(() => {
        setBills(initialBills)
        fetchUserData()
    }, [initialBills, userId])



    const fetchUserData = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('subscribers_profiles')
                .select('*')
                .eq('subscriber_id', userId.subscriber_id)
                .single()

            if (error) throw error

            setUserData(data)
            setBalance(data.money)
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error)
            setError('Не удалось загрузить данные пользователя')
        } finally {
            setLoading(false)
        }
    }

    const handleBillSelect = (bill: Bill) => {
        setSelectedBill(bill)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedBill(null)
    }

    const handleLogout = () => {
        Cookies.remove('userRole')
        Cookies.remove('userProfile')
        router.push('/')
    }

    const downloadBillAsPdf = () => {
        if (!selectedBill || !userData) return

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm'
        })

        // Добавляем кириллический шрифт
        try {
            // Замените '/fonts/NotoSans-Regular.ttf' на актуальный путь к вашему шрифту
            doc.addFont('/NotoSans-Regular.ttf', 'NotoSans', 'normal')
            doc.setFont('NotoSans')
        } catch (error) {
            console.error('Ошибка загрузки шрифта:', error)
            doc.setFont('helvetica') // fallback
        }

        // Заголовок
        doc.setFontSize(18)
        doc.text('Детали счета', 105, 20, { align: 'center' })

        // Информация о подписчике
        doc.setFontSize(12)
        doc.text(`Имя: ${userData.raw_user_meta_data?.full_name || 'Не указано'}`, 14, 40)
        doc.text(`Адрес: ${userData.raw_user_meta_data?.address || 'Не указано'}`, 14, 50)
        doc.text(`Телефон: ${userData.raw_user_meta_data?.phone_number || 'Не указано'}`, 14, 60)

        // Информация о счете
        doc.text(`Период: ${format(new Date(selectedBill.start_date), 'dd/MM/yyyy')} - ${format(new Date(selectedBill.end_date), 'dd/MM/yyyy')}`, 14, 75)
        doc.text(`Сумма: $${selectedBill.amount.toFixed(2)}`, 14, 85)
        doc.text(`Дата создания: ${format(new Date(selectedBill.created_at), 'dd/MM/yyyy HH:mm')}`, 14, 95)

        // Подготовка данных для таблицы
        const callData = selectedBill.details.calls.map(call => [
            format(new Date(call.call_date), 'dd/MM/yyyy'),
            call.start_time,
            call.zone_code,
            formatDuration(call.duration)
        ])

        // Таблица с вызовами
        autoTable(doc, {
            startY: 110,
            head: [['Дата', 'Время', 'Тариф', 'Продолжительность']],
            body: callData,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                font: 'NotoSans',
                fontStyle: 'normal'
            },
            bodyStyles: {
                font: 'NotoSans',
                fontStyle: 'normal'
            },
            styles: {
                cellPadding: 3,
                fontSize: 10,
                font: 'NotoSans',
                fontStyle: 'normal'
            }
        })

        // Итоговая информация
        const finalY = (doc as any).lastAutoTable.finalY + 10
        doc.text(`Общее количество звонков: ${selectedBill.details.calls.length}`, 14, finalY)
        doc.text(`Текущий баланс: $${balance?.toFixed(2) || '0.00'}`, 14, finalY + 10)

        // Сохранение PDF
        doc.save(`Счет_${selectedBill.id}_${format(new Date(), 'yyyyMMdd')}.pdf`)
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ваши счета</h1>
                        <p className="text-gray-600">Управляйте своими счетами</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {balance !== null && (
                            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                                <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="font-semibold text-blue-600">
                                    Баланс: ${balance.toFixed(2)}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
                        >
                            <LogOut className="mr-2 h-5 w-5"/>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">История счетов</h2>
                {loading ? (
                    <p className="text-center text-gray-600">Загрузка данных...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : bills.length === 0 ? (
                    <p className="text-center text-gray-600">Счета не найдены.</p>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {bills.map((bill) => (
                            <motion.div
                                key={bill.id}
                                className="cursor-pointer p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-gray-50"
                                onClick={() => handleBillSelect(bill)}
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
                                <div className="flex space-x-2">
                                    <button
                                        onClick={downloadBillAsPdf}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="Скачать PDF"
                                    >
                                        <Download className="h-5 w-5"/>
                                    </button>
                                    <button onClick={closeModal} className="p-2 text-gray-500 hover:text-gray-700">
                                        <X className="h-6 w-6"/>
                                    </button>
                                </div>
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
                                    <p className="text-sm font-medium text-gray-600">Имя подписчика</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <PersonStanding className="inline-block mr-1 h-5 w-5"/>
                                        {userData?.raw_user_meta_data?.full_name || 'Не указано'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Адрес подписчика</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Home className="inline-block mr-1 h-5 w-5"/>
                                        {userData?.raw_user_meta_data?.address || 'Не указано'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Номер телефона</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Phone className="inline-block mr-1 h-5 w-5"/>
                                        {userData?.raw_user_meta_data?.phone_number || 'Не указано'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Текущий баланс</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Wallet className="inline-block mr-1 h-5 w-5"/>
                                        ${balance?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Детали звонков</h3>
                            {Object.entries(selectedBill.details.calls.reduce<Record<string, any[]>>((acc, call) => {
                                const tariffName = call.zone_code;
                                if (!acc[tariffName]) {
                                    acc[tariffName] = [];
                                }
                                acc[tariffName].push(call);
                                return acc;
                            }, {})).map(([tariffName, calls]) => (
                                <div key={tariffName} className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Тариф: {tariffName}</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead className="bg-gray-100">
                                            <tr>
                                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата</th>
                                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Время</th>
                                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Продолжительность</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {calls.map((call, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="py-2 px-4 text-sm text-gray-800">{format(new Date(call.call_date), 'dd/MM/yyyy')}</td>
                                                    <td className="py-2 px-4 text-sm text-gray-800">{call.start_time}</td>
                                                    <td className="py-2 px-4 text-sm text-gray-800">{formatDuration(call.duration)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}