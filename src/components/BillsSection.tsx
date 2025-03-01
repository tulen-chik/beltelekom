"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash, Edit, X, Search } from "lucide-react"
import type { Call, Subscriber, Rate } from "../types/index"
import DateRangePicker from "./DateRangePicker"
import CallsList from "./CallsList"

export interface Bill {
    id: string // UUID
    subscriber_id: string // UUID
    paid: boolean
    start_date: string // Дата в формате строки (например, "2023-10-01")
    end_date: string // Дата в формате строки (например, "2023-10-31")
    amount: number // Число с плавающей точкой (например, 100.50)
    details: Record<string, any> // JSONB объект
    created_at: string // Дата и время в формате строки (например, "2023-10-01T12:00:00Z")
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
                .ilike("subscriber_id_substring", `%${searchTerm}%`)

            if (error) throw error
            setSearchResults(data || [])
        } catch (error) {
            console.error("Ошибка поиска абонентов:", error)
            setError("Не удалось найти абонентов. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Загрузка звонков для выбранного абонента и диапазона дат
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
                if (data.length === 0) {
                    setError("Звонки за выбранный период не найдены.")
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

    // Выбор/отмена звонков
    const handleCallToggle = (call: Call) => {
        setSelectedCalls((prev) => {
            const isSelected = prev.some((c) => c.id === call.id)
            return isSelected ? prev.filter((c) => c.id !== call.id) : [...prev, call]
        })
    }

    const handleSelectAll = () => setSelectedCalls(calls)
    const handleDeselectAll = () => setSelectedCalls([])

    // Открытие модального окна для создания или редактирования
    const openModal = (bill: Bill | null = null) => {
        if (bill) {
            setSelectedBill(bill)
            setNewBill(bill)
            setIsEditing(true)
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

    // Генерация счета на основе выбранных звонков
    const generateBill = async () => {
        setLoading(true)
        setError(null)
        let totalAmount = 0
        const details: Bill["details"] = []

        try {
            for (const call of selectedCalls) {
                const { data: tariff, error } = await supabase
                    .from("tariffs")
                    .select("*")
                    .eq("zone_code", call.zone_code)
                    .lte("start_date", call.call_date)
                    .gte("end_date", call.call_date)
                    .single()

                if (error) throw error

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
                        tariffName: tariff.name,
                    })
                }
            }

            if (selectedSubscriber && startDate && endDate) {
                setNewBill({
                    subscriber_id: selectedSubscriber.subscriber_id,
                    start_date: startDate.toISOString().split("T")[0],
                    end_date: endDate.toISOString().split("T")[0],
                    amount: totalAmount,
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

    const handleSaveBill = async () => {
        if (newBill.subscriber_id && newBill.start_date && newBill.end_date && newBill.amount !== undefined) {
            setLoading(true)
            setError(null)
            try {
                const billData = {
                    ...newBill,
                    details: {
                        calls: selectedCalls.map((call) => ({
                            id: call.id,
                            call_date: call.call_date,
                            start_time: call.start_time,
                            duration: call.duration,
                            zone_code: call.zone_code,
                        })),
                    },
                }

                if (isEditing && selectedBill) {
                    // Обновление счета
                    const { data, error } = await supabase.from("bills").update(billData).eq("id", selectedBill.id)
                    if (error) throw error
                    console.log("Счет успешно обновлен:", data)
                    alert("Счет успешно обновлен!")
                } else {
                    // Создание счета
                    const { data, error } = await supabase.from("bills").insert(billData)
                    if (error) throw error
                    console.log("Счет успешно создан:", data)
                    alert("Счет успешно создан!")
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

            {loading && <p className="text-center text-gray-600">Загрузка счетов...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">ID</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">ID абонента</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Оплачен</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата начала</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата окончания</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Сумма</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Детали</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {bills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.id}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.subscriber_id}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.paid ? "Да" : "Нет"}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.start_date}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.end_date}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bill.amount}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{JSON.stringify(bill.details)}</td>
                            <td className="py-2 px-4 text-sm text-gray-800 flex space-x-2">
                                <button onClick={() => openModal(bill)} className="text-blue-500 hover:text-blue-700">
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteBill(bill.id)} className="text-red-500 hover:text-red-700">
                                    <Trash className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно создания/редактирования счета */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isEditing ? "Редактировать счет" : "Создать счет"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveBill()
                            }}
                            className="space-y-4"
                        >
                            {/* Поиск абонента */}
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
                                        placeholder="Введите ID, имя, номер телефона или адрес"
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
                                        {searchResults.map((result) => (
                                            <li
                                                key={result.subscriber_id}
                                                onClick={() => {
                                                    setSelectedSubscriber(result)
                                                    setNewBill((prev) => ({
                                                        ...prev,
                                                        subscriber_id: result.subscriber_id,
                                                    }))
                                                    setSearchResults([]) // Очистить результаты поиска
                                                }}
                                                className="cursor-pointer hover:bg-gray-100 p-2 transition-colors"
                                            >
                                                <div className="font-semibold">
                                                    {result.raw_user_meta_data?.full_name || "Неизвестный абонент"}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Телефон: {result.raw_user_meta_data?.phone_number || "Не указан"}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Адрес: {result.raw_user_meta_data?.address || "Не указан"}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Поле для отображения выбранного абонента */}
                            {selectedSubscriber && (
                                <div className="mt-4 p-2 border rounded bg-gray-50">
                                    <p className="text-sm text-gray-700">
                                        Выбранный абонент:{" "}
                                        <span className="font-semibold">
                      {selectedSubscriber.raw_user_meta_data?.full_name || "Неизвестный абонент"}
                    </span>
                                    </p>
                                </div>
                            )}

                            {/* Выбор диапазона дат */}
                            <div>
                                <DateRangePicker
                                    onStartDateChange={setStartDate}
                                    onEndDateChange={setEndDate}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            </div>

                            {/* Список звонков */}
                            {calls.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Звонки</h3>
                                    <CallsList
                                        calls={calls}
                                        selectedCalls={selectedCalls}
                                        onToggleCall={handleCallToggle}
                                        onSelectAll={handleSelectAll}
                                        onDeselectAll={handleDeselectAll}
                                    />
                                </div>
                            )}

                            {/* Генерация счета */}
                            {selectedCalls.length > 0 && (
                                <div className="mt-4">
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

                            {/* Остальные поля формы */}
                            <div>
                                <label htmlFor="paid" className="block text-sm font-medium text-gray-700">
                                    Оплачен
                                </label>
                                <input
                                    type="checkbox"
                                    id="paid"
                                    checked={newBill.paid || false}
                                    onChange={(e) => setNewBill({ ...newBill, paid: e.target.checked })}
                                    className="mt-1 block"
                                />
                            </div>
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                    Дата начала
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    value={newBill.start_date || ""}
                                    onChange={(e) => setNewBill({ ...newBill, start_date: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                                    value={newBill.end_date || ""}
                                    onChange={(e) => setNewBill({ ...newBill, end_date: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                    Сумма
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={newBill.amount || 0}
                                    onChange={(e) => setNewBill({ ...newBill, amount: Number.parseFloat(e.target.value) })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                >
                                    Закрыть
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    disabled={loading}
                                >
                                    {isEditing ? "Сохранить" : "Создать"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

