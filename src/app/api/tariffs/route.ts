import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const zone_code = searchParams.get('zone_code')
    const call_date = searchParams.get('call_date')

    if (!zone_code || !call_date) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    console.log(`Fetching tariff for zone ${zone_code} on date ${call_date}`)

    const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('zone_code', zone_code)
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

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

