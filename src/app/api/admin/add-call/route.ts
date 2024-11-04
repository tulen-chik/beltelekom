import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string };

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { userId, date, code, duration, amount, callType } = req.body;

        if (!userId || !date || !code || !duration || !amount || !callType) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        await sql`
      INSERT INTO calls (user_id, date, code, duration, amount, call_type)
      VALUES (${userId}, ${date}, ${code}, ${duration}, ${amount}, ${callType})
    `;

        res.status(201).json({ message: 'Call record added successfully' });
    } catch (error) {
        console.error('Error adding call record:', error);
        res.status(500).json({ message: 'Error adding call record' });
    }
}