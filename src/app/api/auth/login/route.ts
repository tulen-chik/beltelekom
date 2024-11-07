import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

const loginAttempts = new Map();

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
        }

        // Check if the user is locked out
        const userAttempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
        const currentTime = Date.now();

        if (userAttempts.count >= MAX_ATTEMPTS && currentTime - userAttempts.lastAttempt < LOCKOUT_TIME) {
            const remainingLockoutTime = Math.ceil((LOCKOUT_TIME - (currentTime - userAttempts.lastAttempt)) / 1000 / 60);
            return NextResponse.json({ message: `Too many failed attempts. Please try again in ${remainingLockoutTime} minutes.` }, { status: 429 });
        }

        const result = await sql`
      SELECT id, password, role FROM users WHERE username = ${username}
    `;

        if (result.rows.length === 0) {
            updateLoginAttempts(username);
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch && user.role === 'admin') {
            updateLoginAttempts(username);
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Successful login: reset attempts and generate token
        loginAttempts.delete(username);
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        return NextResponse.json({ token, role: user.role });
    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json({ message: 'Error logging in' }, { status: 500 });
    }
}

function updateLoginAttempts(username: string) {
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(username, attempts);
}