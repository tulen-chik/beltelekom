import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { subscriber_number, password, role = 'user', address, full_name, category } = await request.json();

        // Validate input
        if (!subscriber_number || !password) {
            return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
        }

        // Check if username already exists
        const existingUser = await sql`
      SELECT * FROM subscribers WHERE subscriber_number = ${subscriber_number}
    `;

        if (existingUser.rows.length > 0) {
            return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await sql`
      INSERT INTO subscribers (subscriber_number, password, role, address, full_name, category)
      VALUES (${subscriber_number}, ${hashedPassword}, ${role}, ${address}, ${full_name}, ${category})
      RETURNING id, subscriber_number, role
    `;

        const newUser = result.rows[0];

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                subscriber_number: newUser.subscriber_number,
                role: newUser.role
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
    }
}