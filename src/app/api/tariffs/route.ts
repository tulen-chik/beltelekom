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

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { zone_code, name, start_date, day_rate_start, night_rate_start, end_date, day_rate_end, night_rate_end } = body

        // Проверка наличия всех необходимых полей
        if (!zone_code || !name || !start_date || !end_date || day_rate_start === undefined || night_rate_start === undefined || day_rate_end === undefined || night_rate_end === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Создание тарифа в базе данных
        const { data, error } = await supabase
            .from('tariffs')
            .insert({
                zone_code,
                name,
                start_date,
                day_rate_start,
                night_rate_start,
                end_date,
                day_rate_end,
                night_rate_end
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating tariff:', error)
            return NextResponse.json({ error: 'Failed to create tariff' }, { status: 500 })
        }

        console.log('Tariff created successfully:', data)
        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const zoneCode = searchParams.get('zone_code');

        if (!zoneCode) {
            return NextResponse.json({ error: 'Missing zone_code parameter' }, { status: 400 });
        }

        const { error } = await supabase
            .from('tariffs')
            .delete()
            .eq('zone_code', zoneCode);

        if (error) {
            console.error('Error deleting tariff:', error);
            return NextResponse.json({ error: 'Failed to delete tariff' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Tariff deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}