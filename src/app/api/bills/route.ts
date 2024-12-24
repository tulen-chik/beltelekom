import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { subscriber_id, start_date, end_date, amount, details } = body

        // Проверка наличия всех необходимых полей
        if (!subscriber_id || !start_date || !end_date || !amount || !details) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Проверка валидности дат
        const startDate = new Date(start_date)
        const endDate = new Date(end_date)
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
        }

        // Проверка валидности суммы
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        // Создание счета в базе данных
        const { data, error } = await supabase
            .from('bills')
            .insert({
                subscriber_id,
                start_date,
                end_date,
                amount,
                details
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating bill:', error)
            return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
        }

        console.log('Bill created successfully:', data)
        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}

