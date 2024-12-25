import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const subscriber_id = searchParams.get('subscriber_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    if (!subscriber_id || !start_date || !end_date) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    console.log(`Fetching calls for subscriber ${subscriber_id} from ${start_date} to ${end_date}`)

    const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('subscriber_id', subscriber_id)
        .gte('call_date', start_date)
        .lte('call_date', end_date)
        .order('call_date', { ascending: true })

    if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
    }

    console.log(`Found ${data.length} calls`)

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { zone_code, call_date, start_time, duration, subscriber_id } = body

        // Проверка наличия всех необходимых полей
        if (!zone_code || !call_date || !start_time || !duration || !subscriber_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Создание звонка в базе данных
        const { data, error } = await supabase
            .from('calls')
            .insert({
                zone_code,
                call_date,
                start_time,
                duration,
                subscriber_id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating call:', error)
            return NextResponse.json({ error: 'Failed to create call' }, { status: 500 })
        }

        console.log('Call created successfully:', data)
        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}