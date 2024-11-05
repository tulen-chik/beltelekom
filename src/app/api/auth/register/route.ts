import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password, role = 'user' } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
        }

        // Check if username already exists
        const existingUser = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;

        if (existingUser.rows.length > 0) {
            return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await sql`
      INSERT INTO users (username, password, role)
      VALUES (${username}, ${hashedPassword}, ${role})
      RETURNING id, username, role
    `;

        const newUser = result.rows[0];

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
    }
}