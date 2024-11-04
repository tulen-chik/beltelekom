import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
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

        res.status(200).json({
            localServices: localServices.rows,
            wireServices: wireServices.rows,
            longDistanceCalls: longDistanceCalls.rows,
            internationalCalls: internationalCalls.rows,
            billingSummary: billingSummary.rows[0],
        });
    } catch (error) {
        console.error('Error fetching billing statement:', error);
        res.status(500).json({ message: 'Error fetching billing statement' });
    }
}