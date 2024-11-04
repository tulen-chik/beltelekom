'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                // Store the token and role
                localStorage.setItem('token', data.token)
                localStorage.setItem('userRole', data.role)

                // Redirect based on role
                if (data.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/billing')
                }
            } else {
                setError(data.message || "Неверный логин или пароль")
            }
        } catch (error) {
            setError("Произошла ошибка при входе в систему")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-2xl font-medium text-gray-900"
                                >
                                    Логин
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="mt-1 block w-full text-lg py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-2xl font-medium text-gray-900"
                                >
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
                        </div>

                        {error && (
                            <div className="text-red-600 text-center">{error}</div>
                        )}

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="w-32 h-12 text-lg bg-gray-200 hover:bg-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                {isLoading ? "Вход..." : "Войти"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}