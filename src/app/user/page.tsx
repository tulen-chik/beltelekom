import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserBillsComponent from '@/components/UserBillsComponent'
import {supabase} from "@/lib/supabase";

/**
 * User Bills Page Component
 * Server-side rendered page that displays bills for the authenticated user
 * Features:
 * - Authentication check using cookies
 * - Fetches user's bills from Supabase
 * - Fetches user's profile information
 * - Redirects to login if not authenticated
 * - Displays bills using UserBillsComponent
 */
export default async function UserBillsPage() {
    // Get user profile from cookies
    const cookieStore = await cookies()
    const userProfile = cookieStore.get('userProfile')

    // Redirect to login if no user profile found
    if (!userProfile) {
        console.log("login")
        redirect('/login')
    }

    // Parse user profile from cookie
    const profile = JSON.parse(userProfile.value)

    // Create session object with subscriber_id
    const session = { user: { id: profile.subscriber_id } }

    // Redirect to login if no subscriber_id found
    if (!session.user.id) {
        redirect('/login')
    }

    console.log(session.user.id)
    console.log('Fetching bills for subscriber_id:', session.user.id)

    // Fetch user's bills from Supabase
    const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('subscriber_id', session.user.id)

    // Fetch user's profile information from Supabase
    const { data, error: userError } = await supabase
        .from('subscribers_profiles')
        .select('*')
        .filter('subscriber_id_substring', 'eq', session.user.id) // Search by substring
        .single()

    // Log any errors or successful bill fetching
    if (error) {
        console.error('Error fetching bills:', error)
    } else {
        console.log('Number of bills fetched:', bills ? bills.length : 0)
        if (bills && bills.length > 0) {
            console.log('First bill:', bills[0])
        }
    }

    // Render the UserBillsComponent with fetched data
    return <UserBillsComponent initialBills={bills || []} userId={data} />
}