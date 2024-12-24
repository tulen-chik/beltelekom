import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')

    if (!number) {
        return NextResponse.json({ error: 'Номер абонента не указан' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    try {
        const { data: subscriber, error } = await supabase
            .from('subscribers')
            .select('*')
            .eq('subscriber_number', number)
            .single()

        if (error) throw error

        if (!subscriber) {
            return NextResponse.json(null)
        }

        return NextResponse.json(subscriber)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Ошибка при поиске абонента' }, { status: 500 })
    }
}