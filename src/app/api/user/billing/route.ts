import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'No token provided' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        const userId = decoded.userId;

        // Fetch local services
        const localServices = await sql`
      SELECT * FROM local_services WHERE user_id = ${userId} ORDER BY id
    `;

        // Fetch wire services
        const wireServices = await sql`
      SELECT * FROM wire_services WHERE user_id = ${userId} ORDER BY id
    `;

        // Fetch long distance calls
        const longDistanceCalls = await sql`
      SELECT * FROM long_distance_calls WHERE user_id = ${userId} ORDER BY date
    `;

        // Fetch international calls
        const internationalCalls = await sql`
      SELECT * FROM international_calls WHERE user_id = ${userId} ORDER BY date
    `;

        // Fetch billing summary
        const billingSummary = await sql`
      SELECT * FROM billing_summary WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1
    `;

        return NextResponse.json({
            localServices: localServices.rows,
            wireServices: wireServices.rows,
            longDistanceCalls: longDistanceCalls.rows,
            internationalCalls: internationalCalls.rows,
            billingSummary: billingSummary.rows[0],
        });
    } catch (error) {
        console.error('Error fetching billing statement:', error);
        return NextResponse.json({ message: 'Error fetching billing statement' }, { status: 500 });
    }
}