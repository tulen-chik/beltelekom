"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash, Edit, X, Search } from "lucide-react"
import type { Call, Subscriber } from "../types/index"
import DateRangePicker from "./DateRangePicker"
import CallsList from "./CallsList"
import { sendBillEmail } from '@/app/actions/sendBillEmail'

interface Bill {
    id: string
    subscriber_id: string
    paid: boolean
    start_date: string
    end_date: string
    amount: number
    details: Record<string, any>
    created_at: string
}

export default function BillsSection() {
    const [bills, setBills] = useState<Bill[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [newBill, setNewBill] = useState<Partial<Bill>>({
        subscriber_id: "",
        paid: false,
        start_date: "",
        end_date: "",
        amount: 0,
        details: {},
    })
    const [selectedCalls, setSelectedCalls] = useState<Call[]>([])
    const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [calls, setCalls] = useState<Call[]>([])
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [searchResults, setSearchResults] = useState<Subscriber[]>([])

    // Загрузка счетов
    const fetchBills = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.from("bills").select("*")
            if (error) throw error
            setBills(data || [])
        } catch (error) {
            console.error("Ошибка получения счетов:", error)
            setError("Не удалось загрузить счета. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBills()
    }, [])

    // Поиск абонентов
    const handleSearch = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from("subscribers_profiles")
                .select("*")

            if (error) throw error

            const filtered = data?.filter(subscriber => {
                const phone = subscriber.raw_user_meta_data?.phone_number || ""
                const name = subscriber.raw_user_meta_data?.full_name || ""
                return (phone.includes(searchTerm) || name.includes(searchTerm)) && subscriber.role != "admin"
            }) || []

            setSearchResults(filtered)
        } catch (error) {
            console.error("Ошибка поиска абонентов:", error)
            setError("Не удалось найти абонентов. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Загрузка звонков
    const fetchCalls = async () => {
        if (selectedSubscriber && startDate && endDate) {
            setLoading(true)
            setError(null)
            try {
                const { data, error } = await supabase
                    .from("calls")
                    .select("*")
                    .eq("subscriber_id", selectedSubscriber.subscriber_id)
                    .gte("call_date", startDate.toISOString().split("T")[0])
                    .lte("call_date", endDate.toISOString().split("T")[0])

                if (error) throw error
                setCalls(data || [])
                setSelectedCalls([])

                if (!data || data.length === 0) {
                    setError("Звонков за выбранный период не найдено")
                }
            } catch (error) {
                console.error("Ошибка получения звонков:", error)
                setError("Не удалось получить звонки. Пожалуйста, попробуйте снова.")
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        if (selectedSubscriber && startDate && endDate) {
            fetchCalls()
        }
    }, [selectedSubscriber, startDate, endDate])

    // Управление выбором звонков
    const handleCallToggle = (call: Call) => {
        setSelectedCalls(prev => {
            const isSelected = prev.some(c => c.id === call.id)
            return isSelected ? prev.filter(c => c.id !== call.id) : [...prev, call]
        })
    }

    const handleSelectAll = () => setSelectedCalls([...calls])
    const handleDeselectAll = () => setSelectedCalls([])

    // Управление модальным окном
    const openModal = async (bill: Bill | null = null) => {
        if (bill) {
            setSelectedBill(bill)
            setNewBill(bill)
            setIsEditing(true)

            const { data } = await supabase
                .from('subscribers_profiles')
                .select('*')
                .eq('subscriber_id', bill.subscriber_id)
                .single()

            if (data) setSelectedSubscriber(data)
        } else {
            setNewBill({
                subscriber_id: "",
                paid: false,
                start_date: "",
                end_date: "",
                amount: 0,
                details: {},
            })
            setIsEditing(false)
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedBill(null)
        setNewBill({
            subscriber_id: "",
            paid: false,
            start_date: "",
            end_date: "",
            amount: 0,
            details: {},
        })
        setSelectedCalls([])
        setCalls([])
        setSelectedSubscriber(null)
        setStartDate(undefined)
        setEndDate(undefined)
        setSearchTerm("")
        setSearchResults([])
    }

    // Генерация счета
    const generateBill = async () => {
        setLoading(true)
        setError(null)
        let totalAmount = 0
        const details: any[] = []

        try {
            const sortedCalls = [...selectedCalls].sort((a, b) =>
                new Date(a.call_date).getTime() - new Date(b.call_date).getTime()
            )

            const oldestCallDate = sortedCalls[0]?.call_date
            const newestCallDate = sortedCalls[sortedCalls.length - 1]?.call_date

            const { data: tariffs } = await supabase.from("tariffs").select("*")

            for (const call of selectedCalls) {
                const tariff = tariffs?.find(t => t.zone_code === call.zone_code)

                if (tariff) {
                    const callTime = new Date(`1970-01-01T${call.start_time}`)
                    const isDayTime = callTime.getHours() >= 6 && callTime.getHours() < 22
                    const rate = isDayTime ? tariff.day_rate_end : tariff.night_rate_end
                    const callCost = (call.duration / 60) * (rate || 0)

                    totalAmount += callCost
                    details.push({
                        date: call.call_date,
                        time: call.start_time,
                        duration: call.duration,
                        cost: callCost,
                        tariffName: tariff.name,
                    })
                }
            }

            if (selectedSubscriber && oldestCallDate && newestCallDate) {
                setNewBill({
                    subscriber_id: selectedSubscriber.subscriber_id,
                    start_date: oldestCallDate,
                    end_date: newestCallDate,
                    amount: parseFloat(totalAmount.toFixed(2)),
                    details,
                    paid: false,
                })
            }
        } catch (error) {
            console.error("Ошибка генерации счета:", error)
            setError("Не удалось сгенерировать счет. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Сохранение счета
    const handleSaveBill = async () => {
        if (newBill.subscriber_id && newBill.start_date && newBill.end_date && newBill.amount !== undefined) {
            setLoading(true)
            setError(null)
            try {
                const billData = {
                    ...newBill,
                    details: {
                        calls: selectedCalls.map(call => ({
                            id: call.id,
                            call_date: call.call_date,
                            start_time: call.start_time,
                            duration: call.duration,
                            zone_code: call.zone_code,
                        })),
                    },
                }

                let savedBill: Bill

                if (isEditing && selectedBill) {
                    const { data, error } = await supabase
                        .from("bills")
                        .update(billData)
                        .eq("id", selectedBill.id)
                        .select()
                        .single()

                    if (error) throw error
                    savedBill = data

                    if (newBill.paid && (!selectedBill.paid || selectedBill.paid !== newBill.paid)) {
                        await supabase.rpc('decrement_balance', {
                            subscriber_id: newBill.subscriber_id,
                            amount: newBill.amount
                        })
                    }

                    alert("Счет успешно обновлен!")
                } else {
                    const { data, error } = await supabase
                        .from("bills")
                        .insert(billData)
                        .select()
                        .single()

                    if (error) throw error
                    savedBill = data

                    if (newBill.paid) {
                        await supabase.rpc('decrement_balance', {
                            subscriber_id: newBill.subscriber_id,
                            amount: newBill.amount
                        })
                    }

                    alert("Счет успешно создан!")
                }

                // Отправка email на адрес текущего пользователя
                if (selectedSubscriber?.raw_user_meta_data?.email) {

                    try {
                        console.log(selectedSubscriber.raw_user_meta_data.email)
                        const result = await sendBillEmail({
                            email: selectedSubscriber.raw_user_meta_data.email,
                            billData: {
                                id: savedBill.id,
                                amount: savedBill.amount,
                                start_date: savedBill.start_date,
                                end_date: savedBill.end_date,
                                created_at: savedBill.created_at,
                                callsCount: selectedCalls.length,
                                subscriberName: selectedSubscriber?.raw_user_meta_data?.full_name || 'Клиент'
                            }
                        })

                        if (result.success) {
                            alert("Счет отправлен на ваш email!")
                        } else {
                            console.warn("Счет сохранен, но не отправлен:", result.message)
                        }
                    } catch (emailError) {
                        console.error("Ошибка при отправке email:", emailError)
                    }
                }

                closeModal()
                fetchBills()
            } catch (error) {
                console.error("Ошибка сохранения счета:", error)
                setError("Не удалось сохранить счет. Пожалуйста, попробуйте снова.")
            } finally {
                setLoading(false)
            }
        } else {
            setError("Пожалуйста, заполните все обязательные поля.")
        }
    }

    // Удаление счета
    const handleDeleteBill = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить этот счет?")) return

        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from("bills").delete().eq("id", id)
            if (error) throw error
            alert("Счет успешно удален!")
            fetchBills()
        } catch (error) {
            console.error("Ошибка удаления счета:", error)
            setError("Не удалось удалить счет. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Управление счетами</h2>
            <button
                onClick={() => openModal()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center mb-4"
            >
                <Plus className="mr-2 h-5 w-5" />
                Создать счет
            </button>

            {loading && <p className="text-center text-gray-600">Загрузка...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">ID абонента</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Период</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Сумма</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Статус</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {bills.map(bill => (
                        <tr key={bill.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.subscriber_id}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">
                                {new Date(bill.start_date).toLocaleDateString()} - {new Date(bill.end_date).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.amount.toFixed(2)}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">
                                {bill.paid ? (
                                    <span className="text-green-600">Оплачен</span>
                                ) : (
                                    <span className="text-red-600">Не оплачен</span>
                                )}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-800 flex space-x-2">
                                <button
                                    onClick={() => openModal(bill)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Редактировать"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteBill(bill.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Удалить"
                                >
                                    <Trash className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isEditing ? "Редактировать счет" : "Создать счет"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveBill() }} className="space-y-4">
                            {/* Поиск абонента (только при создании) */}
                            {!isEditing && (
                                <div>
                                    <label htmlFor="searchSubscriber" className="block text-sm font-medium text-gray-700">
                                        Поиск абонента
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="text"
                                            id="searchSubscriber"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="Введите имя или телефон"
                                            className="border rounded-l p-2 flex-grow"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-colors"
                                        >
                                            <Search className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <ul className="mt-2 border rounded divide-y max-h-40 overflow-y-auto">
                                            {searchResults.map(result => (
                                                <li
                                                    key={result.subscriber_id}
                                                    onClick={() => {
                                                        setSelectedSubscriber(result)
                                                        setNewBill(prev => ({
                                                            ...prev,
                                                            subscriber_id: result.subscriber_id,
                                                        }))
                                                        setSearchResults([])
                                                    }}
                                                    className="cursor-pointer hover:bg-gray-100 p-2 transition-colors"
                                                >
                                                    <div className="font-semibold">
                                                        {result.raw_user_meta_data?.full_name || "Неизвестный абонент"}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Телефон: {result.raw_user_meta_data?.phone_number || "Не указан"}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Информация об абоненте */}
                            {selectedSubscriber && (
                                <div className="p-3 border rounded bg-gray-50">
                                    <p className="font-medium">
                                        Абонент: {selectedSubscriber.raw_user_meta_data?.full_name || "Неизвестный"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        ID: {selectedSubscriber.subscriber_id}
                                    </p>
                                    {isEditing && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            (Нельзя изменить абонента для существующего счета)
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Диапазон дат */}
                            <div>
                                <DateRangePicker
                                    onStartDateChange={setStartDate}
                                    onEndDateChange={setEndDate}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            </div>

                            {/* Список звонков */}
                            {calls.length > 0 ? (
                                <div className="border rounded p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">Звонки за период</h3>
                                        <div className="space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleSelectAll}
                                                className="text-sm text-blue-500 hover:text-blue-700"
                                            >
                                                Выбрать все
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeselectAll}
                                                className="text-sm text-blue-500 hover:text-blue-700"
                                            >
                                                Сбросить
                                            </button>
                                        </div>
                                    </div>
                                    <CallsList
                                        calls={calls}
                                        selectedCalls={selectedCalls}
                                        onToggleCall={handleCallToggle}
                                        onSelectAll={handleSelectAll}
                                        onDeselectAll={handleDeselectAll}
                                    />
                                    <p className="text-sm mt-2">
                                        Выбрано звонков: {selectedCalls.length} из {calls.length}
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
                                    {selectedSubscriber && startDate && endDate
                                        ? "Звонков за выбранный период не найдено"
                                        : "Выберите абонента и период для отображения звонков"}
                                </div>
                            )}

                            {/* Генерация счета */}
                            {selectedCalls.length > 0 && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={generateBill}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Сгенерировать счет
                                    </button>
                                </div>
                            )}

                            {/* Детали счета */}
                            <div className="border rounded p-4 space-y-2">
                                <h3 className="font-medium">Детали счета</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm text-gray-600">Дата начала:</label>
                                        <p>{newBill.start_date}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600">Дата окончания:</label>
                                        <p>{newBill.end_date}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600">Сумма:</label>
                                        <p>{newBill.amount?.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600">Статус оплаты:</label>
                                        <label className="inline-flex items-center mt-1">
                                            <input
                                                type="checkbox"
                                                checked={newBill.paid || false}
                                                onChange={(e) => setNewBill({...newBill, paid: e.target.checked})}
                                                className="rounded"
                                            />
                                            <span className="ml-2">Оплачен</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки управления */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    disabled={loading || !newBill.subscriber_id || !newBill.start_date || !newBill.end_date}
                                >
                                    {isEditing ? "Сохранить" : "Создать счет"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}