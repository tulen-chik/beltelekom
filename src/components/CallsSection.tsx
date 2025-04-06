"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash, Edit, X, Search } from "lucide-react"
import type {Call, Subscriber, Tariff} from "../types/index"
import DateRangePicker from "./DateRangePicker"

export default function CallsSection() {
    const [calls, setCalls] = useState<Call[]>([])
    const [tariffs, setTariffs] = useState<Tariff[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [selectedCall, setSelectedCall] = useState<Call | null>(null)
    const [newCall, setNewCall] = useState<Partial<Call>>({
        zone_code: "",
        call_date: "",
        start_time: "",
        duration: 0,
        subscriber_id: "",
    })
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [searchResults, setSearchResults] = useState<Subscriber[]>([])

    // Загрузка звонков
    const fetchCalls = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.from("calls").select("*")
            if (error) throw error
            setCalls(data || [])
        } catch (error) {
            console.error("Ошибка получения звонков:", error)
            setError("Не удалось загрузить звонки. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Загрузка тарифов
    const fetchTariffs = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.from("tariffs").select("*")
            if (error) throw error
            setTariffs(data || [])
        } catch (error) {
            console.error("Ошибка получения тарифов:", error)
            setError("Не удалось загрузить тарифы. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCalls()
        fetchTariffs()
    }, [])

    // Поиск абонентов по номеру телефона и имени
    const handleSearch = async () => {
        setLoading(true)
        setError(null)
        try {
            // Сначала получаем всех абонентов
            const { data, error } = await supabase
                .from("subscribers_profiles")
                .select("*")

            if (error) throw error

            // Фильтруем на клиенте
            const filtered = data?.filter(subscriber => {
                const phone = subscriber.raw_user_meta_data?.phone_number || ""
                const name = subscriber.raw_user_meta_data?.full_name || ""
                return phone.includes(searchTerm) || name.includes(searchTerm) && subscriber.role != "admin"
            }) || []

            setSearchResults(filtered)
        } catch (error) {
            console.error("Ошибка поиска абонентов:", error)
            setError("Не удалось найти абонентов. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Открытие модального окна для создания или редактирования
    const openModal = (call: Call | null = null) => {
        if (call) {
            setSelectedCall(call)
            setNewCall(call)
            setIsEditing(true)
        } else {
            setNewCall({
                zone_code: "",
                call_date: "",
                start_time: "",
                duration: 0,
                subscriber_id: "",
            })
            setIsEditing(false)
        }
        setIsModalOpen(true)
    }

    // Закрытие модального окна
    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedCall(null)
        setNewCall({
            zone_code: "",
            call_date: "",
            start_time: "",
            duration: 0,
            subscriber_id: "",
        })
    }

    // Создание или обновление звонка
    const handleSaveCall = async () => {
        if (
            newCall.zone_code &&
            newCall.call_date &&
            newCall.start_time &&
            newCall.duration !== undefined &&
            newCall.subscriber_id
        ) {
            setLoading(true)
            setError(null)
            try {
                if (isEditing && selectedCall) {
                    const { data, error } = await supabase
                        .from("calls")
                        .update(newCall)
                        .eq("id", selectedCall.id)
                    if (error) throw error
                    console.log("Звонок успешно обновлен:", data)
                    alert("Звонок успешно обновлен!")
                } else {
                    const { data, error } = await supabase.from("calls").insert(newCall)
                    if (error) throw error
                    console.log("Звонок успешно создан:", data)
                    alert("Звонок успешно создан!")
                }
                closeModal()
                fetchCalls()
            } catch (error) {
                console.error("Ошибка сохранения звонка:", error)
                setError("Не удалось сохранить звонок. Пожалуйста, попробуйте снова.")
            } finally {
                setLoading(false)
            }
        } else {
            setError("Пожалуйста, заполните все обязательные поля.")
        }
    }

    // Удаление звонка
    const handleDeleteCall = async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from("calls").delete().eq("id", id)
            if (error) throw error
            alert("Звонок успешно удален!")
            fetchCalls()
        } catch (error) {
            console.error("Ошибка удаления звонка:", error)
            setError("Не удалось удалить звонок. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Управление звонками</h2>
            <button
                onClick={() => openModal()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center mb-4"
            >
                <Plus className="mr-2 h-5 w-5" />
                Создать звонок
            </button>

            {loading && <p className="text-center text-gray-600">Загрузка...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">ID</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Код зоны</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Дата звонка</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Время начала</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Длительность</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">ID абонента</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {calls.map((call) => (
                        <tr key={call.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-800">{call.id}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{call.zone_code}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{call.call_date}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{call.start_time}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{call.duration}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{call.subscriber_id}</td>
                            <td className="py-2 px-4 text-sm text-gray-800 flex space-x-2">
                                <button
                                    onClick={() => openModal(call)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCall(call.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно создания/редактирования звонка */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isEditing ? "Редактировать звонок" : "Создать звонок"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveCall()
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
                                        placeholder="Введите имя или номер телефона (+375...)"
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
                                                    setNewCall((prev) => ({
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
                                                <div className="text-sm text-gray-600">
                                                    Адрес: {result.raw_user_meta_data?.address || "Не указан"}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Выбор кода зоны из тарифов */}
                            <div>
                                <label htmlFor="zone_code" className="block text-sm font-medium text-gray-700">
                                    Код зоны
                                </label>
                                <select
                                    id="zone_code"
                                    value={newCall.zone_code || ""}
                                    onChange={(e) => setNewCall({ ...newCall, zone_code: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                >
                                    <option value="">Выберите код зоны</option>
                                    {tariffs.map((tariff) => (
                                        <option key={`${tariff.zone_code}-${tariff.start_date}`} value={tariff.zone_code}>
                                            {tariff.zone_code} - {tariff.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Остальные поля формы */}
                            <div>
                                <label htmlFor="call_date" className="block text-sm font-medium text-gray-700">
                                    Дата звонка
                                </label>
                                <input
                                    type="date"
                                    id="call_date"
                                    value={newCall.call_date || ""}
                                    onChange={(e) => setNewCall({ ...newCall, call_date: e.target.value })}
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
                                    value={newCall.start_time || ""}
                                    onChange={(e) => setNewCall({ ...newCall, start_time: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                    Длительность (в секундах)
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    value={newCall.duration || 0}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setNewCall({...newCall, duration: value >= 0 ? value : 0});
                                    }}
                                    min="0"
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