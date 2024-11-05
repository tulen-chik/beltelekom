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

        // Получаем звонки пользователя из базы данных
        const result = await sql`
      SELECT * FROM calls
      WHERE user_id = ${decoded.userId}
      ORDER BY call_date DESC
    `

        // Форматируем данные для ответа
        const calls = result.rows.map(call => ({
            id: call.id,
            callDate: call.call_date,
            callType: call.call_type,
            serviceName: call.service_name,
            quantity: call.quantity,
            code: call.code,
            minutes: call.minutes,
            amount: parseFloat(call.amount)
        }))

        // Возвращаем отформатированные данные
        return NextResponse.json({ calls }, { status: 200 })
    } catch (error) {
        console.error('Error fetching user calls:', error)
        return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 })
    }
}