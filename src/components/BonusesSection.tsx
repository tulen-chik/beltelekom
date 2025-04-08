"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash, Edit, X, Search, Gift, Calendar, User } from "lucide-react"
import type { Bill, Subscriber } from "../types/index"
import DateRangePicker from "./DateRangePicker"

interface Bonus {
    id: string
    bill_id: string
    subscriber_id: string
    amount: number
    reason: string
    applied: boolean
    created_at: string
    applied_at: string | null
}

export default function BonusesSection() {
    const [bonuses, setBonuses] = useState<Bonus[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null)
    const [newBonus, setNewBonus] = useState<Partial<Bonus>>({
        bill_id: "",
        subscriber_id: "",
        amount: 0,
        reason: "",
        applied: false,
    })
    const [bills, setBills] = useState<Bill[]>([])
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [searchResults, setSearchResults] = useState<Bill[]>([])
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)

    // Загрузка бонусов
    const fetchBonuses = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from("bonuses")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setBonuses(data || [])
        } catch (error) {
            console.error("Ошибка загрузки бонусов:", error)
            setError("Не удалось загрузить бонусы. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Загрузка счетов и абонентов
    const fetchBillsAndSubscribers = async () => {
        setLoading(true)
        try {
            // Загрузка счетов
            const { data: billsData, error: billsError } = await supabase
                .from("bills")
                .select("*")
                .order("created_at", { ascending: false })

            // Загрузка абонентов
            const { data: subscribersData, error: subscribersError } = await supabase
                .from("subscribers_profiles")
                .select("*")

            if (billsError) throw billsError
            if (subscribersError) throw subscribersError

            setBills(billsData || [])
            setSubscribers(subscribersData || [])
        } catch (error) {
            console.error("Ошибка загрузки данных:", error)
            setError("Не удалось загрузить данные. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBonuses()
        fetchBillsAndSubscribers()
    }, [])

    // Поиск счетов
    const handleSearch = async () => {
        setLoading(true)
        setError(null)
        try {
            let filtered = [...bills]

            // Фильтрация по поисковому запросу (ID счета, имя абонента)
            if (searchTerm) {
                filtered = filtered.filter(bill => {
                    const subscriber = subscribers.find(s => s.subscriber_id === bill.subscriber_id)
                    const subscriberName = subscriber?.raw_user_meta_data?.full_name || ""

                    return (
                        bill.id.includes(searchTerm) ||
                        subscriberName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                })
            }

            // Фильтрация по дате
            if (startDate && endDate) {
                filtered = filtered.filter(bill => {
                    const billDate = new Date(bill.created_at)
                    return billDate >= startDate && billDate <= endDate
                })
            }

            setSearchResults(filtered)
        } catch (error) {
            console.error("Ошибка поиска счетов:", error)
            setError("Не удалось выполнить поиск. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Управление модальным окном
    const openModal = (bonus: Bonus | null = null) => {
        if (bonus) {
            setSelectedBonus(bonus)
            setNewBonus(bonus)
            setIsEditing(true)
        } else {
            setNewBonus({
                bill_id: "",
                subscriber_id: "",
                amount: 0,
                reason: "",
                applied: false,
            })
            setIsEditing(false)
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedBonus(null)
        setNewBonus({
            bill_id: "",
            subscriber_id: "",
            amount: 0,
            reason: "",
            applied: false,
        })
        setSearchTerm("")
        setSearchResults([])
        setStartDate(undefined)
        setEndDate(undefined)
    }

    // Сохранение бонуса
    const handleSaveBonus = async () => {
        if (!newBonus.bill_id || !newBonus.amount || !newBonus.reason) {
            setError("Пожалуйста, заполните все обязательные поля")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Проверяем существование счета
            const { data: bill, error: billError } = await supabase
                .from("bills")
                .select("*")
                .eq("id", newBonus.bill_id)
                .single()

            if (billError || !bill) {
                throw new Error("Указанный счет не существует")
            }

            // Проверяем, что сумма бонуса не превышает сумму счета
            if (newBonus.amount > bill.amount) {
                throw new Error("Сумма бонуса не может превышать сумму счета")
            }

            if (isEditing && selectedBonus) {
                const { data, error } = await supabase
                    .from("bonuses")
                    .update(newBonus)
                    .eq("id", selectedBonus.id)
                    .select()
                    .single()

                if (error) throw error

                // Если применяем бонус сейчас
                if (newBonus.applied && !selectedBonus.applied) {
                    const result = await applyBonusToBill(data)
                    if (!result.success) throw new Error(result.message)
                }

                alert("Бонус успешно обновлен!")
            } else {
                const { data, error } = await supabase
                    .from("bonuses")
                    .insert(newBonus)
                    .select()
                    .single()

                if (error) throw error

                // Если применяем сразу
                if (newBonus.applied) {
                    const result = await applyBonusToBill(data)
                    if (!result.success) throw new Error(result.message)
                }

                alert("Бонус успешно создан!")
            }

            closeModal()
            fetchBonuses()
        } catch (error) {
            console.error("Ошибка сохранения бонуса:", error)
            setError(error instanceof Error ? error.message : "Не удалось сохранить бонус. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Применение бонуса к счету
// Применение бонуса к счету
    const applyBonusToBill = async (bonus: Bonus) => {
        try {
            // 1. Проверка состояния бонуса
            if (bonus.applied) {
                throw new Error(`Бонус ${bonus.id} уже был применен ранее`);
            }

            // 2. Получение счета с транзакционной блокировкой
            const { data: bill, error: billError } = await supabase
                .from('bills')
                .select('*')
                .eq('id', bonus.bill_id)
                .single();

            if (billError || !bill) {
                throw new Error(`Счет ${bonus.bill_id} не найден: ${billError?.message || 'Неизвестная ошибка'}`);
            }

            // 3. Проверка суммы
            if (bonus.amount > bill.amount) {
                throw new Error(
                    `Сумма бонуса (${bonus.amount} ₽) превышает сумму счета (${bill.amount} ₽)`
                );
            }

            // 4. Обновление счета
            const newAmount = Number((bill.amount - bonus.amount).toFixed(2));
            const { error: updateError } = await supabase
                .from('bills')
                .update({ amount: newAmount })
                .eq('id', bonus.bill_id);

            if (updateError) {
                throw new Error(`Ошибка обновления счета: ${updateError.message}`);
            }

            // 5. Отметка бонуса как примененного
            const { error: bonusError } = await supabase
                .from('bonuses')
                .update({
                    applied: true,
                    applied_at: new Date().toISOString()
                })
                .eq('id', bonus.id);

            if (bonusError) {
                // Откат изменений счета
                await supabase
                    .from('bills')
                    .update({ amount: bill.amount })
                    .eq('id', bonus.bill_id);

                throw new Error(`Не удалось отметить бонус как примененный: ${bonusError.message}`);
            }

            return {
                success: true,
                message: `Бонус на сумму ${bonus.amount} ₽ успешно применен к счету ${bonus.bill_id}`
            };

        } catch (error) {
            console.error('Полная ошибка применения бонуса:', {
                error,
                bonusId: bonus.id,
                billId: bonus.bill_id,
                amount: bonus.amount
            });

            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при обработке бонуса'
            };
        }
    };

    // Удаление бонуса
    const handleDeleteBonus = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить этот бонус?")) return

        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from("bonuses").delete().eq("id", id)
            if (error) throw error
            alert("Бонус успешно удален!")
            fetchBonuses()
        } catch (error) {
            console.error("Ошибка удаления бонуса:", error)
            setError("Не удалось удалить бонус. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    // Получение имени абонента по ID
    const getSubscriberName = (subscriberId: string) => {
        const subscriber = subscribers.find(s => s.subscriber_id === subscriberId)
        return subscriber?.raw_user_meta_data?.full_name || subscriberId
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Gift className="mr-2 h-6 w-6 text-purple-500" />
                Управление бонусами и скидками
            </h2>

            <button
                onClick={() => openModal()}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors flex items-center mb-4"
                disabled={loading}
            >
                <Plus className="mr-2 h-5 w-5" />
                Создать бонус
            </button>

            {loading && <p className="text-center text-gray-600">Загрузка...</p>}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">ID счета</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Абонент</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Сумма</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Причина</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Статус</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {bonuses.map(bonus => (
                        <tr key={bonus.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-800">{bonus.bill_id}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">
                                {getSubscriberName(bonus.subscriber_id)}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bonus.amount.toFixed(2)} ₽</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{bonus.reason}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">
                                {bonus.applied ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Применен
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Ожидает
                                    </span>
                                )}
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-800 flex space-x-2">
                                <button
                                    onClick={() => openModal(bonus)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Редактировать"
                                    disabled={loading}
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteBonus(bonus.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Удалить"
                                    disabled={loading}
                                >
                                    <Trash className="h-5 w-5" />
                                </button>
                                {!bonus.applied && (
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Вы уверены, что хотите применить бонус на сумму ${bonus.amount} ₽ к счету?`)) {
                                                try {
                                                    setLoading(true);
                                                    const result = await applyBonusToBill(bonus);

                                                    if (result.success) {
                                                        alert(result.message);
                                                        await fetchBonuses();
                                                    } else {
                                                        setError(result.message);
                                                    }
                                                } catch (error) {
                                                    const errorMessage = error instanceof Error
                                                        ? error.message
                                                        : "Неизвестная ошибка";
                                                    setError(`Ошибка: ${errorMessage}`);
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                        className="text-green-500 hover:text-green-700"
                                        title="Применить"
                                        disabled={loading}
                                    >
                                        <Gift className="h-5 w-5" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isEditing ? "Редактировать бонус" : "Создать бонус"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={loading}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveBonus() }} className="space-y-4">
                            {/* Поиск счета */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="billSearch" className="block text-sm font-medium text-gray-700">
                                        Поиск счета
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <div className="relative flex-grow">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="billSearch"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                                                placeholder="Поиск по ID счета или имени абонента"
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                                disabled={loading}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className="ml-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition-colors"
                                            disabled={loading}
                                        >
                                            Найти
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Результаты поиска */}
                            {searchResults.length > 0 && (
                                <div className="border rounded divide-y max-h-60 overflow-y-auto">
                                    {searchResults.map(bill => {
                                        const billAmount = bill.amount || 0
                                        return (
                                            <div
                                                key={bill.id}
                                                onClick={() => {
                                                    if (!loading) {
                                                        setNewBonus(prev => ({
                                                            ...prev,
                                                            bill_id: bill.id,
                                                            subscriber_id: bill.subscriber_id,
                                                            amount: Math.min(prev.amount || 0, billAmount)
                                                        }))
                                                        setSearchResults([])
                                                    }
                                                }}
                                                className={`cursor-pointer hover:bg-gray-50 p-3 transition-colors ${loading ? 'opacity-50' : ''}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">Счет №: {bill.id}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Абонент: {getSubscriberName(bill.subscriber_id)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{billAmount.toFixed(2)} ₽</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(bill.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Выбранный счет */}
                            {newBonus.bill_id && (
                                <div className="p-3 border rounded bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Выбранный счет: {newBonus.bill_id}</p>
                                            <p className="text-sm text-gray-600">
                                                Абонент: {getSubscriberName(newBonus.subscriber_id || "")}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!loading) {
                                                    setNewBonus(prev => ({
                                                        ...prev,
                                                        bill_id: "",
                                                        subscriber_id: ""
                                                    }))
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={loading}
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Детали бонуса */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                        Сумма бонуса (₽)
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        min="0"
                                        max={newBonus.bill_id ?
                                            (bills.find(b => b.id === newBonus.bill_id)?.amount || 0)
                                            : undefined}
                                        step="0.01"
                                        value={newBonus.amount || 0}
                                        onChange={(e) => setNewBonus({
                                            ...newBonus,
                                            amount: parseFloat(e.target.value) || 0
                                        })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="applied" className="block text-sm font-medium text-gray-700">
                                        Статус
                                    </label>
                                    <div className="mt-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                id="applied"
                                                checked={newBonus.applied || false}
                                                onChange={(e) => setNewBonus({
                                                    ...newBonus,
                                                    applied: e.target.checked
                                                })}
                                                className="rounded text-purple-600 focus:ring-purple-500"
                                                disabled={loading}
                                            />
                                            <span className="ml-2">Применить сразу</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                                    Причина бонуса/скидки
                                </label>
                                <textarea
                                    id="reason"
                                    value={newBonus.reason || ""}
                                    onChange={(e) => setNewBonus({
                                        ...newBonus,
                                        reason: e.target.value
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    rows={3}
                                    placeholder="Укажите причину предоставления бонуса или скидки"
                                    disabled={loading}
                                />
                            </div>

                            {/* Сообщение об ошибке */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <X className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Кнопки действий */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                    disabled={loading}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                                    disabled={loading || !newBonus.bill_id || !newBonus.amount || !newBonus.reason}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isEditing ? "Сохранение..." : "Создание..."}
                                        </span>
                                    ) : isEditing ? "Сохранить изменения" : "Создать бонус"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}