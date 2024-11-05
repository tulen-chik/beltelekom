'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')

        // Redirect to login page
        router.push('/login')
    }

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
            Выйти
        </button>
    )
}