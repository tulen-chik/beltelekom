import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string };

        if (decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied. Admin only.' }, { status: 403 });
        }

        const { userId, date, code, duration, amount, callType } = await req.json();

        if (!userId || !date || !code || !duration || !amount || !callType) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        await sql`
      INSERT INTO calls (user_id, date, code, duration, amount, call_type)
      VALUES (${userId}, ${date}, ${code}, ${duration}, ${amount}, ${callType})
    `;

        return NextResponse.json({ message: 'Call record added successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error adding call record:', error);
        return NextResponse.json({ message: 'Error adding call record' }, { status: 500 });
    }
}
