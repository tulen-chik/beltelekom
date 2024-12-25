import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {

    const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .order('start_date', { ascending: false })

    if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'Failed to fetch tariff' }, { status: 500 })
    }

    if (!data) {
        return NextResponse.json({ error: 'No tariff found for the given zone and date' }, { status: 404 })
    }

    console.log(`Found tariff:`, data)

    return NextResponse.json(data)
}
