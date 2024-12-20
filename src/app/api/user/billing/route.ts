import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        // Получаем токен из заголовка Authorization
        const token = request.headers.get('Authorization')?.split(' ')[1]
        if (!token) {
            return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
        }

        // Проверяем токен и получаем данные пользователя
        const decoded = await verifyToken(token)
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 })
        }

        // Получаем данные о счетах пользователя из базы данных
        const result = await sql`
      SELECT * FROM billing_summary
      WHERE user_id = ${decoded.userId}
      ORDER BY month DESC
    `

        // Форматируем данные для ответа
        const billingSummaries = result.rows.map(billing => ({
            id: billing.id,
            month: billing.month,
            total_charges: parseFloat(billing.total_charges),
            previous_balance: parseFloat(billing.previous_balance),
            payments_received: parseFloat(billing.payments_received),
            current_balance: parseFloat(billing.current_balance)
        }))

        // Возвращаем отформатированные данные
        return NextResponse.json({ billingSummaries }, { status: 200 })
    } catch (error) {
        console.error('Error fetching user billing summaries:', error)
        return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 })
    }
}
