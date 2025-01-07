'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Calendar,
    DollarSign,
    X,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp,
    LogOut,
    Phone,
    Plus,
    Tag,
    FileText,
    Home, PersonStanding
} from 'lucide-react'
import { Subscriber, Call, Tariff, Bill, Rate, BillDetail } from '../types/index'
import { format } from 'date-fns'
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function AdminPanel() {
    const [activeSection, setActiveSection] = useState<'calls' | 'bills' | 'tariffs'>('calls')
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
            console.error('Ошибка поиска абонентов:', error)
            setError('Не удалось найти абонентов. Пожалуйста, попробуйте снова.')
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
                    setError('Звонки за выбранный период не найдены.')
                }
            } catch (error) {
                console.error('Ошибка получения звонков:', error)
                setError('Не удалось получить звонки. Пожалуйста, попробуйте снова.')
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
            setTariffs(response.data || [])
        } catch (error) {
            console.error('Ошибка получения тарифов:', error)
            setError('Не удалось получить тарифы. Пожалуйста, попробуйте снова.')
            setTariffs([])
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
                    const rate: Rate = isDayTime ? tariff.day_rate_end : tariff.night_rate_end
                    const callCost = (call.duration / 60) * (rate ? rate : 0)

                    totalAmount += callCost
                    details.push({
                        date: call.call_date,
                        time: call.start_time,
                        duration: call.duration,
                        cost: callCost,
                        tariffName: tariff.name
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
                    created_at: new Date().toISOString(),
                    subscriberAddress: selectedSubscriber.raw_user_meta_data?.address || "",
                    subscriberName: selectedSubscriber.raw_user_meta_data?.full_name || ""
                })
                setIsModalOpen(true)
            }
        } catch (error) {
            console.error("Ошибка генерации счета:", error)
            setError('Не удалось сгенерировать счет. Пожалуйста, попробуйте снова.')
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
                console.log('Счет успешно сохранен:', response.data)
                alert('Счет успешно сохранен!')
                setSelectedCalls([])
                setBill(null)
                setIsModalOpen(false)
            } catch (error) {
                console.error('Ошибка сохранения счета:', error)
                setError('Не удалось сохранить счет. Пожалуйста, попробуйте снова.')
            } finally {
                setLoading(false)
            }
        }
    }

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        return `${hours}ч ${minutes}м ${remainingSeconds}с`
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
                console.log('Звонок успешно создан:', response.data)
                alert('Звонок успешно создан!')
                setIsCreateCallModalOpen(false)
                setNewCall({})
                fetchCalls()
            } catch (error) {
                console.error('Ошибка создания звонка:', error)
                setError('Не удалось создать звонок. Пожалуйста, попробуйте снова.')
            } finally {
                setLoading(false)
            }
        } else {
            setError('Пожалуйста, заполните все обязательные поля.')
        }
    }

    const handleCreateTariff = async () => {
        if (newTariff.zone_code && newTariff.name && newTariff.start_date && newTariff.end_date && newTariff.day_rate_start !== undefined && newTariff.night_rate_start !== undefined && newTariff.day_rate_end !== undefined && newTariff.night_rate_end !== undefined) {
            setLoading(true)
            setError(null)
            try {
                const response = await axios.post('/api/tariffs', newTariff)
                console.log('Тариф успешно создан:', response.data)
                alert('Тариф успешно создан!')
                setIsCreateTariffModalOpen(false)
                setNewTariff({name:'', start_date:'', day_rate_start:0, night_rate_start:0, end_date:'', day_rate_end:0, night_rate_end:0, zone_code:''})
                fetchTariffs()
            } catch (error) {
                console.error('Ошибка создания тарифа:', error)
                setError('Не удалось создать тариф. Пожалуйста, попробуйте снова.')
            } finally {
                setLoading(false)
            }
        } else {
            setError('Пожалуйста, заполните все обязательные поля.')
        }
    }

    const handleDeleteTariff = async (zoneCode: string) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`/api/tariffs?zone_code=${encodeURIComponent(zoneCode)}`);
            alert('Тариф успешно удален!');
            fetchTariffs();
        } catch (error) {
            console.error('Ошибка удаления тарифа:', error);
            setError('Не удалось удалить тариф. Пожалуйста, попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Боковая панель */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Панель администратора</h1>
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setActiveSection('calls')}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === 'calls' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <Phone className="mr-2" />
                                    Звонки
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('tariffs')}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === 'tariffs' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <Tag className="mr-2" />
                                    Тарифы
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="absolute bottom-4 left-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-red-500 hover:text-red-700"
                    >
                        <LogOut className="mr-2" />
                        Выйти
                    </button>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeSection === 'calls' && (
                    <div className="space-y-8">
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Поиск абонента</h2>
                            <div className="flex items-center mb-4">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Введите полный или частичный ID абонента"
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
                                            ID абонента: {result.subscriber_id}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {selectedSubscriber && (
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">Выбор диапазона дат</h2>
                                    <button
                                        onClick={() => setIsCreateCallModalOpen(true)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                                    >
                                        <Plus className="mr-2 h-5 w-5"/>
                                        Создать звонок
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
                                            placeholderText="Дата начала"
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
                                            placeholderText="Дата окончания"
                                            className="border rounded p-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="bg-blue-100 text-blue-700 p-4 rounded mb-4">
                                Загрузка...
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {calls.length > 0 && (
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-semibold text-gray-800">Выбрать звонки</h2>
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
                                                Выбрать все
                                            </button>
                                            <button
                                                onClick={handleDeselectAll}
                                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                            >
                                                Отменить все
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
                                                    <span>{new Date(call.call_date).toLocaleDateString()} - {call.start_time} - {call.duration} секунд</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {selectedCalls.length > 0 && (
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Генерация счета</h2>
                                <button
                                    onClick={generateBill}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                    disabled={loading}
                                >
                                    Сгенерировать счет
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'bills' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Управление счетами</h2>
                        {/* Добавьте функциональность управления счетами здесь */}
                    </div>
                )}

                {activeSection === 'tariffs' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Управление тарифами</h2>
                            <button
                                onClick={() => setIsCreateTariffModalOpen(true)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                            >
                                <Plus className="mr-2 h-5 w-5"/>
                                Создать тариф
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Код зоны</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Название</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата начала</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата окончания</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дневной тариф</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Ночной тариф</th>
                                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {tariffs && tariffs.length > 0 ? (
                                    tariffs.map((tariff) => (
                                        <tr key={tariff.zone_code} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 text-sm text-gray-800">{tariff.zone_code}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{tariff.name}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{tariff.start_date}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{tariff.end_date}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">${tariff.day_rate_end?.toFixed(2) ?? 'N/A'}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">${tariff.night_rate_end?.toFixed(2) ?? 'N/A'}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">
                                                <button
                                                    onClick={() => handleDeleteTariff(tariff.zone_code)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-4 px-4 text-sm text-gray-500 text-center">
                                            Нет доступных тарифов
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

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
                                <h2 className="text-2xl font-semibold text-gray-800">Детали счета</h2>
                                <button onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Период</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Calendar className="inline-block mr-1 h-5 w-5"/>
                                        {format(new Date(bill.start_date), 'dd/MM/yyyy')} - {format(new Date(bill.end_date), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Общая сумма</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <DollarSign className="inline-block mr-1 h-5 w-5"/>
                                        ${bill.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Имя подписчика</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <PersonStanding className="inline-block mr-1 h-5 w-5"/>
                                        {bill.subscriberName}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Адресс подписчика</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <Home className="inline-block mr-1 h-5 w-5"/>
                                        {bill.subscriberAddress}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Детали звонков</h3>
                            {Object.entries(bill.details.reduce<Record<string, BillDetail[]>>((acc, call) => {
                                if (!acc[call.tariffName]) {
                                    acc[call.tariffName] = [];
                                }
                                acc[call.tariffName].push(call);
                                return acc;
                            }, {})).map(([tariffName, calls]) => (
                                <div key={tariffName} className="mb-6">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-700">{tariffName}</h4>
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
                                            {calls.map((call, index) => (
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
                                </div>
                            ))}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={saveBill}
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
                                <h2 className="text-2xl font-semibold text-gray-800">Создать новый звонок</h2>
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
                                        Дата звонка
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
                                        Время начала
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
                                        Продолжительность (секунды)
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
                                        Код зоны
                                    </label>
                                    <select
                                        id="zone_code"
                                        value={newCall.zone_code || ''}
                                        onChange={(e) => setNewCall({...newCall, zone_code: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    >
                                        <option value="">Выберите зону</option>
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
                                        Создать звонок
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
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setIsCreateTariffModalOpen(false)}
                    >
                        <motion.div
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.9, opacity: 0}}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Создать новый тариф</h2>
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
                                        Название
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
                                        Код зоны
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
                                        Дата начала
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
                                        Дневной тариф (начало)
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
                                        Ночной тариф (начало)
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
                                        Дата окончания
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
                                        Дневной тариф (конец)
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
                                        Ночной тариф (конец)
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
                                        Создать тариф
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
