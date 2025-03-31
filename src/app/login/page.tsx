"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { supabase } from "@/lib/supabase"
import Cookies from "js-cookie"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [address, setAddress] = useState("")
    const [isAdmin, setIsAdmin] = useState(false) // Новое состояние для чекбокса
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        if (!isLogin && password !== confirmPassword) {
            setError("Пароли не совпадают")
            setIsLoading(false)
            return
        }

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) throw error

                // Проверка на удаленного пользователя
                const { data: profile, error: profileError } = await supabase
                    .from("subscribers_profiles")
                    .select("*")
                    .eq("subscriber_id", data.user.id)
                    .single()

                if (profileError) throw profileError

                if (profile.deleted) {
                    throw new Error("Этот аккаунт был удален")
                }

                Cookies.set("userRole", profile.role, { expires: 7 })
                Cookies.set("userProfile", JSON.stringify(profile), { expires: 7 })

                if (profile.role === "admin") {
                    router.push("/admin")
                } else {
                    router.push("/user")
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone_number: phoneNumber,
                            address: address,
                        }
                    }
                })

                if (error) throw error

                const { error: profileError } = await supabase.from("subscribers_profiles").insert([
                    {
                        subscriber_id: data.user?.id,
                        category: "1",
                        role: isAdmin ? "admin" : "user", // Используем состояние чекбокса
                        raw_user_meta_data: {
                            full_name: fullName,
                            phone_number: phoneNumber,
                            address: address,
                        },
                        subscriber_id_substring: data.user?.id,
                    },
                ])

                if (profileError) throw profileError

                setIsLogin(true)
                setError("Регистрация успешна. Пожалуйста, войдите в систему.")
            }
        } catch (error) {
            setError((error as Error).message || (isLogin ? "Неверный логин или пароль" : "Ошибка при регистрации"))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{isLogin ? "Вход в систему" : "Регистрация"}</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isLogin ? "Введите ваш электронный адрес и пароль" : "Создайте новую учетную запись"}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-2xl font-medium text-gray-900">
                                    Электронный адрес
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-2xl font-medium text-gray-900">
                                    Пароль
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {!isLogin && (
                                <>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-2xl font-medium text-gray-900">
                                            Подтвердите пароль
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="fullName" className="block text-2xl font-medium text-gray-900">
                                            Полное имя
                                        </label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-2xl font-medium text-gray-900">
                                            Номер телефона
                                        </label>
                                        <input
                                            id="phoneNumber"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                            className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-2xl font-medium text-gray-900">
                                            Адрес
                                        </label>
                                        <input
                                            id="address"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="isAdmin"
                                            type="checkbox"
                                            checked={isAdmin}
                                            onChange={(e) => setIsAdmin(e.target.checked)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="isAdmin" className="ml-2 block text-lg text-gray-900">
                                            Зарегистрироваться как администратор
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && <div className="text-red-600 text-center">{error}</div>}

                        <div className="flex flex-col items-center space-y-4">
                            <button
                                type="submit"
                                className="w-48 h-12 text-lg bg-gray-200 hover:bg-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                {isLoading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError("")
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {isLogin ? "Создать новый аккаунт" : "Уже есть аккаунт? Войти"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}