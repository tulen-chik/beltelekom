import AdminPanel from '@/components/AdminPanel'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Admin Page Component
 * Server-side rendered page that provides access to the admin panel
 * Features:
 * - Authentication check using cookies
 * - Role-based access control (admin only)
 * - Redirects to login if not authenticated
 * - Redirects to home if not admin
 * - Renders the AdminPanel component
 */
export default async function AdminPage() {
    // Get user role and profile from cookies
    const cookieStore = cookies()
    const userRole = (await cookieStore).get('userRole')
    const userProfile = (await cookieStore).get('userProfile')

    // Redirect to login if no user role or profile found
    if (!userRole || !userProfile) {
        redirect('/login')
    }

    // Parse user profile from cookie
    const profile = JSON.parse(userProfile.value)

    // Redirect to home if user is not an admin
    if (profile.role !== 'admin') {
        redirect('/')
    }

    // Render the admin panel component
    return <AdminPanel />
}

