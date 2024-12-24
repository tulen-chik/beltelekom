import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserBillsComponent from '@/components/UserBillsComponent'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import {createClient} from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)


export default async function UserBillsPage() {
    // Await the cookies
    const cookieStore = await cookies()
    const userProfile = cookieStore.get('userProfile')

    if (!userProfile) {
        console.log("login")
        redirect('/login')
    }

    const profile = JSON.parse(userProfile.value)

    // Create a session object using subscriber_id
    const session = { user: { id: profile.subscriber_id } }

    if (!session.user.id) {

        redirect('/login')
    }
    console.log(session.user.id)
    console.log('Fetching bills for subscriber_id:', session.user.id)

    const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('subscriber_id', session.user.id)
    if (error) {
        console.error('Error fetching bills:', error)
    } else {
        console.log('Number of bills fetched:', bills ? bills.length : 0)
        if (bills && bills.length > 0) {
            console.log('First bill:', bills[0])
        }
    }
    return <UserBillsComponent initialBills={bills || []} userId={session.user.id} />
}