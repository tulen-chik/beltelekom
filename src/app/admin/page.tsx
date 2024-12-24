import AdminPanel from '@/components/AdminPanel'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const cookieStore = cookies()
    const userRole = (await cookieStore).get('userRole')
    const userProfile = (await cookieStore).get('userProfile')

    if (!userRole || !userProfile) {
        redirect('/login')
    }

    const profile = JSON.parse(userProfile.value)

    if (profile.role !== 'admin') {
        redirect('/')
    }

    return <AdminPanel />
}

