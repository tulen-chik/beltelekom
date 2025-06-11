"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash, Edit, X } from "lucide-react"
import { Tariff } from "@/types"

/**
 * TariffsSection Component
 * A component for managing telephone tariffs in the system
 * Features:
 * - View all tariffs
 * - Create new tariffs
 * - Edit existing tariffs
 * - Delete tariffs
 * - Form validation
 * - Error handling
 */
export default function TariffsSection() {
    // State management
    const [tariffs, setTariffs] = useState<Tariff[]>([]) // List of all tariffs
    const [loading, setLoading] = useState<boolean>(false) // Loading state
    const [error, setError] = useState<string | null>(null) // Error state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false) // Modal visibility
    const [isEditing, setIsEditing] = useState<boolean>(false) // Edit mode flag
    const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null) // Currently selected tariff
    const [newTariff, setNewTariff] = useState<Partial<Tariff>>({ // New tariff form data
        name: "",
        start_date: "",
        day_rate_start: 0,
        night_rate_start: 0,
        end_date: "",
        day_rate_end: 0,
        night_rate_end: 0,
        zone_code: "",
    })

    /**
     * Fetches all tariffs from the database
     * Updates the tariffs state with the fetched data
     */
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

    // Load tariffs on component mount
    useEffect(() => {
        fetchTariffs()
    }, [])

    /**
     * Opens the modal for creating or editing a tariff
     * @param tariff - The tariff to edit, or null for creating a new one
     */
    const openModal = (tariff: Tariff | null = null) => {
        if (tariff) {
            setSelectedTariff(tariff)
            setNewTariff(tariff)
            setIsEditing(true)
        } else {
            setNewTariff({
                name: "",
                start_date: "",
                day_rate_start: 0,
                night_rate_start: 0,
                end_date: "",
                day_rate_end: 0,
                night_rate_end: 0,
                zone_code: "",
            })
            setIsEditing(false)
        }
        setIsModalOpen(true)
    }

    /**
     * Closes the modal and resets form data
     */
    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedTariff(null)
        setNewTariff({
            name: "",
            start_date: "",
            day_rate_start: 0,
            night_rate_start: 0,
            end_date: "",
            day_rate_end: 0,
            night_rate_end: 0,
            zone_code: "",
        })
    }

    /**
     * Handles saving a new tariff or updating an existing one
     * Validates form data before submission
     */
    const handleSaveTariff = async () => {
        if (
            newTariff.zone_code &&
            newTariff.name &&
            newTariff.start_date &&
            newTariff.end_date &&
            newTariff.day_rate_start !== undefined &&
            newTariff.night_rate_start !== undefined &&
            newTariff.day_rate_end !== undefined &&
            newTariff.night_rate_end !== undefined
        ) {
            setLoading(true)
            setError(null)
            try {
                if (isEditing && selectedTariff) {
                    // Update existing tariff
                    const { data, error } = await supabase
                        .from("tariffs")
                        .update(newTariff)
                        .eq("zone_code", selectedTariff.zone_code)
                    if (error) throw error
                    console.log("Тариф успешно обновлен:", data)
                    alert("Тариф успешно обновлен!")
                } else {
                    // Create new tariff
                    const { data, error } = await supabase.from("tariffs").insert(newTariff)
                    if (error) throw error
                    console.log("Тариф успешно создан:", data)
                    alert("Тариф успешно создан!")
                }
                closeModal()
                fetchTariffs()
            } catch (error) {
                console.error("Ошибка сохранения тарифа:", error)
                setError("Не удалось сохранить тариф. Пожалуйста, попробуйте снова.")
            } finally {
                setLoading(false)
            }
        } else {
            setError("Пожалуйста, заполните все обязательные поля.")
        }
    }

    /**
     * Handles deletion of a tariff
     * @param zoneCode - The zone code of the tariff to delete
     */
    const handleDeleteTariff = async (zoneCode: string) => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from("tariffs").delete().eq("zone_code", zoneCode)
            if (error) throw error
            alert("Тариф успешно удален!")
            fetchTariffs()
        } catch (error) {
            console.error("Ошибка удаления тарифа:", error)
            setError("Не удалось удалить тариф. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    return (
        // Main container
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Управление тарифами</h2>
            {/* Create new tariff button */}
            <button
                onClick={() => openModal()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center mb-4"
            >
                <Plus className="mr-2 h-5 w-5" />
                Создать тариф
            </button>

            {/* Loading and error states */}
            {loading && <p className="text-center text-gray-600">Загрузка тарифов...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {/* Tariffs table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Код зоны</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Название</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {tariffs.map((tariff) => (
                        <tr key={tariff.zone_code} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-800">{tariff.zone_code}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{tariff.name}</td>
                            <td className="py-2 px-4 text-sm text-gray-800 flex space-x-2">
                                {/* Edit button */}
                                <button
                                    onClick={() => openModal(tariff)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                {/* Delete button */}
                                <button
                                    onClick={() => handleDeleteTariff(tariff.zone_code)}
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

            {/* Modal for creating/editing tariffs */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        {/* Modal header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isEditing ? "Редактировать тариф" : "Создать тариф"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {/* Tariff form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveTariff()
                            }}
                            className="space-y-4"
                        >
                            {/* Zone code input */}
                            <div>
                                <label htmlFor="zone_code" className="block text-sm font-medium text-gray-700">
                                    Код зоны
                                </label>
                                <input
                                    type="text"
                                    id="zone_code"
                                    value={newTariff.zone_code || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, zone_code: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            {/* Name input */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Название
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newTariff.name || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            {/* Start date input */}
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                    Дата начала
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    value={newTariff.start_date || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, start_date: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            {/* End date input */}
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    value={newTariff.end_date || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, end_date: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            {/* Day rate start input */}
                            <div>
                                <label htmlFor="day_rate_start" className="block text-sm font-medium text-gray-700">
                                    Дневной тариф (начало)
                                </label>
                                <input
                                    type="number"
                                    id="day_rate_start"
                                    value={newTariff.day_rate_start || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, day_rate_start: Number.parseFloat(e.target.value) })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    step="0.01"
                                    required
                                />
                            </div>
                            {/* Night rate start input */}
                            <div>
                                <label htmlFor="night_rate_start" className="block text-sm font-medium text-gray-700">
                                    Ночной тариф (начало)
                                </label>
                                <input
                                    type="number"
                                    id="night_rate_start"
                                    value={newTariff.night_rate_start || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, night_rate_start: Number.parseFloat(e.target.value) })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    step="0.01"
                                    required
                                />
                            </div>
                            {/* Day rate end input */}
                            <div>
                                <label htmlFor="day_rate_end" className="block text-sm font-medium text-gray-700">
                                    Дневной тариф (конец)
                                </label>
                                <input
                                    type="number"
                                    id="day_rate_end"
                                    value={newTariff.day_rate_end || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, day_rate_end: Number.parseFloat(e.target.value) })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    step="0.01"
                                    required
                                />
                            </div>
                            {/* Night rate end input */}
                            <div>
                                <label htmlFor="night_rate_end" className="block text-sm font-medium text-gray-700">
                                    Ночной тариф (конец)
                                </label>
                                <input
                                    type="number"
                                    id="night_rate_end"
                                    value={newTariff.night_rate_end || ""}
                                    onChange={(e) => setNewTariff({ ...newTariff, night_rate_end: Number.parseFloat(e.target.value) })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    step="0.01"
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