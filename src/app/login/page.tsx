"use client"

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
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            if (isLogin) {
                // Логин пользователя
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (authError) throw authError

                // Получаем профиль пользователя
                const { data: profile, error: profileError } = await supabase
                    .from("subscribers_profiles")
                    .select("*")
                    .eq("subscriber_id", data.user.id)
                    .single()

                if (profileError) throw profileError
                if (profile.deleted) throw new Error("Этот аккаунт был удален")

                // Сохраняем данные в куки
                Cookies.set("userRole", profile.role, { expires: 7 })
                Cookies.set("userProfile", JSON.stringify(profile), { expires: 7 })

                // Редирект
                router.push(profile.role === "admin" ? "/admin" : "/user")
            } else {
                // Регистрация нового пользователя
                if (password !== confirmPassword) {
                    throw new Error("Пароли не совпадают")
                }
                if (password.length < 6) {
                    throw new Error("Пароль должен содержать минимум 6 символов")
                }

                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone_number: phoneNumber,
                            address: address,
                            custom_role: isAdmin ? "admin" : "user"
                        }
                    }
                })

                if (authError) throw authError
                if (!authData.user) throw new Error("Не удалось создать пользователя")

                // Обработка подтверждения email
                if (authData.user.identities && authData.user.identities.length > 0) {
                    setError("Регистрация успешна! Проверьте вашу почту для подтверждения.")
                    setIsLogin(true)
                } else {
                    // Если подтверждение не требуется, ждем создания профиля
                    const profile = await waitForProfileCreation(authData.user.id)

                    Cookies.set("userRole", profile.role, { expires: 7 })
                    Cookies.set("userProfile", JSON.stringify(profile), { expires: 7 })
                    router.push(profile.role === "admin" ? "/admin" : "/user")
                }
            }
        } catch (error) {
            console.error("Auth error:", error)
            setError(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const waitForProfileCreation = async (userId: string, attempts = 0): Promise<any> => {
        if (attempts > 5) throw new Error("Профиль не был создан. Попробуйте войти позже.")

        const { data: profile, error } = await supabase
            .from("subscribers_profiles")
            .select("*")
            .eq("subscriber_id", userId)
            .single()

        if (error || !profile) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return waitForProfileCreation(userId, attempts + 1)
        }

        return profile
    }

    const getErrorMessage = (error: any) => {
        if (!error.message) return "Произошла неизвестная ошибка"

        if (error.message.includes("User already registered")) {
            return "Пользователь с таким email уже зарегистрирован"
        }
        if (error.message.includes("Password should be at least")) {
            return "Пароль должен содержать минимум 6 символов"
        }
        if (error.message.includes("Email link")) {
            return "Письмо с подтверждением отправлено на вашу почту"
        }
        return error.message
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            {isLogin ? "Вход в систему" : "Регистрация"}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isLogin ? "Введите ваш email и пароль" : "Создайте новую учетную запись"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Электронная почта
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Пароль
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {!isLogin && (
                                <>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                            Подтвердите пароль
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                            Полное имя
                                        </label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                            Номер телефона
                                        </label>
                                        <input
                                            id="phoneNumber"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                            Адрес
                                        </label>
                                        <input
                                            id="address"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="isAdmin"
                                            type="checkbox"
                                            checked={isAdmin}
                                            onChange={(e) => setIsAdmin(e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                                            Зарегистрироваться как администратор
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                                        {isLogin ? "Вход..." : "Регистрация..."}
                  </span>
                                ) : isLogin ? "Войти" : "Зарегистрироваться"}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError("")
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}