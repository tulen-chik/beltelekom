import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1]
        if (!token) {
            return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
        }

        const decoded = await verifyToken(token)
        if (decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Нет доступа' }, { status: 403 })
        }

        const { userId, callDate, callType, serviceName, quantity, code, minutes, amount } = await request.json()

        if (!userId || !callDate || !callType || !amount) {
            return NextResponse.json({ message: 'Обязательные поля отсутствуют' }, { status: 400 })
        }

        await sql`
      INSERT INTO calls (user_id, call_date, call_type, service_name, quantity, code, minutes, amount)
      VALUES (${userId}, ${callDate}, ${callType}, ${serviceName}, ${quantity}, ${code}, ${minutes}, ${amount})
    `

        return NextResponse.json({ message: 'Звонок успешно добавлен' }, { status: 201 })
    } catch (error) {
        console.error('Error adding call:', error)
        return NextResponse.json({ message: 'Ошибка при добавлении звонка' }, { status: 500 })
    }
}