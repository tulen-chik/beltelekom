"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash, Edit, X } from "lucide-react"

interface Subscriber {
    subscriber_id: string
    money: number
    category: string
    role: string
    subscriber_id_substring: string
    raw_user_meta_data: {
        full_name: string
        phone_number: string
        address: string
    }
}

export default function ProfilesSection() {
    const [profiles, setProfiles] = useState<Subscriber[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [selectedProfile, setSelectedProfile] = useState<Subscriber | null>(null)
    const [newProfile, setNewProfile] = useState<Partial<Subscriber>>({
        money: 0,
        category: "0.5",
        role: "user",
        subscriber_id_substring: "",
        raw_user_meta_data: {
            full_name: "",
            phone_number: "",
            address: "",
        },
    })

    // Загрузка профилей
    const fetchProfiles = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.from("subscribers_profiles").select("*")
            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error("Ошибка получения профилей:", error)
            setError("Не удалось загрузить профили. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

    // Открытие модального окна для создания или редактирования
    const openModal = (profile: Subscriber | null = null) => {
        if (profile) {
            setSelectedProfile(profile)
            setNewProfile(profile)
            setIsEditing(true)
        } else {
            setNewProfile({
                money: 0,
                category: "0.5",
                role: "user",
                subscriber_id_substring: "",
                raw_user_meta_data: {
                    full_name: "",
                    phone_number: "",
                    address: "",
                },
            })
            setIsEditing(false)
        }
        setIsModalOpen(true)
    }

    // Закрытие модального окна
    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedProfile(null)
        setNewProfile({
            money: 0,
            category: "0.5",
            role: "user",
            subscriber_id_substring: "",
            raw_user_meta_data: {
                full_name: "",
                phone_number: "",
                address: "",
            },
        })
    }

    // Создание или обновление профиля
    const handleSaveProfile = async () => {
        if (
            newProfile.subscriber_id_substring &&
            newProfile.raw_user_meta_data?.full_name &&
            newProfile.raw_user_meta_data?.phone_number &&
            newProfile.raw_user_meta_data?.address
        ) {
            setLoading(true)
            setError(null)
            try {
                if (isEditing && selectedProfile) {
                    // Обновление профиля
                    const { data, error } = await supabase
                        .from("subscribers_profiles")
                        .update(newProfile)
                        .eq("subscriber_id", selectedProfile.subscriber_id)
                    if (error) throw error
                    console.log("Профиль успешно обновлен:", data)
                    alert("Профиль успешно обновлен!")
                } else {
                    // Создание профиля
                    const { data, error } = await supabase.from("subscribers_profiles").insert(newProfile)
                    if (error) throw error
                    console.log("Профиль успешно создан:", data)
                    alert("Профиль успешно создан!")
                }
                closeModal()
                fetchProfiles()
            } catch (error) {
                console.error("Ошибка сохранения профиля:", error)
                setError("Не удалось сохранить профиль. Пожалуйста, попробуйте снова.")
            } finally {
                setLoading(false)
            }
        } else {
            setError("Пожалуйста, заполните все обязательные поля.")
        }
    }

    // Удаление профиля
    const handleDeleteProfile = async (subscriberId: string) => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from("subscribers_profiles").delete().eq("subscriber_id", subscriberId)
            if (error) throw error
            alert("Профиль успешно удален!")
            fetchProfiles()
        } catch (error) {
            console.error("Ошибка удаления профиля:", error)
            setError("Не удалось удалить профиль. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Управление профилями</h2>
            <button
                onClick={() => openModal()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center mb-4"
            >
                <Plus className="mr-2 h-5 w-5" />
                Создать профиль
            </button>

            {loading && <p className="text-center text-gray-600">Загрузка профилей...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Имя</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Телефон</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Адрес</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {profiles.map((profile) => (
                        <tr key={profile.subscriber_id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-800">{profile.raw_user_meta_data.full_name}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{profile.raw_user_meta_data.phone_number}</td>
                            <td className="py-2 px-4 text-sm text-gray-800">{profile.raw_user_meta_data.address}</td>
                            <td className="py-2 px-4 text-sm text-gray-800 flex space-x-2">
                                <button
                                    onClick={() => openModal(profile)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteProfile(profile.subscriber_id)}
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

            {/* Модальное окно создания/редактирования профиля */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {isEditing ? "Редактировать профиль" : "Создать профиль"}
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
                                handleSaveProfile()
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                                    Полное имя
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    value={newProfile.raw_user_meta_data?.full_name || ""}
                                    onChange={(e) =>
                                        setNewProfile({
                                            ...newProfile,
                                            raw_user_meta_data: {
                                                ...newProfile.raw_user_meta_data!,
                                                full_name: e.target.value,
                                            },
                                        })
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                    Номер телефона
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    value={newProfile.raw_user_meta_data?.phone_number || ""}
                                    onChange={(e) =>
                                        setNewProfile({
                                            ...newProfile,
                                            raw_user_meta_data: {
                                                ...newProfile.raw_user_meta_data!,
                                                phone_number: e.target.value,
                                            },
                                        })
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Адрес
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    value={newProfile.raw_user_meta_data?.address || ""}
                                    onChange={(e) =>
                                        setNewProfile({
                                            ...newProfile,
                                            raw_user_meta_data: {
                                                ...newProfile.raw_user_meta_data!,
                                                address: e.target.value,
                                            },
                                        })
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="subscriber_id_substring" className="block text-sm font-medium text-gray-700">
                                    ID подписчика
                                </label>
                                <input
                                    type="text"
                                    id="subscriber_id_substring"
                                    value={newProfile.subscriber_id_substring || ""}
                                    onChange={(e) =>
                                        setNewProfile({
                                            ...newProfile,
                                            subscriber_id_substring: e.target.value,
                                        })
                                    }
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