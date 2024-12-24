import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')

    if (!number) {
        return NextResponse.json({ error: 'Номер абонента не указан' }, { status: 400 })
    }

    try {
        const result = await sql`
      SELECT * FROM subscribers
      WHERE subscriber_number = ${number}
    `

        if (result.rows.length === 0) {
            return NextResponse.json(null)
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Ошибка при поиске абонента' }, { status: 500 })
    }
}