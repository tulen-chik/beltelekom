"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { supabase } from "@/lib/supabase"
import Cookies from "js-cookie"

/**
 * Authentication Page Component
 * Handles both user login and registration functionality
 * Features:
 * - Toggle between login and registration forms
 * - Form validation and error handling
 * - Integration with Supabase authentication
 * - Cookie-based session management
 * - Role-based redirection (admin/user)
 */
export default function AuthPage() {
    // State management for form fields and UI
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

    /**
     * Handles form submission for both login and registration
     * @param e - Form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            if (isLogin) {
                // User login flow
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (authError) throw authError

                // Fetch user profile
                const { data: profile, error: profileError } = await supabase
                    .from("subscribers_profiles")
                    .select("*")
                    .eq("subscriber_id", data.user.id)
                    .single()

                if (profileError) throw profileError
                if (profile.deleted) throw new Error("Этот аккаунт был удален")

                // Store session data in cookies
                Cookies.set("userRole", profile.role, { expires: 7 })
                Cookies.set("userProfile", JSON.stringify(profile), { expires: 7 })

                // Redirect based on user role
                router.push(profile.role === "admin" ? "/admin" : "/user")
            } else {
                // New user registration flow
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

                // Handle email confirmation
                if (authData.user.identities && authData.user.identities.length > 0) {
                    setError("Регистрация успешна! Проверьте вашу почту для подтверждения.")
                    setIsLogin(true)
                } else {
                    // If no confirmation required, wait for profile creation
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

    /**
     * Waits for user profile creation after registration
     * @param userId - User ID to check
     * @param attempts - Number of attempts made
     * @returns User profile data
     */
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

    /**
     * Formats error messages for user display
     * @param error - Error object
     * @returns Formatted error message
     */
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

    // Render the authentication form
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Form header */}
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            {isLogin ? "Вход в систему" : "Регистрация"}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isLogin ? "Введите ваш email и пароль" : "Создайте новую учетную запись"}
                        </p>
                    </div>

                    {/* Authentication form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            {/* Email input */}
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

                            {/* Password input */}
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

                            {/* Registration form fields */}
                            {!isLogin && (
                                <>
                                    {/* Confirm password input */}
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
                                    {/* Full name input */}
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
                                    {/* Phone number input */}
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
                                    {/* Address input */}
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
                                    {/* Admin role checkbox */}
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
                                            Регистрация как администратор
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Error message display */}
                        {error && (
                            <div className="text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Form actions */}
                        <div className="flex flex-col space-y-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? "Загрузка..." : (isLogin ? "Войти" : "Зарегистрироваться")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="w-full text-sm text-blue-600 hover:text-blue-500"
                            >
                                {isLogin ? "Создать новую учетную запись" : "Уже есть учетная запись? Войти"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}