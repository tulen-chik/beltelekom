import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    if (!search) {
        return NextResponse.json({ error: 'Search parameter is required' }, { status: 400 })
    }

    // Searching by phone number in the raw_user_meta_data JSONB field
    const { data, error } = await supabase
        .from('subscribers_profiles')
        .select('*')
        .filter('raw_user_meta_data->>phone_number', 'like', `%${search}%`) // Search by phone_number
        .limit(10)

    console.log(data)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}